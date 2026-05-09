package com.sdaproject.smarparking.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "parking_records")
public class ParkingRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime parkInTime;
    private LocalDateTime parkOutTime;
    private boolean isPaid = false;
    private String paymentMethod = "Unpaid";
    private Double amount = 0.0;

    // ---> NEW: Dedicated License Plate Column <---
    @Column(name = "license_plate")
    private String licensePlate;

    // ---> NEW: Slot Number to track which specific slot is booked <---
    @Column(name = "slot_number")
    private Integer slotNumber;

    @ManyToOne
    @JoinColumn(name = "site_id")
    private ParkingSite parkingSite;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private user user;

    public ParkingRecord() {
    }

    public ParkingRecord(LocalDateTime parkInTime, ParkingSite parkingSite) {
        this.parkInTime = parkInTime;
        this.parkingSite = parkingSite;
    }

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public LocalDateTime getParkInTime() {
        return parkInTime;
    }

    public void setParkInTime(LocalDateTime parkInTime) {
        this.parkInTime = parkInTime;
    }

    public LocalDateTime getParkOutTime() {
        return parkOutTime;
    }

    public void setParkOutTime(LocalDateTime parkOutTime) {
        this.parkOutTime = parkOutTime;
    }

    public boolean isPaid() {
        return isPaid;
    }

    public void setPaid(boolean paid) {
        this.isPaid = paid;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    // ---> NEW Getters & Setters for License Plate <---
    public String getLicensePlate() {
        return licensePlate;
    }

    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }

    public ParkingSite getParkingSite() {
        return parkingSite;
    }

    public void setParkingSite(ParkingSite parkingSite) {
        this.parkingSite = parkingSite;
    }

    public user getUser() {
        return user;
    }

    public void setUser(user user) {
        this.user = user;
    }

    // ---> Slot Number Getters & Setters <---
    public Integer getSlotNumber() {
        return slotNumber;
    }

    public void setSlotNumber(Integer slotNumber) {
        this.slotNumber = slotNumber;
    }
}