package com.sdaproject.smarparking.service.factory;

import com.sdaproject.smarparking.models.RegularUser;
import com.sdaproject.smarparking.models.user;
import com.sdaproject.smarparking.models.WalkInUser;
import org.springframework.stereotype.Component;

@Component
public class UserFactory 
{

    // If the web form provides a CNIC, it creates a Regular User. If null, it creates Walk-in.
    public user createUser(String name, String contactNo, String vehicleType, String vehicleNo, String cnic, String password) {
        
        if (cnic != null && !cnic.isEmpty()) {
            return new RegularUser(name, contactNo, vehicleType, vehicleNo, cnic, password);
        } else {
            return new WalkInUser(name, contactNo, vehicleType, vehicleNo);
        }
    }
}