package com.sdaproject.smarparking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableCaching
@EnableScheduling
public class SmarparkingApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmarparkingApplication.class, args);
	}

	@Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager();
    }

}
