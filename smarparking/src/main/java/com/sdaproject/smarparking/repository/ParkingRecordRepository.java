package com.sdaproject.smarparking.repository;

import com.sdaproject.smarparking.models.ParkingRecord;
import com.sdaproject.smarparking.models.user;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParkingRecordRepository extends JpaRepository<ParkingRecord, Long> {
    
    // Finds active sessions for a specific user
    List<ParkingRecord> findByUserAndParkOutTimeIsNull(user user);

    // Finds active sessions for a specific license plate
    List<ParkingRecord> findByLicensePlateAndParkOutTimeIsNull(String licensePlate);

    // Finds all unpaid records
    List<ParkingRecord> findByUser_IdAndIsPaidFalse(Long userId);

    // Finds closed sessions that are still unpaid
    List<ParkingRecord> findByUser_IdAndIsPaidFalseAndParkOutTimeIsNotNull(Long userId);

    // Finds ALL parking records for a user
    List<ParkingRecord> findByUser_Id(Long userId);

    // For Admin Dashboard mapping
    List<ParkingRecord> findByParkingSite_SiteIdAndParkOutTimeIsNull(String siteId);

    long countByParkOutTimeIsNull();
}