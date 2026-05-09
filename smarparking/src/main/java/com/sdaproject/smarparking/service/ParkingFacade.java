package com.sdaproject.smarparking.service;

import com.sdaproject.smarparking.models.ParkingRecord;
import com.sdaproject.smarparking.models.ParkingSite;
import com.sdaproject.smarparking.models.RegularUser;
import com.sdaproject.smarparking.models.WalkInUser;
import com.sdaproject.smarparking.models.user;
import com.sdaproject.smarparking.repository.ParkingRecordRepository;
import com.sdaproject.smarparking.repository.ParkingSiteRepository;
import com.sdaproject.smarparking.repository.UserRepository;
import com.sdaproject.smarparking.service.payment.CashPaymentStrategy;
import com.sdaproject.smarparking.service.payment.PaymentResponse;
import com.sdaproject.smarparking.service.payment.WalletPaymentStrategy;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class ParkingFacade {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParkingSiteRepository siteRepository;

    @Autowired
    private ParkingRecordRepository recordRepository;

    @Autowired
    private CashPaymentStrategy cashStrategy;

    @Autowired
    private WalletPaymentStrategy walletStrategy;

    @Autowired
    private org.springframework.context.ApplicationEventPublisher eventPublisher;

    public List<ParkingSite> getAllSites() {
        return siteRepository.findAll();
    }

    public double calculateBill(ParkingRecord record, java.time.LocalDateTime endTime) {
        if (record.getParkingSite() == null || record.getParkInTime() == null || endTime == null) {
            return 0.0;
        }

        long minutesParked = java.time.Duration.between(record.getParkInTime(), endTime).toMinutes();
        double hours = Math.ceil(minutesParked / 60.0);
        if (hours == 0) {
            hours = 1;
        }
        return hours * record.getParkingSite().getHourlyRate();
    }

    public String closeSession(ParkingRecord record, boolean payNow, String paymentType) {
        if (record.getParkOutTime() != null) {
            return "Error: Session is already closed.";
        }

        double amount = calculateBill(record, LocalDateTime.now());
        record.setParkOutTime(LocalDateTime.now());
        record.setAmount(amount);
        record.setPaymentMethod(payNow ? paymentType : "Pending");
        record.setPaid(payNow);
        recordRepository.save(record);

        if (payNow) {
            user recordUser = record.getUser();
            if (recordUser != null) {
                eventPublisher.publishEvent(new com.sdaproject.smarparking.service.events.PaymentCompletedEvent(
                        record.getParkingSite().getSiteId(), amount, paymentType));
            }
        }

        return payNow
                ? "Checkout complete! Total Bill: Rs. " + amount
                : "Session closed. Bill added to pending dues: Rs. " + amount;
    }

    public String payPendingSession(Long sessionId, String paymentType) {
        Optional<ParkingRecord> recordOpt = recordRepository.findById(sessionId);
        if (recordOpt.isEmpty()) {
            return "Error: Session not found.";
        }

        ParkingRecord record = recordOpt.get();
        if (record.isPaid()) {
            return "Error: Bill is already paid.";
        }

        user sessionUser = record.getUser();
        if (sessionUser == null) {
            return "Error: Session user not found.";
        }

        PaymentResponse paymentResponse;
        double amount = record.getAmount() != null && record.getAmount() > 0
                ? record.getAmount()
                : calculateBill(record,
                        record.getParkOutTime() != null ? record.getParkOutTime() : LocalDateTime.now());

        if (paymentType.equalsIgnoreCase("Wallet")) {
            paymentResponse = walletStrategy.pay(sessionUser, amount);
        } else {
            paymentResponse = cashStrategy.pay(sessionUser, amount);
        }

        if (!paymentResponse.isSuccess()) {
            return "Error: " + paymentResponse.getMessage();
        }

        record.setPaid(true);
        record.setPaymentMethod(paymentType);
        if (record.getAmount() == null || record.getAmount() == 0.0) {
            record.setAmount(amount);
        }
        recordRepository.save(record);
        if (sessionUser instanceof com.sdaproject.smarparking.models.RegularUser regularUser) {
            userRepository.save(regularUser);
        }

        eventPublisher.publishEvent(new com.sdaproject.smarparking.service.events.PaymentCompletedEvent(
                record.getParkingSite().getSiteId(), amount, paymentType));
        return "Bill paid successfully! Total Bill: Rs. " + amount;
    }

    // Feature: Check-In
    public synchronized String parkVehicle(String vehicleNo, String siteId, Integer slotNumber) {

        Optional<user> userOpt = userRepository.findByVehicleNo(vehicleNo);
        Optional<ParkingSite> siteOpt = siteRepository.findById(siteId);

        if (userOpt.isEmpty())
            return "Error: User not found.";
        if (siteOpt.isEmpty())
            return "Error: Parking site not found.";

        ParkingSite site = siteOpt.get();

        if (!site.isOperational())
            return "Error: Site is not operational.";

        List<ParkingRecord> activeRecords = recordRepository.findByLicensePlateAndParkOutTimeIsNull(vehicleNo);
        if (!activeRecords.isEmpty()) {
            return "Error: Vehicle already has an active parking session.";
        }

        // If a specific slot is requested, validate it's available
        if (slotNumber != null) {
            // Check if slot is within capacity
            if (slotNumber < 1 || slotNumber > site.getMaxSiteCapacity()) {
                return "Error: Slot number is out of range.";
            }

            // Check if slot is already occupied
            List<ParkingRecord> slotOccupied = recordRepository.findAll().stream()
                    .filter(r -> r.getParkingSite().getSiteId().equals(siteId)
                            && r.getSlotNumber() != null
                            && r.getSlotNumber().equals(slotNumber)
                            && r.getParkOutTime() == null)
                    .toList();

            if (!slotOccupied.isEmpty()) {
                return "Error: Selected slot is already occupied.";
            }
        }

        ParkingRecord newRecord = new ParkingRecord(LocalDateTime.now(), site);
        newRecord.setUser(userOpt.get());
        newRecord.setLicensePlate(vehicleNo);
        newRecord.setSlotNumber(slotNumber);
        recordRepository.save(newRecord);

        return "Success: Vehicle parked successfully at slot " + (slotNumber != null ? slotNumber : "auto-assigned")
                + "!";
    }

    // Feature: Check-Out & Billing
    public String checkoutVehicle(String vehicleNo, String paymentType) {

        Optional<user> userOpt = userRepository.findByVehicleNo(vehicleNo);
        if (userOpt.isEmpty())
            return "Error: User not found.";

        List<ParkingRecord> activeRecords = recordRepository.findByLicensePlateAndParkOutTimeIsNull(vehicleNo);
        if (activeRecords.isEmpty())
            return "Error: No active parking session found for this vehicle.";

        ParkingRecord record = activeRecords.get(0);
        return closeSession(record, !paymentType.equalsIgnoreCase("Later"),
                paymentType.equalsIgnoreCase("Later") ? "Pending" : "Cash");
    }

    // Feature: Get slots occupancy for a site
    public List<Map<String, Object>> getSiteSlots(String siteId) {
        Optional<ParkingSite> siteOpt = siteRepository.findById(siteId);
        if (siteOpt.isEmpty())
            return List.of();

        ParkingSite site = siteOpt.get();

        // Get all active parking records for this site
        List<ParkingRecord> activeRecords = recordRepository.findByParkingSite_SiteIdAndParkOutTimeIsNull(siteId);

        // Create a set of occupied slot numbers for quick lookup
        java.util.Set<Integer> occupiedSlots = new java.util.HashSet<>();
        java.util.Map<Integer, ParkingRecord> slotRecordMap = new java.util.HashMap<>();
        for (ParkingRecord record : activeRecords) {
            if (record.getSlotNumber() != null) {
                occupiedSlots.add(record.getSlotNumber());
                slotRecordMap.put(record.getSlotNumber(), record);
            }
        }

        List<Map<String, Object>> slots = new java.util.ArrayList<>();
        for (int i = 1; i <= site.getMaxSiteCapacity(); i++) {
            Map<String, Object> slot = new HashMap<>();
            slot.put("id", siteId + "_" + i);
            slot.put("number", i);

            // Check if this specific slot is occupied
            if (occupiedSlots.contains(i)) {
                slot.put("status", "Occupied");
                ParkingRecord record = slotRecordMap.get(i);
                if (record != null && record.getUser() != null) {
                    slot.put("vehiclePlate", record.getLicensePlate());
                    slot.put("vehicleType", record.getUser().getVehicleType());
                    if (record.getUser() instanceof RegularUser) {
                        slot.put("userType", "Regular");
                    } else if (record.getUser() instanceof WalkInUser) {
                        slot.put("userType", "Walk-In");
                    } else {
                        slot.put("userType", record.getUser().getClass().getSimpleName());
                    }
                    slot.put("checkIn", record.getParkInTime());
                }
            } else {
                slot.put("status", "Available");
            }
            slots.add(slot);
        }

        return slots;
    }
}