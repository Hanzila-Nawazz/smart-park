package com.sdaproject.smarparking.models.builder;

import com.sdaproject.smarparking.models.ParkingSite;

public class ParkingSiteBuilder 
{
    private String siteId;
    private int maxSiteCapacity;
    private String siteLocation;
    private double hourlyRate;
    private boolean isOperational;

    public ParkingSiteBuilder setSiteId(String siteId) {
        this.siteId = siteId;
        return this;
    }

    public ParkingSiteBuilder setMaxSiteCapacity(int maxSiteCapacity) {
        this.maxSiteCapacity = maxSiteCapacity;
        return this;
    }

    public ParkingSiteBuilder setSiteLocation(String siteLocation) {
        this.siteLocation = siteLocation;
        return this;
    }

    public ParkingSiteBuilder setHourlyRate(double hourlyRate) {
        this.hourlyRate = hourlyRate;
        return this;
    }

    public ParkingSiteBuilder setOperational(boolean isOperational) {
        this.isOperational = isOperational;
        return this;
    }

    public ParkingSite build() {
        return new ParkingSite(siteId, maxSiteCapacity, siteLocation, hourlyRate, isOperational);
    }
}