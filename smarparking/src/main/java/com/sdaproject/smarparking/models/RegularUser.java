package com.sdaproject.smarparking.models;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("REGULAR") // If it's a Regular user, put "REGULAR" in the user_type column
public class RegularUser extends user 
{

    private String cnic;
    private String password;
    private double walletBalance = 0.0;
    
    // NEW FIELD
    private boolean isSuspended = false;

    public RegularUser() {}

    public RegularUser(String name, String contactNo, String vehicleType, String vehicleNo, String cnic, String password) {
        super(name, contactNo, vehicleType, vehicleNo);
        this.cnic = cnic;
        this.password = password;
    }

    // Getters and Setters
    public String getCnic() { return cnic; }
    public void setCnic(String cnic) { this.cnic = cnic; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public double getWalletBalance() { return walletBalance; }
    public void setWalletBalance(double walletBalance) { this.walletBalance = walletBalance; }
    
    public boolean isSuspended() { return isSuspended; }
    public void setSuspended(boolean isSuspended) { this.isSuspended = isSuspended; }
}
