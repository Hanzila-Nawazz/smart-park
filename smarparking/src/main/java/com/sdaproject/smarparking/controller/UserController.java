package com.sdaproject.smarparking.controller;

import com.sdaproject.smarparking.models.user;
import com.sdaproject.smarparking.repository.ParkingRecordRepository;
import com.sdaproject.smarparking.repository.UserRepository;
import com.sdaproject.smarparking.service.ParkingFacade;
import com.sdaproject.smarparking.service.factory.UserFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.sdaproject.smarparking.security.JwtUtil;
import com.sdaproject.smarparking.security.PasswordValidatorUtil;
import org.mindrot.jbcrypt.BCrypt;

import java.util.HashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") // Crucial for React to talk to Java
public class UserController {

    @Autowired
    private UserFactory userFactory;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParkingRecordRepository recordRepo;

    @Autowired
    private com.sdaproject.smarparking.repository.VehicleChangeRequestRepository vehicleChangeRequestRepo;
    
    @Autowired
    private com.sdaproject.smarparking.repository.ComplaintRepository complaintRepository;

    @Autowired
    private ParkingFacade parkingFacade;

    @Autowired
    private JwtUtil jwtUtil;

    // HTTP POST: `${process.env.vite_api_url}`/api/users/register
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> payload) {
        try {
            String name = payload.get("name");
            String contactNo = payload.get("contactNo");
            String vehicleType = payload.get("vehicleType");
            String vehicleNo = payload.get("vehicleNo");
            String cnic = payload.get("cnic");
            String password = payload.get("password");

            // Explicitly check if CNIC already exists
            if (userRepository.findByCnic(cnic).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "This CNIC is already registered!"));
            }

            // Explicitly check if Vehicle Number already exists
            if (userRepository.findFirstByVehicleNoOrderByIdDesc(vehicleNo).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "This Vehicle Number is already registered!"));
            }

            if (!PasswordValidatorUtil.isValid(password)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password does not meet security requirements"));
            }
            String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt(10));

            user newUser = userFactory.createUser(name, contactNo, vehicleType, vehicleNo, cnic, hashedPassword);
            user savedUser = userRepository.save(newUser);

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwtUtil.generateToken(String.valueOf(savedUser.getId()), "user"));
            response.put("message", "User registered successfully!");

            Map<String, Object> userData = new HashMap<>();
            userData.put("id", savedUser.getId());
            userData.put("name", savedUser.getName());
            userData.put("cnic", cnic);
            userData.put("vehicleNo", savedUser.getVehicleNo());
            userData.put("vehicleType", savedUser.getVehicleType());
            userData.put("role", "user");
            response.put("user", userData);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Registration failed. Please try again."));
        }
    }

    // HTTP POST: `${process.env.vite_api_url}`/api/users/login
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> payload) {
        String cnic = payload.get("cnic");
        String password = payload.get("password");

        java.util.Optional<com.sdaproject.smarparking.models.RegularUser> userOpt = userRepository.findByCnic(cnic);

        if (userOpt.isPresent() && BCrypt.checkpw(password, userOpt.get().getPassword())) {
            com.sdaproject.smarparking.models.RegularUser loggedInUser = userOpt.get();

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwtUtil.generateToken(String.valueOf(loggedInUser.getId()), "user"));
            response.put("message", "Login successful!");

            Map<String, Object> userData = new HashMap<>();
            userData.put("id", loggedInUser.getId());
            userData.put("name", loggedInUser.getName());
            userData.put("cnic", loggedInUser.getCnic());
            userData.put("vehicleNo", loggedInUser.getVehicleNo());
            userData.put("vehicleType", loggedInUser.getVehicleType());
            userData.put("walletBalance", loggedInUser.getWalletBalance());
            userData.put("isSuspended", loggedInUser.isSuspended());
            userData.put("role", "user");

            response.put("user", userData);
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid CNIC or Password."));
        }
    }

    // HTTP GET: `${process.env.vite_api_url}`/api/users/{userId}/dashboard
    @GetMapping("/{userId}/dashboard")
    public ResponseEntity<?> getUserDashboardStats(@PathVariable Long userId) {
        java.util.Optional<user> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        
        user u = userOpt.get();

        // 1. Get Wallet Balance and Suspended status safely
        double realWalletBalance = 0.0;
        boolean isSuspended = false;
        if (u instanceof com.sdaproject.smarparking.models.RegularUser) {
            com.sdaproject.smarparking.models.RegularUser ru = (com.sdaproject.smarparking.models.RegularUser) u;
            realWalletBalance = ru.getWalletBalance();
            isSuspended = ru.isSuspended();
        }

        // 2. Calculate Stats
        java.util.List<com.sdaproject.smarparking.models.ParkingRecord> activeSessions = recordRepo.findByUserAndParkOutTimeIsNull(u);
        java.util.List<com.sdaproject.smarparking.models.ParkingRecord> pendingBills = recordRepo.findByUser_IdAndIsPaidFalseAndParkOutTimeIsNotNull(userId);
        java.util.List<com.sdaproject.smarparking.models.ParkingRecord> totalSessions = recordRepo.findByUser_Id(userId);

        // 3. Format Active Session String
        String activeSessionText = "No active session";
        if (!activeSessions.isEmpty()) {
            com.sdaproject.smarparking.models.ParkingRecord active = activeSessions.get(0);
            if (active.getParkingSite() != null) {
                activeSessionText = active.getParkingSite().getSiteLocation();
            } else {
                activeSessionText = "Parked";
            }
        }

        // 4. Calculate Real Data for the Area Chart (Monthly Parking Sessions)
        // Group by month
        java.time.LocalDateTime sixMonthsAgo = java.time.LocalDateTime.now().minusMonths(6);
        java.util.Map<String, Integer> monthlyCounts = new java.util.LinkedHashMap<>();
        
        // Initialize last 6 months with 0
        for (int i = 5; i >= 0; i--) {
            java.time.Month m = java.time.LocalDateTime.now().minusMonths(i).getMonth();
            String monthName = m.getDisplayName(java.time.format.TextStyle.SHORT, java.util.Locale.ENGLISH);
            monthlyCounts.put(monthName, 0);
        }

        for (com.sdaproject.smarparking.models.ParkingRecord record : totalSessions) {
            if (record.getParkInTime() != null && record.getParkInTime().isAfter(sixMonthsAgo)) {
                String mName = record.getParkInTime().getMonth().getDisplayName(java.time.format.TextStyle.SHORT, java.util.Locale.ENGLISH);
                if (monthlyCounts.containsKey(mName)) {
                    monthlyCounts.put(mName, monthlyCounts.get(mName) + 1);
                }
            }
        }

        java.util.List<Map<String, Object>> chartData = new java.util.ArrayList<>();
        for (java.util.Map.Entry<String, Integer> entry : monthlyCounts.entrySet()) {
            chartData.add(Map.of("hour", entry.getKey(), "occupancy", entry.getValue()));
        }

        // 5. Package it all for React
        Map<String, Object> response = new HashMap<>();
        response.put("walletBalance", realWalletBalance);
        response.put("activeCount", activeSessions.size());
        response.put("activeText", activeSessionText);
        response.put("totalSessions", totalSessions.size());
        response.put("pendingBills", pendingBills.size());
        response.put("isSuspended", isSuspended);
        response.put("chartData", chartData);

        return ResponseEntity.ok(response);
    }

    // HTTP GET: `${process.env.vite_api_url}`/api/users/{userId}/wallet
    @GetMapping("/{userId}/wallet")
    public ResponseEntity<?> getWallet(@PathVariable Long userId) {
        Optional<user> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        user u = userOpt.get();
        double balance = 0.0;
        if (u instanceof com.sdaproject.smarparking.models.RegularUser) {
            balance = ((com.sdaproject.smarparking.models.RegularUser) u).getWalletBalance();
        }
        Map<String, Object> resp = new HashMap<>();
        resp.put("balance", balance);
        resp.put("transactions", List.of());
        return ResponseEntity.ok(resp);
    }

    // HTTP POST: `${process.env.vite_api_url}`/api/users/{userId}/wallet/topup
    @PostMapping("/{userId}/wallet/topup")
    public ResponseEntity<?> topUpWallet(@PathVariable Long userId, @RequestBody Map<String, Object> payload) {
        Optional<com.sdaproject.smarparking.models.RegularUser> userOpt = userRepository.findById(userId).filter(u -> u instanceof com.sdaproject.smarparking.models.RegularUser).map(u -> (com.sdaproject.smarparking.models.RegularUser) u);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found or not a regular user"));
        }
        com.sdaproject.smarparking.models.RegularUser ru = userOpt.get();
        double amount = 0.0;
        try {
            Object a = payload.get("amount");
            if (a instanceof Number) amount = ((Number) a).doubleValue();
            else amount = Double.parseDouble(String.valueOf(a));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid amount"));
        }
        if (amount <= 0) return ResponseEntity.badRequest().body(Map.of("error", "Amount must be positive"));

        ru.setWalletBalance(ru.getWalletBalance() + amount);
        userRepository.save(ru);

        Map<String, Object> resp = new HashMap<>();
        resp.put("balance", ru.getWalletBalance());
        resp.put("message", "Top-up successful");
        resp.put("transactions", List.of(Map.of("id", System.currentTimeMillis(), "type", "Top-up", "amount", amount, "date", java.time.LocalDateTime.now())));
        return ResponseEntity.ok(resp);
    }

    // HTTP GET: `${process.env.vite_api_url}`/api/users/{userId}/active-session
    @GetMapping("/{userId}/active-session")
    public ResponseEntity<?> getActiveSession(@PathVariable Long userId) {
        Optional<user> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }

        List<com.sdaproject.smarparking.models.ParkingRecord> activeSessions = recordRepo.findByUserAndParkOutTimeIsNull(userOpt.get());
        if (activeSessions.isEmpty()) {
            return ResponseEntity.ok(Map.of("active", false, "message", "No active session"));
        }

        com.sdaproject.smarparking.models.ParkingRecord active = activeSessions.get(0);
        Map<String, Object> response = new HashMap<>();
        response.put("active", true);
        response.put("id", active.getId());
        response.put("site", active.getParkingSite() != null ? active.getParkingSite().getSiteLocation() : "Unknown");
        response.put("siteId", active.getParkingSite() != null ? active.getParkingSite().getSiteId() : null);
        response.put("slot", active.getSlotNumber());
        response.put("checkIn", active.getParkInTime());
        response.put("rate", active.getParkingSite() != null ? active.getParkingSite().getHourlyRate() : 0.0);
        response.put("vehiclePlate", active.getLicensePlate());
        response.put("userType", active.getUser() != null ? active.getUser().getClass().getSimpleName() : null);

        double estimatedBill = 0.0;
        if (active.getParkingSite() != null && active.getParkInTime() != null) {
            long minutesParked = java.time.Duration.between(active.getParkInTime(), java.time.LocalDateTime.now()).toMinutes();
            double billHours = Math.ceil(minutesParked / 60.0);
            if (billHours == 0) billHours = 1;
            estimatedBill = billHours * active.getParkingSite().getHourlyRate();
        }
        response.put("estimatedBill", estimatedBill);
        return ResponseEntity.ok(response);
    }

    // HTTP POST: `${process.env.vite_api_url}`/api/users/sessions/{sessionId}/checkout
    @PostMapping("/sessions/{sessionId}/checkout")
    public ResponseEntity<?> checkoutSession(@PathVariable Long sessionId, @RequestBody(required = false) Map<String, String> payload) {
        String paymentType = payload != null ? payload.getOrDefault("paymentType", "Cash") : "Cash";

        java.util.Optional<com.sdaproject.smarparking.models.ParkingRecord> recordOpt = recordRepo.findById(sessionId);
        if (recordOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Session not found"));
        }

        com.sdaproject.smarparking.models.ParkingRecord record = recordOpt.get();
        String result = parkingFacade.closeSession(record, !"Later".equalsIgnoreCase(paymentType), paymentType);
        if (result.startsWith("Error")) {
            return ResponseEntity.badRequest().body(Map.of("error", result));
        }
        return ResponseEntity.ok(Map.of("message", result));
    }

    // HTTP GET: `${process.env.vite_api_url}`/api/users/{userId}/pending-bills
    @GetMapping("/{userId}/pending-bills")
    public ResponseEntity<?> getPendingBills(@PathVariable Long userId) {
        Optional<user> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }

        List<com.sdaproject.smarparking.models.ParkingRecord> unpaid = recordRepo.findByUser_IdAndIsPaidFalseAndParkOutTimeIsNotNull(userId);
        List<Map<String, Object>> bills = new ArrayList<>();
        double totalPending = 0.0;

        for (com.sdaproject.smarparking.models.ParkingRecord record : unpaid) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", record.getId());
            item.put("location", record.getParkingSite() != null ? record.getParkingSite().getSiteLocation() : "Unknown");
            item.put("slot", record.getSlotNumber());
            item.put("plate", record.getLicensePlate());
            item.put("date", record.getParkInTime());

            double amount = record.getAmount() != null ? record.getAmount() : 0.0;
            if (amount == 0.0 && record.getParkingSite() != null && record.getParkInTime() != null) {
                amount = parkingFacade.calculateBill(record, record.getParkOutTime() != null ? record.getParkOutTime() : java.time.LocalDateTime.now());
            }
            item.put("amount", amount);
            bills.add(item);
            totalPending += amount;
        }

        Map<String, Object> response = new HashMap<>();
        response.put("items", bills);
        response.put("totalPending", totalPending);
        response.put("count", bills.size());
        return ResponseEntity.ok(response);
    }

    // HTTP POST: `${process.env.vite_api_url}`/api/users/pending-bills/{sessionId}/pay
    @PostMapping("/pending-bills/{sessionId}/pay")
    public ResponseEntity<?> payPendingBill(@PathVariable Long sessionId, @RequestBody(required = false) Map<String, String> payload) {
        String paymentType = payload != null ? payload.getOrDefault("paymentType", "Cash") : "Cash";
        String result = parkingFacade.payPendingSession(sessionId, paymentType);
        if (result.startsWith("Error")) {
            return ResponseEntity.badRequest().body(Map.of("error", result));
        }
        return ResponseEntity.ok(Map.of("message", result));
    }

    // HTTP PUT: `${process.env.vite_api_url}`/api/users/{userId}
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @RequestBody Map<String, Object> payload) {
        Optional<user> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "User not found"));

        user u = userOpt.get();

        // Immutable fields: name and cnic should not be changed here

        // Update contact if provided (model uses contactNo)
        if (payload.containsKey("contact")) u.setContactNo(String.valueOf(payload.get("contact")));

        // Vehicle update: check license plate safety
        if (payload.containsKey("plateNumber")) {
            String newPlate = String.valueOf(payload.get("plateNumber"));
            if (!newPlate.equals(u.getVehicleNo())) {
                // Check for active sessions using this plate
                List<com.sdaproject.smarparking.models.ParkingRecord> active = recordRepo.findByLicensePlateAndParkOutTimeIsNull(newPlate);
                // Check for unpaid closed sessions (pending bills) by plate
                List<com.sdaproject.smarparking.models.ParkingRecord> unpaid = recordRepo.findAll().stream()
                        .filter(r -> newPlate.equals(r.getLicensePlate()) && r.isPaid() == false && r.getParkOutTime() != null)
                        .toList();
                if (!active.isEmpty() || !unpaid.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Cannot change plate: active sessions or pending bills exist for this plate"));
                }
                u.setVehicleNo(newPlate);
            }
        }

        if (payload.containsKey("vehicleType")) u.setVehicleType(String.valueOf(payload.get("vehicleType")));

        userRepository.save(u);
        Map<String, Object> resp = new HashMap<>();
        resp.put("message", "Profile updated");
        String cnicVal = "";
        if (u instanceof com.sdaproject.smarparking.models.RegularUser) {
            cnicVal = ((com.sdaproject.smarparking.models.RegularUser) u).getCnic();
        }
        resp.put("user", Map.of(
            "id", u.getId(),
            "name", u.getName(),
            "cnic", (cnicVal != null ? cnicVal : ""),
            "vehicleNo", u.getVehicleNo(),
            "vehicleType", u.getVehicleType(),
            "contact", u.getContactNo(),
            "email", ""
        ));
        return ResponseEntity.ok(resp);
    }

    // HTTP POST: `${process.env.vite_api_url}`/api/users/{userId}/password
    @PostMapping("/{userId}/password")
    public ResponseEntity<?> changePassword(@PathVariable Long userId, @RequestBody Map<String, String> payload) {
        String current = payload.getOrDefault("currentPassword", "");
        String next = payload.getOrDefault("newPassword", "");
        if (!PasswordValidatorUtil.isValid(next)) return ResponseEntity.badRequest().body(Map.of("error", "New password does not meet security requirements"));
        Optional<com.sdaproject.smarparking.models.RegularUser> userOpt = userRepository.findById(userId).filter(u -> u instanceof com.sdaproject.smarparking.models.RegularUser).map(u -> (com.sdaproject.smarparking.models.RegularUser) u);
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "User not found or cannot change password"));
        com.sdaproject.smarparking.models.RegularUser ru = userOpt.get();
        if (!BCrypt.checkpw(current, ru.getPassword())) return ResponseEntity.status(401).body(Map.of("error", "Current password incorrect"));
        ru.setPassword(BCrypt.hashpw(next, BCrypt.gensalt(10)));
        userRepository.save(ru);
        return ResponseEntity.ok(Map.of("message", "Password updated"));
    }

    // HTTP POST: /api/users/{userId}/vehicle-requests
    @PostMapping("/{userId}/vehicle-requests")
    public ResponseEntity<?> submitVehicleChangeRequest(@PathVariable Long userId, @RequestBody Map<String, String> payload) {
        Optional<user> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        user u = userOpt.get();

        String newPlate = payload.get("newPlate");
        String newType = payload.get("newType");
        if (newPlate == null || newPlate.trim().isEmpty() || newType == null || newType.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "New plate and new type are required."));
        }

        // Prevent duplicate pending requests
        List<com.sdaproject.smarparking.models.VehicleChangeRequest> existing = vehicleChangeRequestRepo.findByUser_Id(userId);
        for (com.sdaproject.smarparking.models.VehicleChangeRequest req : existing) {
            if ("PENDING".equals(req.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "You already have a pending request. Please wait for admin approval."));
            }
        }

        com.sdaproject.smarparking.models.VehicleChangeRequest request = new com.sdaproject.smarparking.models.VehicleChangeRequest();
        request.setUser(u);
        request.setOldPlate(u.getVehicleNo());
        request.setOldType(u.getVehicleType());
        request.setNewPlate(newPlate.trim());
        request.setNewType(newType.trim());
        
        vehicleChangeRequestRepo.save(request);

        return ResponseEntity.ok(Map.of("message", "Request submitted successfully. Waiting for Admin approval."));
    }

    // HTTP GET: /api/users/{userId}/vehicle-requests
    @GetMapping("/{userId}/vehicle-requests")
    public ResponseEntity<?> getUserVehicleChangeRequests(@PathVariable Long userId) {
        List<com.sdaproject.smarparking.models.VehicleChangeRequest> requests = vehicleChangeRequestRepo.findByUser_Id(userId);
        List<Map<String, Object>> response = new ArrayList<>();
        for (com.sdaproject.smarparking.models.VehicleChangeRequest req : requests) {
            response.add(Map.of(
                "id", req.getId(),
                "oldPlate", req.getOldPlate() != null ? req.getOldPlate() : "",
                "newPlate", req.getNewPlate(),
                "oldType", req.getOldType() != null ? req.getOldType() : "",
                "newType", req.getNewType(),
                "status", req.getStatus(),
                "createdAt", req.getCreatedAt()
            ));
        }
        return ResponseEntity.ok(response);
    }

    // HTTP GET: `${process.env.vite_api_url}`/api/users/{userId}/history
    @GetMapping("/{userId}/history")
    public ResponseEntity<?> getUserHistory(@PathVariable Long userId) {
        Optional<user> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }

        List<com.sdaproject.smarparking.models.ParkingRecord> records = recordRepo.findByUser_Id(userId);
        List<Map<String, Object>> history = new ArrayList<>();

        for (com.sdaproject.smarparking.models.ParkingRecord record : records) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", record.getId());
            item.put("location", record.getParkingSite() != null ? record.getParkingSite().getSiteLocation() : "Unknown");
            item.put("slot", record.getSlotNumber());
            item.put("plate", record.getLicensePlate());
            item.put("date", record.getParkInTime());
            item.put("status", record.isPaid() ? "Paid" : "Unpaid");

            double amount = record.getAmount() != null ? record.getAmount() : 0.0;
            if (amount == 0.0 && record.getParkingSite() != null && record.getParkInTime() != null) {
                java.time.LocalDateTime end = record.getParkOutTime() != null ? record.getParkOutTime() : java.time.LocalDateTime.now();
                long minutesParked = java.time.Duration.between(record.getParkInTime(), end).toMinutes();
                double hours = Math.ceil(minutesParked / 60.0);
                if (hours == 0) hours = 1;
                amount = hours * record.getParkingSite().getHourlyRate();
            }
            item.put("amount", amount);
            history.add(item);
        }

        return ResponseEntity.ok(history);
    }
    
    // HTTP GET: /api/users/{userId}/complaints
    @GetMapping("/{userId}/complaints")
    public ResponseEntity<?> getUserComplaints(@PathVariable Long userId) {
        Optional<user> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        
        List<com.sdaproject.smarparking.models.Complaint> complaints = complaintRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (com.sdaproject.smarparking.models.Complaint c : complaints) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("subject", c.getSubject());
            map.put("description", c.getDescription());
            map.put("status", c.getStatus());
            map.put("adminResponse", c.getAdminResponse() != null ? c.getAdminResponse() : "");
            map.put("createdAt", c.getCreatedAt());
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    // HTTP POST: /api/users/{userId}/complaints
    @PostMapping("/{userId}/complaints")
    public ResponseEntity<?> submitComplaint(@PathVariable Long userId, @RequestBody Map<String, String> payload) {
        Optional<user> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        user u = userOpt.get();
        
        String subject = payload.get("subject");
        String description = payload.get("description");
        
        if (subject == null || subject.trim().isEmpty() || description == null || description.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Subject and description are required."));
        }
        
        com.sdaproject.smarparking.models.Complaint complaint = new com.sdaproject.smarparking.models.Complaint(subject.trim(), description.trim(), u);
        complaintRepository.save(complaint);
        
        return ResponseEntity.ok(Map.of("message", "Complaint submitted successfully"));
    }

    // HTTP POST: /api/users/{userId}/complaints/{complaintId}/feedback
    @PostMapping("/{userId}/complaints/{complaintId}/feedback")
    public ResponseEntity<?> submitComplaintFeedback(@PathVariable Long userId, @PathVariable Long complaintId, @RequestBody Map<String, Boolean> payload) {
        Optional<com.sdaproject.smarparking.models.Complaint> opt = complaintRepository.findById(complaintId);
        if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "Complaint not found"));
        
        com.sdaproject.smarparking.models.Complaint c = opt.get();
        if (c.getUser() == null || !c.getUser().getId().equals(userId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Unauthorized to update this complaint"));
        }

        Boolean satisfied = payload.get("satisfied");
        if (satisfied == null) return ResponseEntity.badRequest().body(Map.of("error", "Feedback is required"));

        c.setStatus(satisfied ? "Resolved" : "Pending");
        complaintRepository.save(c);

        return ResponseEntity.ok(Map.of("message", "Feedback submitted"));
    }
}