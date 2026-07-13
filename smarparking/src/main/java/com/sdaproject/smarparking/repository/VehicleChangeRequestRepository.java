package com.sdaproject.smarparking.repository;

import com.sdaproject.smarparking.models.VehicleChangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleChangeRequestRepository extends JpaRepository<VehicleChangeRequest, Long> {
    List<VehicleChangeRequest> findByStatus(String status);
    List<VehicleChangeRequest> findByUser_Id(Long userId);
    List<VehicleChangeRequest> findAllByOrderByCreatedAtDesc();
}
