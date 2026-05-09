package com.sdaproject.smarparking.models;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("WALK_IN") // If it's a Walk-In user, put "WALK_IN" in the user_type column
public class WalkInUser extends user {

    public WalkInUser() {}

    public WalkInUser(String name, String contactNo, String vehicleType, String vehicleNo) 
    {
        super(name, contactNo, vehicleType, vehicleNo);
    }
    // Walk-in users don't have extra fields like passwords or wallets for now!
}