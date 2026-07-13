package com.sdaproject.smarparking.repository;

import com.sdaproject.smarparking.models.user;
import com.sdaproject.smarparking.models.RegularUser; // IMPORT THIS!
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<user, Long> {    
    
    // Finds any vehicle (Walk-in or Regular) safely, avoiding NonUniqueResultException
    Optional<user> findFirstByVehicleNoOrderByIdDesc(String vehicleNo);

    // Custom query: Explicitly searches the RegularUser subclass for the CNIC
    @Query("SELECT u FROM RegularUser u WHERE u.cnic = :cnic")
    Optional<RegularUser> findByCnic(@Param("cnic") String cnic);
}