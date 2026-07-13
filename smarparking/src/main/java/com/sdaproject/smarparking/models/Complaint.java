package com.sdaproject.smarparking.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String subject;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String status = "Submitted"; // Submitted, Pending, User Response Pending, Resolved, Dismissed
    
    @Column(columnDefinition = "TEXT")
    private String adminResponse;
    
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private user user;

    public Complaint() {}

    public Complaint(String subject, String description, user user) {
        this.subject = subject;
        this.description = description;
        this.user = user;
        this.createdAt = LocalDateTime.now();
        this.status = "Submitted";
    }

    // Getters and Setters
    public Long getId() { return id; }
    
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public user getUser() { return user; }
    public void setUser(user user) { this.user = user; }
    
    public String getAdminResponse() { return adminResponse; }
    public void setAdminResponse(String adminResponse) { this.adminResponse = adminResponse; }
}
