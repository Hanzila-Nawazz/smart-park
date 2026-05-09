package com.sdaproject.smarparking.service;

import com.sdaproject.smarparking.service.events.PaymentCompletedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class SalesObserver {

   
    private double totalDailyRevenue = 0.0;

    @EventListener
    public void onPaymentCompleted(PaymentCompletedEvent event) {
        
        // Silently update the state. No CLI prints.
        totalDailyRevenue += event.getAmount();
        
    }

    // The AdminController calls this to send the JSON response to the web frontend
    public double getTotalDailyRevenue() {
        return totalDailyRevenue;
    }
}