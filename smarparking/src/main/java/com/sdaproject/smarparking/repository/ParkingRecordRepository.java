package com.sdaproject.smarparking.repository;

import com.sdaproject.smarparking.models.ParkingRecord;
import com.sdaproject.smarparking.models.user;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ParkingRecordRepository extends JpaRepository<ParkingRecord, Long> {
    
    List<ParkingRecord> findByUserAndParkOutTimeIsNull(user user);
    List<ParkingRecord> findByLicensePlateAndParkOutTimeIsNull(String licensePlate);
    List<ParkingRecord> findByUser_IdAndIsPaidFalse(Long userId);
    List<ParkingRecord> findByUser_IdAndIsPaidFalseAndParkOutTimeIsNotNull(Long userId);
    List<ParkingRecord> findByUser_Id(Long userId);
    List<ParkingRecord> findByParkingSite_SiteIdAndParkOutTimeIsNull(String siteId);
    List<ParkingRecord> findByParkingSite_SiteIdAndSlotNumberAndParkOutTimeIsNull(String siteId, Integer slotNumber);
    long countByParkOutTimeIsNull();
    List<ParkingRecord> findByIsPaidFalse();

    // FIXED: Back to safe JPQL so it doesn't crash the Overview dashboard
    @Query("SELECT COALESCE(SUM(r.amount), 0.0) FROM ParkingRecord r WHERE r.isPaid = true")
    Double calculateTotalRevenue();

    @Query("SELECT COALESCE(SUM(r.amount), 0.0) FROM ParkingRecord r WHERE r.isPaid = true AND r.parkOutTime >= :startOfDay AND r.parkOutTime < :endOfDay")
    Double calculateRevenueBetween(@Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay);

    @Query("SELECT r FROM ParkingRecord r WHERE r.parkInTime >= :startDate")
    List<ParkingRecord> findRecordsSince(@Param("startDate") LocalDateTime startDate);
    
    List<ParkingRecord> findByLicensePlateIgnoreCase(String licensePlate);

    @Query(
            value = "SELECT r FROM ParkingRecord r " +
                    "LEFT JOIN r.parkingSite s " +
                    "WHERE (:search = '' OR LOWER(r.licensePlate) LIKE LOWER(CONCAT('%', :search, '%'))) " +
                    "AND (:siteId = 'all' OR s.siteId = :siteId) " +
                    "AND (:status = 'all' OR (:status = 'Paid' AND r.isPaid = true) OR (:status = 'Unpaid' AND r.isPaid = false)) " +
                    "ORDER BY r.parkInTime DESC, r.id DESC",
            countQuery = "SELECT COUNT(r) FROM ParkingRecord r " +
                    "LEFT JOIN r.parkingSite s " +
                    "WHERE (:search = '' OR LOWER(r.licensePlate) LIKE LOWER(CONCAT('%', :search, '%'))) " +
                    "AND (:siteId = 'all' OR s.siteId = :siteId) " +
                    "AND (:status = 'all' OR (:status = 'Paid' AND r.isPaid = true) OR (:status = 'Unpaid' AND r.isPaid = false))"
    )
    Page<ParkingRecord> findPaginatedAndFiltered(
            @Param("search") String search,
            @Param("siteId") String siteId,
            @Param("status") String status,
            Pageable pageable);
}