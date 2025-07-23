package com.example.tetonam;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class TeToNamApplication {


    public static void main(String[] args) {
        SpringApplication.run(TeToNamApplication.class, args);
    }

}
