package com.sdaproject.smarparking.models;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;

@Entity
@Table(name = "parking_records")
public class ParkingRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime parkInTime;
    private LocalDateTime parkOutTime;

    // Fix: Explicitly map the boolean to an Integer column (1/0)
    @Convert(converter = org.hibernate.type.NumericBooleanConverter.class)
    @Column(name = "is_paid")
    private boolean isPaid = false;

    private String paymentMethod = "Unpaid";
    private Double amount = 0.0;

    @Column(name = "license_plate")
    private String licensePlate;

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

    public Integer getSlotNumber() {
        return slotNumber;
    }

    public void setSlotNumber(Integer slotNumber) {
        this.slotNumber = slotNumber;
    }
}