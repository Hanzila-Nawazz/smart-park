package com.sdaproject.smarparking;
import org.mindrot.jbcrypt.BCrypt;
public class TestBcrypt {
    public static void main(String[] args) {
        String hash = "$2a$10$Y4Fman9TJmY2vKXE7Oax9.6KhFYTgmgfWtSPqK7XjT7CuzOgIRkw2";
        boolean match = BCrypt.checkpw("123", hash);
        System.out.println("Does it match? " + match);
    }
}
