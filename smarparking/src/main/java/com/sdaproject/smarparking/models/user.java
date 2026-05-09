package com.sdaproject.smarparking.models;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "user_type", discriminatorType = DiscriminatorType.STRING)

public abstract class user 
{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Primary Key

    private String name;
    private String contactNo;
    private String vehicleType;
    
    @Column(unique = true) // Vehicle numbers should be unique!
    private String vehicleNo;

    public user() {}

    public user(String name, String contactNo, String vehicleType, String vehicleNo) 
    {
        this.name = name;
        this.contactNo = contactNo;
        this.vehicleType = vehicleType;
        this.vehicleNo = vehicleNo;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getContactNo() { return contactNo; }
    public void setContactNo(String contactNo) { this.contactNo = contactNo; }
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
    public String getVehicleNo() { return vehicleNo; }
    public void setVehicleNo(String vehicleNo) { this.vehicleNo = vehicleNo; }
}