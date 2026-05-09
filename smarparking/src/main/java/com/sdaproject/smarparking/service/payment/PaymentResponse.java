package com.sdaproject.smarparking.service.payment;

// This object holds the data that will eventually be sent to the Web UI as JSON
public class PaymentResponse 
{
    private boolean success;
    private String message;

    public PaymentResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
}