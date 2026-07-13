package com.sdaproject.smarparking.service;

import com.sdaproject.smarparking.models.ParkingRecord;
import com.sdaproject.smarparking.models.ParkingSite;
import com.sdaproject.smarparking.models.user;
import com.sdaproject.smarparking.models.builder.ParkingSiteBuilder;
import com.sdaproject.smarparking.repository.ParkingSiteRepository;
import com.sdaproject.smarparking.repository.ParkingRecordRepository;
import com.sdaproject.smarparking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;

import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service 
public class AdminService {

    @Autowired
    private ParkingSiteRepository siteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParkingRecordRepository recordRepository;

    // Admin Feature 1: Add a new site using the BUILDER PATTERN
    public String addNewSite(String siteId, int capacity, String location, double rate) {
        if (siteRepository.existsById(siteId)) {
            return "Error: Site ID already exists!";
        }

        ParkingSite newSite = new ParkingSiteBuilder()
                .setSiteId(siteId)
                .setMaxSiteCapacity(capacity)
                .setSiteLocation(location)
                .setHourlyRate(rate)
                .setOperational(true)
                .build();

        siteRepository.save(newSite);
        // Clear the overview cache when a new site is added
        clearAdminCache();
        return "Success: New parking site added at " + location;
    }

    // Admin Feature 2: Get all sites
    public List<ParkingSite> getAllSites() {
        return siteRepository.findAll();
    }

    // Admin Feature 4: Delete site
    public String deleteSite(String siteId) {
        if (!siteRepository.existsById(siteId)) {
            return "Error: Site not found";
        }
        siteRepository.deleteById(siteId);
        // Clear the overview cache when a site is deleted
        clearAdminCache();
        return "Success: Site deleted";
    }

    // Admin Feature 5: Update existing site
    public String updateSite(String siteId, int capacity, String location, double rate, Boolean operational) {
        Optional<ParkingSite> opt = siteRepository.findById(siteId);
        if (!opt.isPresent()) return "Error: Site not found";
        ParkingSite s = opt.get();
        s.setMaxSiteCapacity(capacity);
        s.setSiteLocation(location);
        s.setHourlyRate(rate);
        if (operational != null) s.setOperational(operational);
        siteRepository.save(s);
        // Clear the overview cache when a site is updated
        clearAdminCache();
        return "Success: Site updated";
    }

    // Admin Feature 3: Search vehicle by License Plate
    public Optional<user> searchVehicle(String vehicleNo) {
        return userRepository.findFirstByVehicleNoOrderByIdDesc(vehicleNo);
    }

    // Admin Feature: Get all registered users
    public List<user> getAllUsers() {
        return userRepository.findAll();
    }

    // LIGHTNING FAST OVERVIEW METHOD with caching
    @Cacheable(value = "adminOverview", unless = "#result == null")
    public Map<String, Object> getOverview() {
        long totalSites = siteRepository.count();
        long activeSites = siteRepository.countByIsOperational(true);
        long registeredUsers = userRepository.count();
        long activeSessions = recordRepository.countByParkOutTimeIsNull();

        Double dbTotalRev = recordRepository.calculateTotalRevenue();
        double totalRevenue = (dbTotalRev != null) ? dbTotalRev : 0.0;

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        Double dbTodayRev = recordRepository.calculateRevenueBetween(startOfDay, endOfDay);
        double todayRevenue = (dbTodayRev != null) ? dbTodayRev : 0.0;

        Map<String, Object> out = new HashMap<>();
        out.put("totalSites", totalSites);
        out.put("activeSites", activeSites);
        out.put("registeredUsers", registeredUsers);
        out.put("activeSessions", activeSessions);
        out.put("totalRevenue", Math.round(totalRevenue * 100.0) / 100.0);
        out.put("todayRevenue", Math.round(todayRevenue * 100.0) / 100.0);
        return out;
    }

    // Clear admin cache every 2 minutes automatically
    @CacheEvict(allEntries = true, cacheNames = "adminOverview")
    @Scheduled(fixedRate = 120000)
    public void clearAdminCache() {
        // Cache will be refreshed on next request
    }

    public Map<String, Object> getPaginatedRecords(int page, int size, String search, String siteId, String status) {
        
        // Let Spring Boot handle OFFSET/LIMIT; ordering is fixed in repository query.
        PageRequest pageRequest = PageRequest.of(page, size);
        
        // 1. Grab exactly the slice of records needed using the DB query
        Page<ParkingRecord> recordPage = recordRepository.findPaginatedAndFiltered(search, siteId, status, pageRequest);

        // 2. Map cleanly to prevent Hibernate N+1 loops on relations
        List<Map<String, Object>> mappedRecords = new ArrayList<>();
        for (ParkingRecord r : recordPage.getContent()) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("plate", r.getLicensePlate());
            map.put("location", r.getParkingSite() != null ? r.getParkingSite().getSiteId() : "Unknown"); 
            map.put("slot", r.getSlotNumber());
            map.put("checkIn", r.getParkInTime() != null ? r.getParkInTime().toString() : "");
            map.put("checkOut", r.getParkOutTime() != null ? r.getParkOutTime().toString() : "");
            map.put("amount", r.getAmount());
            map.put("status", r.isPaid() ? "Paid" : "Unpaid");
            mappedRecords.add(map);
        }

        // 3. Package for the frontend
        Map<String, Object> response = new HashMap<>();
        response.put("content", mappedRecords);
        response.put("totalPages", recordPage.getTotalPages());
        response.put("totalElements", recordPage.getTotalElements());
        response.put("page", recordPage.getNumber());
        response.put("size", recordPage.getSize());
        return response;
    }
}