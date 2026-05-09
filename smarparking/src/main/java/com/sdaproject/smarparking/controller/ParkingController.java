package com.sdaproject.smarparking.controller;

import com.sdaproject.smarparking.models.ParkingSite;
import com.sdaproject.smarparking.service.ParkingFacade;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/parking")
@CrossOrigin(origins = "*") // Crucial for React
public class ParkingController {

    @Autowired
    private ParkingFacade parkingFacade;

    // NEW: Safe endpoint for the dropdown to load sites!
    @GetMapping("/sites")
    public ResponseEntity<List<ParkingSite>> getAllSites() {
        return ResponseEntity.ok(parkingFacade.getAllSites());
    }

    @PostMapping("/check-in")
    public ResponseEntity<String> checkInVehicle(@RequestBody Map<String, String> payload) {
        String vehicleNo = payload.get("vehicleNo");
        String siteId = payload.get("siteId");
        String slotIdStr = payload.get("slotId");

        // Extract slot number from slotId (e.g., "S001_3" -> 3)
        Integer slotNumber = null;
        if (slotIdStr != null && slotIdStr.contains("_")) {
            try {
                slotNumber = Integer.parseInt(slotIdStr.split("_")[1]);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body("Error: Invalid slot format.");
            }
        }

        String resultMessage = parkingFacade.parkVehicle(vehicleNo, siteId, slotNumber);

        if (resultMessage.startsWith("Error")) {
            return ResponseEntity.badRequest().body(resultMessage);
        }
        return ResponseEntity.ok(resultMessage);
    }

    @PostMapping("/check-out")
    public ResponseEntity<String> checkOutVehicle(@RequestBody Map<String, String> payload) {
        String vehicleNo = payload.get("vehicleNo");
        String paymentType = payload.get("paymentType");

        String resultMessage = parkingFacade.checkoutVehicle(vehicleNo, paymentType);

        if (resultMessage.startsWith("Error")) {
            return ResponseEntity.badRequest().body(resultMessage);
        }
        return ResponseEntity.ok(resultMessage);
    }

    @GetMapping("/sites/{siteId}/slots")
    public ResponseEntity<List<Map<String, Object>>> getSiteSlots(@PathVariable String siteId) {
        return ResponseEntity.ok(parkingFacade.getSiteSlots(siteId));
    }
}