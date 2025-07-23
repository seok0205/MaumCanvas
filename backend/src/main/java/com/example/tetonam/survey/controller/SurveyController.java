package com.example.tetonam.survey.controller;

import com.example.tetonam.response.ApiResponse;
import com.example.tetonam.user.dto.EmailRequestDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

public class SurveyController {
    @PostMapping("/send")
    public ResponseEntity<?> create() {

        return ResponseEntity.ok().body(ApiResponse.onSuccess(""));
    }
}
