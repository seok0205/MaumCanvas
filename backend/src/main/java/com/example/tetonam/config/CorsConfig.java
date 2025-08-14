package com.example.tetonam.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebMvc
public class CorsConfig {

   @Bean
   public WebMvcConfigurer corsConfigurer() {
       return new WebMvcConfigurer() {
           @Override
           public void addCorsMappings(CorsRegistry registry) {
               registry.addMapping("/**")
                       .allowedOriginPatterns("*") // ✅ 모든 도메인에서 접근 가능하도록 설정
                       .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH")
                       .allowedHeaders("*")
                       .allowCredentials(true); // ✅ 세션 인증 지원 (쿠키 등)
           }
       };
   }
}
