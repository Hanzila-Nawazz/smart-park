package com.sdaproject.smarparking.models;

public class AdminAuth {
    // 1. Static instance
    private static AdminAuth instance;
    
    // Default credentials
    private String username = "admin123";
    private String password = "123";
    private String email = "admin@smartpark.com";

    // 2. Private constructor prevents instantiation
    private AdminAuth() {}

    // 3. Global access point
    public static AdminAuth getInstance() {
        if (instance == null) {
            instance = new AdminAuth();
        }
        return instance;
    }

    public boolean login(String inputUser, String inputPass) {
        return this.username.equals(inputUser) && this.password.equals(inputPass);
    }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    // Getters and Setters for changing password later
    public void setPassword(String newPass) { this.password = newPass; }
    public String getPassword() { return password; }
}