package com.sdaproject.smarparking.service;

import com.sdaproject.smarparking.models.ParkingSite;
import com.sdaproject.smarparking.models.ParkingRecord;
import com.sdaproject.smarparking.models.user;
import com.sdaproject.smarparking.models.builder.ParkingSiteBuilder;
import com.sdaproject.smarparking.repository.ParkingSiteRepository;
import com.sdaproject.smarparking.repository.ParkingRecordRepository;
import com.sdaproject.smarparking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.time.LocalDate;

@Service // <-- This annotation inherently makes this class a Singleton!
public class AdminService {

    @Autowired
    private ParkingSiteRepository siteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParkingRecordRepository recordRepository;



    @Autowired
    private ReportService reportService;

    // Admin Feature 1: Add a new site using the BUILDER PATTERN
    public String addNewSite(String siteId, int capacity, String location, double rate) {
        if (siteRepository.existsById(siteId)) {
            return "Error: Site ID already exists!";
        }

        // Using the Builder Pattern to cleanly construct the object
        ParkingSite newSite = new ParkingSiteBuilder()
                .setSiteId(siteId)
                .setMaxSiteCapacity(capacity)
                .setSiteLocation(location)
                .setHourlyRate(rate)
                .setOperational(true)
                .build();

        siteRepository.save(newSite);
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
        return "Success: Site updated";
    }

    // Admin Feature 3: Search vehicle by License Plate
    public Optional<user> searchVehicle(String vehicleNo) {
        return userRepository.findByVehicleNo(vehicleNo);
    }

    // Admin Feature: Get all registered users
    public List<user> getAllUsers() {
        return userRepository.findAll();
    }

    // New: Build an overview summary used by the admin dashboard
    public Map<String, Object> getOverview() {
        List<ParkingSite> all = siteRepository.findAll();
        long totalSites = all.size();
        long activeSites = all.stream().filter(ParkingSite::isOperational).count();
        long registeredUsers = userRepository.count();
        long activeSessions = recordRepository.countByParkOutTimeIsNull();
        Map<String, Object> revenueReport = reportService.getRevenueReport();
        @SuppressWarnings("unchecked")
        Map<String, Object> summary = (Map<String, Object>) revenueReport.getOrDefault("summary", Map.of());
        double totalRevenue = Double.parseDouble(String.valueOf(summary.getOrDefault("totalRevenue", 0.0)));

        double todayRevenue = recordRepository.findAll().stream()
                .filter(ParkingRecord::isPaid)
                .filter(r -> r.getParkOutTime() != null)
                .filter(r -> r.getParkOutTime().toLocalDate().equals(LocalDate.now()))
                .filter(r -> r.getAmount() != null && r.getAmount() > 0)
                .mapToDouble(r -> r.getAmount() == null ? 0.0 : r.getAmount())
                .sum();

        Map<String, Object> out = new HashMap<>();
        out.put("totalSites", totalSites);
        out.put("activeSites", activeSites);
        out.put("registeredUsers", registeredUsers);
        out.put("activeSessions", activeSessions);
        out.put("totalRevenue", totalRevenue);
        out.put("todayRevenue", todayRevenue);
        return out;
    }
}