package com.example.school.system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SchoolSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(SchoolSystemApplication.class, args);
	}

}
