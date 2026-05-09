package com.sdaproject.smarparking.service.payment;

import com.sdaproject.smarparking.models.user;
import org.springframework.stereotype.Component;

@Component
public class CashPaymentStrategy implements PaymentStrategy 
{
    
    @Override
    public PaymentResponse pay(user user, double amount) 
    {
        // Return the message so the Controller can send it to the frontend
        return new PaymentResponse(true, "Please collect Rs. " + amount + " in cash at the counter.");
    }

    @Override
    public String getPaymentMethodName() 
    {
        return "Cash";
    }
}