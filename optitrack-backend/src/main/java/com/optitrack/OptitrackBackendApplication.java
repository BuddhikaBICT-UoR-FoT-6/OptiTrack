package com.optitrack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Purpose: Entry point for the OptiTrack Fleet Management Backend.
 * Activates Spring Boot auto-configuration and background task scheduling.
 */
@SpringBootApplication
@EnableScheduling
public class OptitrackBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(OptitrackBackendApplication.class, args);
	}

}
