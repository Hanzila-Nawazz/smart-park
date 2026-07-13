package com.sdaproject.smarparking.security;

import java.util.regex.Pattern;

public class PasswordValidatorUtil {

    // Minimum 8 characters, maximum 25 characters
    // At least one uppercase letter
    // At least one lowercase letter
    // At least one number
    // At least one special character
    private static final String PASSWORD_PATTERN = 
        "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!*()_\\-.\\]\\[{}|:;\"'<>,?/~`]).{8,25}$";

    private static final Pattern pattern = Pattern.compile(PASSWORD_PATTERN);

    public static boolean isValid(String password) {
        if (password == null) {
            return false;
        }
        return pattern.matcher(password).matches();
    }
}
