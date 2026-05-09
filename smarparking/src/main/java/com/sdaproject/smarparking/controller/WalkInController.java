package com.sdaproject.smarparking.controller;

import com.sdaproject.smarparking.models.ParkingRecord;
import com.sdaproject.smarparking.models.ParkingSite;
import com.sdaproject.smarparking.models.user;
import com.sdaproject.smarparking.repository.ParkingRecordRepository;
import com.sdaproject.smarparking.repository.ParkingSiteRepository;
import com.sdaproject.smarparking.repository.UserRepository;
import com.sdaproject.smarparking.service.ParkingFacade;
import com.sdaproject.smarparking.service.factory.UserFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/walkin")
@CrossOrigin(origins = "*")
public class WalkInController {

    @Autowired
    private UserFactory userFactory;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParkingSiteRepository siteRepository;

    @Autowired
    private ParkingRecordRepository recordRepository;

    @Autowired
    private ParkingFacade parkingFacade;

    @PostMapping("/check-in")
    public ResponseEntity<?> checkIn(@RequestBody Map<String, String> payload) {
        String name = payload.getOrDefault("name", "Walk-In User");
        String contact = payload.getOrDefault("contact", "");
        String vehicleType = payload.getOrDefault("vehicleType", "Car");
        String plate = payload.getOrDefault("plate", "").trim();
        String siteId = payload.getOrDefault("siteId", "").trim();

        if (plate.isEmpty() || siteId.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Plate and site are required"));
        }

        Optional<ParkingSite> siteOpt = siteRepository.findById(siteId);
        if (siteOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid site selected"));
        }

        Optional<user> existing = userRepository.findByVehicleNo(plate);
        if (existing.isEmpty()) {
            user walkin = userFactory.createUser(name, contact, vehicleType, plate, null, null);
            userRepository.save(walkin);
        }

        List<Map<String, Object>> slots = parkingFacade.getSiteSlots(siteId);
        List<Map<String, Object>> available = slots.stream()
                .filter(s -> "Available".equalsIgnoreCase(String.valueOf(s.get("status"))))
                .toList();

        if (available.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No available slots at selected site"));
        }

        int index = (int) (Math.random() * available.size());
        Integer slotNumber = (Integer) available.get(index).get("number");

        String result = parkingFacade.parkVehicle(plate, siteId, slotNumber);
        if (result.startsWith("Error")) {
            return ResponseEntity.badRequest().body(Map.of("error", result));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", result);
        response.put("plate", plate);
        response.put("siteId", siteId);
        response.put("site", siteOpt.get().getSiteLocation());
        response.put("slotNumber", slotNumber);
        response.put("checkIn", LocalDateTime.now());
        response.put("token", "WK-" + System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/lookup/{plate}")
    public ResponseEntity<?> lookup(@PathVariable String plate) {
        List<ParkingRecord> activeRecords = recordRepository.findByLicensePlateAndParkOutTimeIsNull(plate);
        if (activeRecords.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No active session found for this plate"));
        }

        ParkingRecord record = activeRecords.get(0);
        double total = parkingFacade.calculateBill(record, LocalDateTime.now());
        long minutes = ChronoUnit.MINUTES.between(record.getParkInTime(), LocalDateTime.now());

        Map<String, Object> response = new HashMap<>();
        response.put("plate", record.getLicensePlate());
        response.put("site", record.getParkingSite() != null ? record.getParkingSite().getSiteLocation() : "Unknown");
        response.put("slot", record.getSlotNumber());
        response.put("checkIn", record.getParkInTime());
        response.put("checkOut", LocalDateTime.now());
        response.put("duration", minutes + " min");
        response.put("total", total);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody Map<String, String> payload) {
        String plate = payload.getOrDefault("plate", "").trim();
        if (plate.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Plate is required"));
        }

        List<ParkingRecord> activeRecords = recordRepository.findByLicensePlateAndParkOutTimeIsNull(plate);
        if (activeRecords.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No active session found for this plate"));
        }

        ParkingRecord record = activeRecords.get(0);
        String result = parkingFacade.closeSession(record, true, "Cash");
        if (result.startsWith("Error")) {
            return ResponseEntity.badRequest().body(Map.of("error", result));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", result);
        response.put("plate", record.getLicensePlate());
        response.put("site", record.getParkingSite() != null ? record.getParkingSite().getSiteLocation() : "Unknown");
        response.put("slot", record.getSlotNumber());
        response.put("checkIn", record.getParkInTime());
        response.put("checkOut", record.getParkOutTime());
        response.put("total", record.getAmount() != null ? record.getAmount() : 0.0);
        return ResponseEntity.ok(response);
    }
}