package com.sdaproject.smarparking.repository;

import com.sdaproject.smarparking.models.ParkingSite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ParkingSiteRepository extends JpaRepository<ParkingSite, String> {
    // Basic CRUD methods are built-in
    
    // --- NEW: Fast database count ---
    long countByIsOperational(boolean isOperational);
}