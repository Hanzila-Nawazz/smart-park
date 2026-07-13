package com.sdaproject.smarparking.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicle_change_request")
public class VehicleChangeRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private user user;

    private String oldPlate;
    
    @Column(nullable = false)
    private String newPlate;
    
    private String oldType;
    
    @Column(nullable = false)
    private String newType;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    private LocalDateTime createdAt = LocalDateTime.now();

    public VehicleChangeRequest() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public com.sdaproject.smarparking.models.user getUser() { return user; }
    public void setUser(com.sdaproject.smarparking.models.user user) { this.user = user; }

    public String getOldPlate() { return oldPlate; }
    public void setOldPlate(String oldPlate) { this.oldPlate = oldPlate; }

    public String getNewPlate() { return newPlate; }
    public void setNewPlate(String newPlate) { this.newPlate = newPlate; }

    public String getOldType() { return oldType; }
    public void setOldType(String oldType) { this.oldType = oldType; }

    public String getNewType() { return newType; }
    public void setNewType(String newType) { this.newType = newType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
