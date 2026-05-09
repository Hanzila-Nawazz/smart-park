package com.sdaproject.smarparking.controller;

import com.sdaproject.smarparking.models.user;
import com.sdaproject.smarparking.repository.ParkingRecordRepository;
import com.sdaproject.smarparking.repository.UserRepository;
import com.sdaproject.smarparking.service.ParkingFacade;
import com.sdaproject.smarparking.service.factory.UserFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    private ParkingFacade parkingFacade;

    // HTTP POST: http://localhost:8080/api/users/register
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> payload) {
        try {
            String name = payload.get("name");
            String contactNo = payload.get("contactNo");
            String vehicleType = payload.get("vehicleType");
            String vehicleNo = payload.get("vehicleNo");
            String cnic = payload.get("cnic");
            String password = payload.get("password");

            user newUser = userFactory.createUser(name, contactNo, vehicleType, vehicleNo, cnic, password);
            user savedUser = userRepository.save(newUser);

            Map<String, Object> response = new HashMap<>();
            response.put("token", "user-auth-token-999");
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

        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "This Vehicle Number is already registered!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Registration failed. Please try again."));
        }
    }

    // HTTP POST: http://localhost:8080/api/users/login
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> payload) {
        String cnic = payload.get("cnic");
        String password = payload.get("password");

        java.util.Optional<com.sdaproject.smarparking.models.RegularUser> userOpt = userRepository.findByCnic(cnic);

        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            com.sdaproject.smarparking.models.RegularUser loggedInUser = userOpt.get();

            Map<String, Object> response = new HashMap<>();
            response.put("token", "user-auth-token-999");
            response.put("message", "Login successful!");

            Map<String, Object> userData = new HashMap<>();
            userData.put("id", loggedInUser.getId());
            userData.put("name", loggedInUser.getName());
            userData.put("cnic", loggedInUser.getCnic());
            userData.put("vehicleNo", loggedInUser.getVehicleNo());
            userData.put("vehicleType", loggedInUser.getVehicleType());
            userData.put("walletBalance", loggedInUser.getWalletBalance());
            userData.put("role", "user");

            response.put("user", userData);
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid CNIC or Password."));
        }
    }

    // HTTP GET: http://localhost:8080/api/users/{userId}/dashboard
    @GetMapping("/{userId}/dashboard")
    public ResponseEntity<?> getUserDashboardStats(@PathVariable Long userId) {
        java.util.Optional<user> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        
        user u = userOpt.get();

        // 1. Get Wallet Balance safely
        double realWalletBalance = 0.0;
        if (u instanceof com.sdaproject.smarparking.models.RegularUser) {
            realWalletBalance = ((com.sdaproject.smarparking.models.RegularUser) u).getWalletBalance();
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

        // 4. Dummy data for the Area Chart to prevent UI crashing
        java.util.List<Map<String, Object>> chartData = java.util.List.of(
            Map.of("hour", "8 AM", "occupancy", 10),
            Map.of("hour", "10 AM", "occupancy", 45),
            Map.of("hour", "12 PM", "occupancy", 80),
            Map.of("hour", "2 PM", "occupancy", 65),
            Map.of("hour", "4 PM", "occupancy", 90),
            Map.of("hour", "6 PM", "occupancy", 40)
        );

        // 5. Package it all for React
        Map<String, Object> response = new HashMap<>();
        response.put("walletBalance", realWalletBalance);
        response.put("activeCount", activeSessions.size());
        response.put("activeText", activeSessionText);
        response.put("totalSessions", totalSessions.size());
        response.put("pendingBills", pendingBills.size());
        response.put("chartData", chartData);

        return ResponseEntity.ok(response);
    }

    // HTTP GET: http://localhost:8080/api/users/{userId}/wallet
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

    // HTTP POST: http://localhost:8080/api/users/{userId}/wallet/topup
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

    // HTTP GET: http://localhost:8080/api/users/{userId}/active-session
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

    // HTTP POST: http://localhost:8080/api/users/sessions/{sessionId}/checkout
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

    // HTTP GET: http://localhost:8080/api/users/{userId}/pending-bills
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

    // HTTP POST: http://localhost:8080/api/users/pending-bills/{sessionId}/pay
    @PostMapping("/pending-bills/{sessionId}/pay")
    public ResponseEntity<?> payPendingBill(@PathVariable Long sessionId, @RequestBody(required = false) Map<String, String> payload) {
        String paymentType = payload != null ? payload.getOrDefault("paymentType", "Cash") : "Cash";
        String result = parkingFacade.payPendingSession(sessionId, paymentType);
        if (result.startsWith("Error")) {
            return ResponseEntity.badRequest().body(Map.of("error", result));
        }
        return ResponseEntity.ok(Map.of("message", result));
    }

    // HTTP PUT: http://localhost:8080/api/users/{userId}
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

    // HTTP POST: http://localhost:8080/api/users/{userId}/password
    @PostMapping("/{userId}/password")
    public ResponseEntity<?> changePassword(@PathVariable Long userId, @RequestBody Map<String, String> payload) {
        String current = payload.getOrDefault("currentPassword", "");
        String next = payload.getOrDefault("newPassword", "");
        if (next.length() < 6) return ResponseEntity.badRequest().body(Map.of("error", "New password must be at least 6 characters"));
        Optional<com.sdaproject.smarparking.models.RegularUser> userOpt = userRepository.findById(userId).filter(u -> u instanceof com.sdaproject.smarparking.models.RegularUser).map(u -> (com.sdaproject.smarparking.models.RegularUser) u);
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "User not found or cannot change password"));
        com.sdaproject.smarparking.models.RegularUser ru = userOpt.get();
        if (!ru.getPassword().equals(current)) return ResponseEntity.status(401).body(Map.of("error", "Current password incorrect"));
        ru.setPassword(next);
        userRepository.save(ru);
        return ResponseEntity.ok(Map.of("message", "Password updated"));
    }

    // HTTP GET: http://localhost:8080/api/users/{userId}/history
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
}