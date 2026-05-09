package com.sdaproject.smarparking;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class SmarparkingApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmarparkingApplication.class, args);
	}

	@Bean
	CommandLineRunner cleanupParkingRecordSchema(JdbcTemplate jdbcTemplate) {
		return args -> {
			Integer slotIdColumnCount = jdbcTemplate.queryForObject(
					"SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'parking_records' AND column_name = 'slot_id'",
					Integer.class);

			if (slotIdColumnCount != null && slotIdColumnCount > 0) {
				jdbcTemplate.execute("ALTER TABLE parking_records DROP COLUMN slot_id");
			}
		};
	}

}
