package com.iicmr.eduportal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import com.iicmr.eduportal.config.AppProperties;

@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class EduportalApplication {
    public static void main(String[] args) {
        SpringApplication.run(EduportalApplication.class, args);
    }
}
