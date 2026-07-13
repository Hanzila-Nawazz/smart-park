package com.sdaproject.smarparking.controller;

import com.sdaproject.smarparking.models.ParkingSite;
import com.sdaproject.smarparking.models.user;
import com.sdaproject.smarparking.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.sdaproject.smarparking.models.Admin;
import com.sdaproject.smarparking.repository.AdminRepository;
import com.sdaproject.smarparking.security.JwtUtil;
import com.sdaproject.smarparking.security.PasswordValidatorUtil;
import org.mindrot.jbcrypt.BCrypt;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*") 
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private com.sdaproject.smarparking.repository.ParkingSiteRepository siteRepo;
    
    @Autowired
    private com.sdaproject.smarparking.repository.ParkingRecordRepository recordRepo;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private com.sdaproject.smarparking.repository.UserRepository userRepository;

    @Autowired
    private com.sdaproject.smarparking.repository.VehicleChangeRequestRepository vehicleChangeRequestRepo;
    
    @Autowired
    private com.sdaproject.smarparking.repository.ComplaintRepository complaintRepository;

    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@RequestBody java.util.Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        Optional<Admin> adminOpt = adminRepository.findByUsername(username);

        if (adminOpt.isPresent() && BCrypt.checkpw(password, adminOpt.get().getPassword())) {
            Admin admin = adminOpt.get();
            String token = jwtUtil.generateToken(admin.getUsername(), "admin");

            java.util.Map<String, Object> successResponse = new java.util.HashMap<>();
            successResponse.put("token", token);
            successResponse.put("role", "admin");
            java.util.Map<String, String> user = new java.util.HashMap<>();
            user.put("id", admin.getId().toString());
            user.put("name", admin.getUsername());
            successResponse.put("user", user);
            successResponse.put("message", "Login Successful");
            return ResponseEntity.ok(successResponse);
        } else {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid Admin Credentials"));
        }
    }

    @PostMapping("/add-site")
    public ResponseEntity<String> addSite(@RequestBody Map<String, Object> payload) {
        String siteId = (String) payload.get("siteId");
        int capacity = (Integer) payload.get("capacity");
        String location = (String) payload.get("location");
        double rate = Double.parseDouble(payload.get("rate").toString());

        String result = adminService.addNewSite(siteId, capacity, location, rate);
        if (result.startsWith("Error")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/sites")
    public ResponseEntity<List<ParkingSite>> viewAllSites() {
        return ResponseEntity.ok(adminService.getAllSites());
    }

    @DeleteMapping("/sites/{id}")
    public ResponseEntity<String> deleteSite(@PathVariable String id) {
        String result = adminService.deleteSite(id);
        if (result.startsWith("Error")) return ResponseEntity.badRequest().body(result);
        return ResponseEntity.ok(result);
    }

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

    @GetMapping("/search-vehicle/{vehicleNo}")
    public ResponseEntity<?> searchVehicle(@PathVariable String vehicleNo) {
        Optional<user> user = adminService.searchVehicle(vehicleNo);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        }
        return ResponseEntity.badRequest().body("Vehicle not found in system.");
    }

    // FIXED: Uses instant DB query instead of pulling all records
    @GetMapping("/search-vehicle-history/{plate}")
    public ResponseEntity<?> searchVehicleHistory(@PathVariable String plate) {
        List<com.sdaproject.smarparking.models.ParkingRecord> allRecords = recordRepo.findByLicensePlateIgnoreCase(plate);
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
    
    // FIXED: Uses fast aggregate SQL instead of pulling all records
    @GetMapping("/sales")
    public ResponseEntity<String> getDailySales() {
        java.time.LocalDateTime startOfDay = java.time.LocalDate.now().atStartOfDay();
        java.time.LocalDateTime endOfDay = startOfDay.plusDays(1);
        Double currentSales = recordRepo.calculateRevenueBetween(startOfDay, endOfDay);
        return ResponseEntity.ok("Total Daily Revenue: Rs. " + (currentSales != null ? currentSales : 0.0));
    }

    @GetMapping("/overview")
    public ResponseEntity<?> getOverview() {
        try {
            Map<String, Object> overview = (Map<String, Object>) adminService.getOverview();
            
            // Add custom dynamic metrics for Pending Amount & Complaints
            // 1. Total Pending Dues (unpaid records amount sum)
            List<com.sdaproject.smarparking.models.ParkingRecord> allUnpaid = recordRepo.findByIsPaidFalse();
            double totalPending = 0.0;
            for(com.sdaproject.smarparking.models.ParkingRecord r : allUnpaid) {
                if (r.getAmount() != null) totalPending += r.getAmount();
            }
            overview.put("totalPendingAmount", totalPending);
            
            // 2. Pending Complaints Count (Submitted or Pending)
            long pendingComplaints = complaintRepository.countByStatus("Submitted") + complaintRepository.countByStatus("Pending");
            overview.put("pendingComplaintsCount", pendingComplaints);
            
            return ResponseEntity.ok(overview);
        } catch (Exception e) {
            java.util.Map<String, String> errorDetail = new java.util.HashMap<>();
            errorDetail.put("error", e.getMessage() != null ? e.getMessage() : e.toString());
            return ResponseEntity.status(500).body(errorDetail);
        }
    }

    @GetMapping("/settings")
    public ResponseEntity<?> getSettings(@RequestHeader(value="Authorization", required=false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid token"));
        }
        String token = authHeader.substring(7);
        String username = jwtUtil.getUsernameFromToken(token);

        if (username == null || !jwtUtil.validateToken(token, username)) {
            return ResponseEntity.status(401).body(Map.of("error", "Token expired or invalid"));
        }

        Optional<Admin> adminOpt = adminRepository.findByUsername(username);
        if (adminOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Admin not found"));
        }

        Admin auth = adminOpt.get();
        Map<String, Object> settings = new java.util.HashMap<>();
        settings.put("username", auth.getUsername());
        settings.put("email", auth.getEmail());
        settings.put("role", "admin");
        return ResponseEntity.ok(settings);
    }

    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestHeader(value="Authorization", required=false) String authHeader, @RequestBody Map<String, String> payload) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid token"));
        }
        String token = authHeader.substring(7);
        String usernameFromToken = jwtUtil.getUsernameFromToken(token);

        if (usernameFromToken == null || !jwtUtil.validateToken(token, usernameFromToken)) {
            return ResponseEntity.status(401).body(Map.of("error", "Token expired or invalid"));
        }

        Optional<Admin> adminOpt = adminRepository.findByUsername(usernameFromToken);
        if (adminOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Admin not found"));
        }

        Admin auth = adminOpt.get();
        String currentPassword = payload.getOrDefault("currentPassword", "");
        String newPassword = payload.getOrDefault("newPassword", "");
        String newUsername = payload.getOrDefault("username", auth.getUsername());

        if (!BCrypt.checkpw(currentPassword, auth.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Current password is incorrect"));
        }

        boolean updated = false;

        if (newUsername != null && !newUsername.isBlank() && !newUsername.equals(auth.getUsername())) {
            auth.setUsername(newUsername.trim());
            updated = true;
        }

        if (newPassword != null && !newPassword.isBlank()) {
            if (!PasswordValidatorUtil.isValid(newPassword)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password does not meet the security requirements"));
            }
            auth.setPassword(BCrypt.hashpw(newPassword, BCrypt.gensalt(10)));
            updated = true;
        }

        if (updated) {
            adminRepository.save(auth);
        }

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("message", "Admin settings updated successfully");
        response.put("username", auth.getUsername());
        response.put("email", auth.getEmail());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sites/{siteId}/live")
    public ResponseEntity<?> getLiveSiteStatus(@PathVariable String siteId) {
        Optional<ParkingSite> siteOpt = siteRepo.findById(siteId);
        if (siteOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Site not found");
        }
        int totalCapacity = siteOpt.get().getMaxSiteCapacity();
        List<com.sdaproject.smarparking.models.ParkingRecord> activeSessions = 
            recordRepo.findByParkingSite_SiteIdAndParkOutTimeIsNull(siteId);

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("siteId", siteId);
        response.put("totalSlots", totalCapacity);
        response.put("occupied", activeSessions.size()); 
        response.put("available", totalCapacity - activeSessions.size()); 
        int occupancyPercent = totalCapacity == 0 ? 0 : (int)(((double)activeSessions.size() / totalCapacity) * 100);
        response.put("occupancyRate", occupancyPercent); 
        response.put("activeRecords", activeSessions); 
        return ResponseEntity.ok(response);
    }

    // FIXED: Properly routes to the paginated service we built earlier
    @GetMapping("/records")
    public ResponseEntity<?> getRecords(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "all") String siteId,
            @RequestParam(defaultValue = "all") String status) {
        try {
            return ResponseEntity.ok(adminService.getPaginatedRecords(page, size, search, siteId, status));
        } catch (Exception e) {
            java.util.Map<String, String> err = new java.util.HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.status(500).body(err);
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllRegisteredUsers() {
        List<user> users = adminService.getAllUsers();
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        
        java.time.LocalDateTime thirtyDaysAgo = java.time.LocalDateTime.now().minusDays(30);

        for (user u : users) {
            if (!(u instanceof com.sdaproject.smarparking.models.RegularUser)) {
                continue;
            }
            com.sdaproject.smarparking.models.RegularUser ru = (com.sdaproject.smarparking.models.RegularUser) u;
            
            // Calculate pending dues
            List<com.sdaproject.smarparking.models.ParkingRecord> userRecords = recordRepo.findByUser_Id(u.getId());
            double pendingDues = 0.0;
            boolean hasOldUnpaidBill = false;
            
            for (com.sdaproject.smarparking.models.ParkingRecord r : userRecords) {
                if (!r.isPaid()) {
                    if (r.getAmount() != null) pendingDues += r.getAmount();
                    if (r.getParkOutTime() != null && r.getParkOutTime().isBefore(thirtyDaysAgo)) {
                        hasOldUnpaidBill = true;
                    }
                }
            }
            
            // Auto-suspend if they have a bill older than 1 month
            if (hasOldUnpaidBill && !ru.isSuspended()) {
                ru.setSuspended(true);
                userRepository.save(ru);
            }
            
            Map<String, Object> item = new java.util.HashMap<>();
            item.put("id", u.getId());
            item.put("name", u.getName());
            item.put("contact", u.getContactNo());
            item.put("vehicleType", u.getVehicleType());
            item.put("plate", u.getVehicleNo());
            item.put("status", ru.isSuspended() ? "Suspended" : "Active");
            item.put("cnic", ru.getCnic());
            item.put("pendingDues", pendingDues);
            item.put("hasOldUnpaidBill", hasOldUnpaidBill);
            
            result.add(item);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/users/{id}/suspend")
    public ResponseEntity<?> suspendUser(@PathVariable Long id) {
        Optional<user> userOpt = userRepository.findById(id);
        if (userOpt.isPresent() && userOpt.get() instanceof com.sdaproject.smarparking.models.RegularUser) {
            com.sdaproject.smarparking.models.RegularUser ru = (com.sdaproject.smarparking.models.RegularUser) userOpt.get();
            ru.setSuspended(true);
            userRepository.save(ru);
            return ResponseEntity.ok(Map.of("message", "User suspended successfully"));
        }
        return ResponseEntity.status(404).body(Map.of("error", "User not found"));
    }

    @PostMapping("/users/{id}/revoke-suspension")
    public ResponseEntity<?> revokeSuspension(@PathVariable Long id) {
        Optional<user> userOpt = userRepository.findById(id);
        if (userOpt.isPresent() && userOpt.get() instanceof com.sdaproject.smarparking.models.RegularUser) {
            com.sdaproject.smarparking.models.RegularUser ru = (com.sdaproject.smarparking.models.RegularUser) userOpt.get();
            ru.setSuspended(false);
            userRepository.save(ru);
            return ResponseEntity.ok(Map.of("message", "User suspension revoked"));
        }
        return ResponseEntity.status(404).body(Map.of("error", "User not found"));
    }
    
    @GetMapping("/complaints")
    public ResponseEntity<?> getAllComplaints() {
        List<com.sdaproject.smarparking.models.Complaint> complaints = complaintRepository.findAllByOrderByCreatedAtDesc();
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        for (com.sdaproject.smarparking.models.Complaint c : complaints) {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", c.getId());
            map.put("subject", c.getSubject());
            map.put("description", c.getDescription());
            map.put("status", c.getStatus());
            map.put("createdAt", c.getCreatedAt());
            map.put("adminResponse", c.getAdminResponse() != null ? c.getAdminResponse() : "");
            if (c.getUser() != null) {
                map.put("userId", c.getUser().getId());
                map.put("userName", c.getUser().getName());
                map.put("userPlate", c.getUser().getVehicleNo());
            }
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/complaints/{id}/resolve")
    public ResponseEntity<?> resolveComplaint(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
        Optional<com.sdaproject.smarparking.models.Complaint> opt = complaintRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Complaint not found"));
        com.sdaproject.smarparking.models.Complaint c = opt.get();
        String status = payload.getOrDefault("status", "Resolved");
        String adminResponse = payload.get("adminResponse");
        
        c.setStatus(status);
        if (adminResponse != null) {
            c.setAdminResponse(adminResponse);
        }
        
        complaintRepository.save(c);
        return ResponseEntity.ok(Map.of("message", "Complaint " + status));
    }

    @GetMapping("/vehicle-requests")
    public ResponseEntity<?> getVehicleChangeRequests() {
        List<com.sdaproject.smarparking.models.VehicleChangeRequest> requests = vehicleChangeRequestRepo.findAllByOrderByCreatedAtDesc();
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        for (com.sdaproject.smarparking.models.VehicleChangeRequest req : requests) {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", req.getId());
            map.put("userId", req.getUser().getId());
            map.put("userName", req.getUser().getName());
            map.put("oldPlate", req.getOldPlate() != null ? req.getOldPlate() : "");
            map.put("newPlate", req.getNewPlate());
            map.put("oldType", req.getOldType() != null ? req.getOldType() : "");
            map.put("newType", req.getNewType());
            map.put("status", req.getStatus());
            map.put("createdAt", req.getCreatedAt());
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/vehicle-requests/{id}/approve")
    public ResponseEntity<?> approveVehicleChangeRequest(@PathVariable Long id) {
        Optional<com.sdaproject.smarparking.models.VehicleChangeRequest> reqOpt = vehicleChangeRequestRepo.findById(id);
        if (reqOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Request not found"));
        
        com.sdaproject.smarparking.models.VehicleChangeRequest req = reqOpt.get();
        if (!"PENDING".equals(req.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Request is already " + req.getStatus()));
        }

        // Update the user
        user u = req.getUser();
        u.setVehicleNo(req.getNewPlate());
        u.setVehicleType(req.getNewType());
        userRepository.save(u);

        // Update the request status
        req.setStatus("APPROVED");
        vehicleChangeRequestRepo.save(req);

        return ResponseEntity.ok(Map.of("message", "Vehicle change approved successfully"));
    }

    @PostMapping("/vehicle-requests/{id}/reject")
    public ResponseEntity<?> rejectVehicleChangeRequest(@PathVariable Long id) {
        Optional<com.sdaproject.smarparking.models.VehicleChangeRequest> reqOpt = vehicleChangeRequestRepo.findById(id);
        if (reqOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Request not found"));
        
        com.sdaproject.smarparking.models.VehicleChangeRequest req = reqOpt.get();
        if (!"PENDING".equals(req.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Request is already " + req.getStatus()));
        }

        req.setStatus("REJECTED");
        vehicleChangeRequestRepo.save(req);

        return ResponseEntity.ok(Map.of("message", "Vehicle change rejected"));
    }
}