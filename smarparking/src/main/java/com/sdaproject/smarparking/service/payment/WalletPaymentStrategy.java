package com.sdaproject.smarparking.service.payment;

import com.sdaproject.smarparking.models.RegularUser;
import com.sdaproject.smarparking.models.user;
import org.springframework.stereotype.Component;

@Component
public class WalletPaymentStrategy implements PaymentStrategy {
    
    @Override
    public PaymentResponse pay(user user, double amount) 
    {
        if (user instanceof RegularUser) 
            {
            RegularUser regUser = (RegularUser) user;
            if (regUser.getWalletBalance() >= amount) {
                regUser.setWalletBalance(regUser.getWalletBalance() - amount);
                
                return new PaymentResponse(true, "Wallet payment successful. New balance: Rs. " + regUser.getWalletBalance());
            }
        }
        return new PaymentResponse(false, "Payment failed: Insufficient wallet balance or invalid user type.");
    }

    @Override
    public String getPaymentMethodName() {
        return "App Wallet";
    }
}