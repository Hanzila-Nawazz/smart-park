package com.sdaproject.smarparking.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity // This tells Spring Boot: "Make a database table out of this class"
@Table(name = "parking_sites")
public class ParkingSite {

    @Id // This makes siteId the Primary Key in the database
    private String siteId;

    private int maxSiteCapacity;
    private String siteLocation;
    private double hourlyRate;
    private boolean isOperational;

    // Required empty constructor for JPA
    public ParkingSite() {
    }

    public ParkingSite(String siteId, int maxSiteCapacity, String siteLocation, double hourlyRate,
            boolean isOperational) {
        this.siteId = siteId;
        this.maxSiteCapacity = maxSiteCapacity;
        this.siteLocation = siteLocation;
        this.hourlyRate = hourlyRate;
        this.isOperational = isOperational;
    }

    // Getters and Setters
    public String getSiteId() {
        return siteId;
    }

    public void setSiteId(String siteId) {
        this.siteId = siteId;
    }

    public int getMaxSiteCapacity() {
        return maxSiteCapacity;
    }

    public void setMaxSiteCapacity(int maxSiteCapacity) {
        this.maxSiteCapacity = maxSiteCapacity;
    }

    public String getSiteLocation() {
        return siteLocation;
    }

    public void setSiteLocation(String siteLocation) {
        this.siteLocation = siteLocation;
    }

    public double getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(double hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public boolean isOperational() {
        return isOperational;
    }

    public void setOperational(boolean operational) {
        isOperational = operational;
    }
}