package com.sdaproject.smarparking.service.payment;

import com.sdaproject.smarparking.models.user;

public interface PaymentStrategy 
{
    // Now it returns our DTO instead of a plain boolean
    PaymentResponse pay(user user, double amount);
    String getPaymentMethodName();
}