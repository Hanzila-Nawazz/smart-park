package com.sdaproject.smarparking.service;

import com.sdaproject.smarparking.models.ParkingRecord;
import com.sdaproject.smarparking.models.ParkingSite;
import com.sdaproject.smarparking.repository.ParkingRecordRepository;
import com.sdaproject.smarparking.repository.ParkingSiteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;

@Service
public class ReportService {

    @Autowired
    private ParkingRecordRepository recordRepository;

    @Autowired
    private ParkingSiteRepository siteRepository;

    @Cacheable(value = "revenueReport", unless = "#result == null")
    public Map<String, Object> getRevenueReport() {
        // 1. FAST DB COUNTS (All-Time Stats, Zero Memory Cost)
        long recordCount = recordRepository.count();
        Double totalRevOpt = recordRepository.calculateTotalRevenue();
        double totalRevenue = totalRevOpt != null ? totalRevOpt : 0.0;
        
        // 2. FETCH ONLY LAST 30 DAYS OF DATA FOR CHARTS (Prevents Memory Timeout)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<ParkingRecord> recentRecords = recordRepository.findRecordsSince(thirtyDaysAgo);
        
        List<ParkingRecord> paidRecords = recentRecords.stream()
                .filter(ParkingRecord::isPaid)
                .filter(record -> record.getAmount() != null && record.getAmount() > 0)
                .toList();

        // 3. Process the smaller, recent dataset
        long paidSessions = paidRecords.size(); 
        long unpaidSessions = recentRecords.stream().filter(record -> !record.isPaid()).count();

        List<Map<String, Object>> byDay = buildDailyRevenue(paidRecords);
        List<Map<String, Object>> bySite = buildSiteRevenue(paidRecords);
        List<Map<String, Object>> monthlyTrend = buildMonthlyRevenue(paidRecords);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalRevenue", Math.round(totalRevenue * 100.0) / 100.0);
        summary.put("paidSessions", paidSessions);
        summary.put("unpaidSessions", unpaidSessions);
        summary.put("recordCount", recordCount); 
        summary.put("topSite", bySite.isEmpty() ? "N/A" : String.valueOf(bySite.get(0).get("name")));

        Map<String, Object> response = new HashMap<>();
        response.put("summary", summary);
        response.put("byDay", byDay);
        response.put("bySite", bySite);
        response.put("byMonth", monthlyTrend);
        return response;
    }

    @Cacheable(value = "occupancyReport", unless = "#result == null")
    public List<Map<String, Object>> getOccupancyReport() {
        // Fetch ONLY the last 24 hours of data for the hourly chart
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
        List<ParkingRecord> records = recordRepository.findRecordsSince(yesterday);
        
        Map<Integer, Long> hourlyCounts = new HashMap<>();
        for (int hour = 0; hour < 24; hour++) {
            hourlyCounts.put(hour, 0L);
        }

        for (ParkingRecord record : records) {
            LocalDateTime inTime = record.getParkInTime();
            if (inTime != null) {
                hourlyCounts.put(inTime.getHour(), hourlyCounts.get(inTime.getHour()) + 1);
            }
        }

        List<Map<String, Object>> output = new ArrayList<>();
        for (int hour = 0; hour < 24; hour++) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("hour", formatHour(hour));
            item.put("occupancy", hourlyCounts.get(hour));
            output.add(item);
        }
        return output;
    }

    @Cacheable(value = "siteUtilization", unless = "#result == null")
    public List<Map<String, Object>> getSiteUtilizationReport() {
        List<ParkingSite> sites = siteRepository.findAll();
        List<Map<String, Object>> output = new ArrayList<>();

        for (ParkingSite site : sites) {
            long occupied = recordRepository.findByParkingSite_SiteIdAndParkOutTimeIsNull(site.getSiteId()).size();
            int capacity = site.getMaxSiteCapacity();
            double utilization = capacity <= 0 ? 0.0 : roundTwo((occupied * 100.0) / capacity);

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("name", site.getSiteLocation());
            item.put("uv", utilization);
            item.put("occupied", occupied);
            item.put("capacity", capacity);
            item.put("siteId", site.getSiteId());
            output.add(item);
        }

        return output;
    }

    // Clear cache every 5 minutes to keep data relatively fresh (5 * 60 * 1000 ms)
    @CacheEvict(allEntries = true, cacheNames = {"revenueReport", "occupancyReport", "siteUtilization"})
    @Scheduled(fixedRate = 300000)
    public void clearReportCache() {
        // Cache will be refreshed on next request
    }

    // --- HELPER METHODS ---

    private List<Map<String, Object>> buildDailyRevenue(List<ParkingRecord> records) {
        Map<LocalDate, Double> totals = new HashMap<>();
        for (ParkingRecord record : records) {
            LocalDate date = revenueDate(record).toLocalDate();
            totals.put(date, totals.getOrDefault(date, 0.0) + safeAmount(record));
        }

        return totals.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("day", entry.getKey().toString());
                    row.put("revenue", roundTwo(entry.getValue()));
                    return row;
                })
                .toList();
    }

    private List<Map<String, Object>> buildSiteRevenue(List<ParkingRecord> records) {
        Map<String, Double> totals = new HashMap<>();
        for (ParkingRecord record : records) {
            String siteName = record.getParkingSite() != null ? record.getParkingSite().getSiteLocation() : "Unknown";
            totals.put(siteName, totals.getOrDefault(siteName, 0.0) + safeAmount(record));
        }

        return totals.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue(Comparator.reverseOrder()))
                .map(entry -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("name", entry.getKey());
                    row.put("value", roundTwo(entry.getValue()));
                    return row;
                })
                .toList();
    }

    private List<Map<String, Object>> buildMonthlyRevenue(List<ParkingRecord> records) {
        Map<Month, Double> totals = new HashMap<>();
        for (ParkingRecord record : records) {
            Month month = revenueDate(record).getMonth();
            totals.put(month, totals.getOrDefault(month, 0.0) + safeAmount(record));
        }

        return totals.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("month", entry.getKey().getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
                    row.put("revenue", roundTwo(entry.getValue()));
                    return row;
                })
                .toList();
    }

    private LocalDateTime revenueDate(ParkingRecord record) {
        if (record.getParkOutTime() != null) {
            return record.getParkOutTime();
        }
        if (record.getParkInTime() != null) {
            return record.getParkInTime();
        }
        return LocalDateTime.now();
    }

    private double safeAmount(ParkingRecord record) {
        return record.getAmount() == null ? 0.0 : record.getAmount();
    }

    private double roundTwo(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private String formatHour(int hour) {
        int normalized = hour % 12 == 0 ? 12 : hour % 12;
        String suffix = hour < 12 ? "AM" : "PM";
        return normalized + " " + suffix;
    }
}