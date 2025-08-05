package com.example.tetonam;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.redisson.api.RedissonClient;


import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
@ActiveProfiles("test")
@SpringBootTest
class TeToNamApplicationTests {

    @Test
    void contextLoads() {
        System.out.println("Application context loaded successfully.");
    }
}
