package com.example.tetonam.oauth.common;

import com.example.tetonam.oauth.presentation.OauthServerTypeConverter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.http.HttpMethod;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {


    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(new OauthServerTypeConverter());
    }
}