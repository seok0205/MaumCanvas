package com.example.tetonam.diagnosis.controller;

import com.example.tetonam.diagnosis.domain.enums.Category;
import com.example.tetonam.diagnosis.service.SurveyService;
import com.example.tetonam.response.ApiResponse;
import com.example.tetonam.user.token.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/mind")
public class SurveyController {

    private final SurveyService surveyService;
    private final JwtTokenProvider jwtTokenProvider;


    @PostMapping("/questionnaire")
    public ResponseEntity<?> stressCreate(@RequestHeader("Authorization") String token, @RequestParam("score") int score,@RequestParam("category") Category category) {
        String email = jwtTokenProvider.getEmail(token.substring(7));
        String result=surveyService.stressCreate(email,score,category);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(result));
    }
}
