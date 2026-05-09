package com.sdaproject.smarparking.controller;

import com.sdaproject.smarparking.models.ParkingSite;
import com.sdaproject.smarparking.models.user;
import com.sdaproject.smarparking.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*") // Allow all origins for simplicity
public class AdminController {

    @Autowired
    private AdminService adminService;

    // HTTP POST: http://localhost:8080/api/admin/login
    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@RequestBody java.util.Map<String, String> credentials) {

        String username = credentials.get("username");
        String password = credentials.get("password");

        // Use our Singleton Pattern to verify credentials
        boolean isValid = com.sdaproject.smarparking.models.AdminAuth.getInstance().login(username, password);

        if (isValid) {
            // Lovable's frontend expects a `token` and a `user` object to maintain the
            // login session
            java.util.Map<String, Object> successResponse = new java.util.HashMap<>();
            successResponse.put("token", "admin-auth-token-777");
            successResponse.put("role", "admin");
            // provide a minimal user object so the frontend can store user info in the auth
            // store
            java.util.Map<String, String> user = new java.util.HashMap<>();
            user.put("id", "A1");
            user.put("name", "Administrator");
            successResponse.put("user", user);
            successResponse.put("message", "Login Successful");

            return ResponseEntity.ok(successResponse);
        } else {
            return ResponseEntity.status(401).body("Error: Invalid Admin Credentials");
        }
    }

    // HTTP POST: http://localhost:8080/api/admin/add-site
    @PostMapping("/add-site")
    public ResponseEntity<String> addSite(@RequestBody Map<String, Object> payload) {
        String siteId = (String) payload.get("siteId");
        int capacity = (Integer) payload.get("capacity");
        String location = (String) payload.get("location");

        // Handle numbers safely (JSON sometimes sends doubles/integers differently)
        double rate = Double.parseDouble(payload.get("rate").toString());

        String result = adminService.addNewSite(siteId, capacity, location, rate);
        if (result.startsWith("Error")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    // HTTP GET: http://localhost:8080/api/admin/sites
    @GetMapping("/sites")
    public ResponseEntity<List<ParkingSite>> viewAllSites() {
        return ResponseEntity.ok(adminService.getAllSites());
    }

    // HTTP DELETE: http://localhost:8080/api/admin/sites/{id}
    @DeleteMapping("/sites/{id}")
    public ResponseEntity<String> deleteSite(@PathVariable String id) {
        String result = adminService.deleteSite(id);
        if (result.startsWith("Error")) return ResponseEntity.badRequest().body(result);
        return ResponseEntity.ok(result);
    }

    // HTTP PUT: http://localhost:8080/api/admin/sites/{id}
    @PutMapping("/sites/{id}")
    public ResponseEntity<String> updateSite(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        int capacity = Integer.parseInt(payload.get("capacity").toString());
        String location = (String) payload.get("location");
        double rate = Double.parseDouble(payload.get("rate").toString());
        Boolean operational = payload.containsKey("operational") ? Boolean.parseBoolean(payload.get("operational").toString()) : null;
        String result = adminService.updateSite(id, capacity, location, rate, operational);
        if (result.startsWith("Error")) return ResponseEntity.badRequest().body(result);
        return ResponseEntity.ok(result);
    }

    // HTTP GET: http://localhost:8080/api/admin/search-vehicle/{vehicleNo}
    @GetMapping("/search-vehicle/{vehicleNo}")
    public ResponseEntity<?> searchVehicle(@PathVariable String vehicleNo) {
        Optional<user> user = adminService.searchVehicle(vehicleNo);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        }
        return ResponseEntity.badRequest().body("Vehicle not found in system.");
    }

    // HTTP GET: http://localhost:8080/api/admin/search-vehicle-history/{plate}
    @GetMapping("/search-vehicle-history/{plate}")
    public ResponseEntity<?> searchVehicleHistory(@PathVariable String plate) {
        // Also get closed sessions for complete history
        List<com.sdaproject.smarparking.models.ParkingRecord> allRecords = recordRepo.findAll().stream()
                .filter(r -> plate.equalsIgnoreCase(r.getLicensePlate()))
                .toList();
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        for (com.sdaproject.smarparking.models.ParkingRecord r : allRecords) {
            Map<String, Object> item = new java.util.HashMap<>();
            item.put("id", r.getId());
            item.put("location", r.getParkingSite() != null ? r.getParkingSite().getSiteLocation() : "Unknown");
            item.put("siteId", r.getParkingSite() != null ? r.getParkingSite().getSiteId() : null);
            item.put("slot", r.getSlotNumber());
            item.put("plate", r.getLicensePlate());
            item.put("date", r.getParkInTime());
            item.put("checkIn", r.getParkInTime());
            item.put("checkOut", r.getParkOutTime());
            item.put("amount", r.getAmount() != null ? r.getAmount() : 0.0);
            item.put("status", r.isPaid() ? "Paid" : "Unpaid");
            result.add(item);
        }
        return ResponseEntity.ok(result);
    }
    
    // HTTP GET: http://localhost:8080/api/admin/sales
    @GetMapping("/sales")
    public ResponseEntity<String> getDailySales() {
        double currentSales = recordRepo.findAll().stream()
                .filter(com.sdaproject.smarparking.models.ParkingRecord::isPaid)
                .filter(r -> r.getParkOutTime() != null)
                .filter(r -> r.getParkOutTime().toLocalDate().equals(java.time.LocalDate.now()))
                .filter(r -> r.getAmount() != null && r.getAmount() > 0)
                .mapToDouble(r -> r.getAmount() == null ? 0.0 : r.getAmount())
                .sum();
        return ResponseEntity.ok("Total Daily Revenue: Rs. " + currentSales);
    }

    // HTTP GET: http://localhost:8080/api/admin/overview
    @GetMapping("/overview")
    public ResponseEntity<?> getOverview() {
        return ResponseEntity.ok(adminService.getOverview());
    }

    // HTTP GET: http://localhost:8080/api/admin/settings
    @GetMapping("/settings")
    public ResponseEntity<?> getSettings() {
        com.sdaproject.smarparking.models.AdminAuth auth = com.sdaproject.smarparking.models.AdminAuth.getInstance();
        Map<String, Object> settings = new java.util.HashMap<>();
        settings.put("username", auth.getUsername());
        settings.put("email", auth.getEmail());
        settings.put("role", "admin");
        return ResponseEntity.ok(settings);
    }

    // HTTP PUT: http://localhost:8080/api/admin/settings
    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestBody Map<String, String> payload) {
        com.sdaproject.smarparking.models.AdminAuth auth = com.sdaproject.smarparking.models.AdminAuth.getInstance();

        String currentPassword = payload.getOrDefault("currentPassword", "");
        String username = payload.getOrDefault("username", auth.getUsername());
        String email = payload.getOrDefault("email", auth.getEmail());
        String newPassword = payload.getOrDefault("newPassword", "");

        if (!auth.getPassword().equals(currentPassword)) {
            return ResponseEntity.status(401).body(Map.of("error", "Current password is incorrect"));
        }

        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username is required"));
        }

        auth.setUsername(username.trim());
        auth.setEmail(email == null ? "" : email.trim());

        if (newPassword != null && !newPassword.isBlank()) {
            if (newPassword.length() < 3) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 3 characters"));
            }
            auth.setPassword(newPassword);
        }

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("message", "Admin settings updated");
        response.put("username", auth.getUsername());
        response.put("email", auth.getEmail());
        return ResponseEntity.ok(response);
    }



    // --- NEW MODULE: SITE DETAILS & LIVE OCCUPANCY ---

    @Autowired
    private com.sdaproject.smarparking.repository.ParkingSiteRepository siteRepo;
    
    @Autowired
    private com.sdaproject.smarparking.repository.ParkingRecordRepository recordRepo;

    // HTTP GET: http://localhost:8080/api/admin/sites/{siteId}/live
    @GetMapping("/sites/{siteId}/live")
    public ResponseEntity<?> getLiveSiteStatus(@PathVariable String siteId) {
        
        // 1. Get the site details
        Optional<ParkingSite> siteOpt = siteRepo.findById(siteId);
        if (siteOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Site not found");
        }
        
        int totalCapacity = siteOpt.get().getMaxSiteCapacity();

        // 2. Get all active parking sessions (where checkout is null)
        List<com.sdaproject.smarparking.models.ParkingRecord> activeSessions = 
            recordRepo.findByParkingSite_SiteIdAndParkOutTimeIsNull(siteId);

        // 3. Package the data exactly how the frontend Dashboard expects it
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("siteId", siteId);
        response.put("totalSlots", totalCapacity);
        response.put("occupied", activeSessions.size()); // Matches the orange card
        response.put("available", totalCapacity - activeSessions.size()); // Matches the green card
        
        // Calculate percentage for the blue card
        int occupancyPercent = totalCapacity == 0 ? 0 : (int)(((double)activeSessions.size() / totalCapacity) * 100);
        response.put("occupancyRate", occupancyPercent); 
        
        // Send the raw records so React can paint specific slots red
        response.put("activeRecords", activeSessions); 

        return ResponseEntity.ok(response);
    }

    // HTTP GET: http://localhost:8080/api/admin/records
    @GetMapping("/records")
    public ResponseEntity<?> getAllParkingRecords() {
        List<com.sdaproject.smarparking.models.ParkingRecord> records = recordRepo.findAll();
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        for (com.sdaproject.smarparking.models.ParkingRecord r : records) {
            Map<String, Object> item = new java.util.HashMap<>();
            item.put("id", r.getId());
            item.put("location", r.getParkingSite() != null ? r.getParkingSite().getSiteLocation() : "Unknown");
            item.put("siteId", r.getParkingSite() != null ? r.getParkingSite().getSiteId() : null);
            item.put("slot", r.getSlotNumber());
            item.put("plate", r.getLicensePlate());
            item.put("checkIn", r.getParkInTime());
            item.put("checkOut", r.getParkOutTime());
            item.put("amount", r.getAmount() != null ? r.getAmount() : 0.0);
            item.put("status", r.isPaid() ? "Paid" : "Unpaid");
            result.add(item);
        }
        return ResponseEntity.ok(result);
    }

    // HTTP GET: http://localhost:8080/api/admin/users
    @GetMapping("/users")
    public ResponseEntity<?> getAllRegisteredUsers() {
        List<user> users = adminService.getAllUsers();
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        for (user u : users) {
            if (!(u instanceof com.sdaproject.smarparking.models.RegularUser)) {
                continue;
            }
            com.sdaproject.smarparking.models.RegularUser ru = (com.sdaproject.smarparking.models.RegularUser) u;
            Map<String, Object> item = new java.util.HashMap<>();
            item.put("id", u.getId());
            item.put("name", u.getName());
            item.put("contact", u.getContactNo());
            item.put("vehicleType", u.getVehicleType());
            item.put("plate", u.getVehicleNo());
            item.put("status", "Active");
            item.put("cnic", ru.getCnic());
            result.add(item);
        }
        return ResponseEntity.ok(result);
    }
}