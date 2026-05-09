package com.sdaproject.smarparking.service.events;

// This is the message that gets broadcasted to the system
public class PaymentCompletedEvent 
{
    private final String siteId;
    private final double amount;
    private final String paymentMethod;

    public PaymentCompletedEvent(String siteId, double amount, String paymentMethod) {
        this.siteId = siteId;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
    }

    public String getSiteId() { return siteId; }
    public double getAmount() { return amount; }
    public String getPaymentMethod() { return paymentMethod; }
}