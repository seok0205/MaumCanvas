package com.example.tetonam.diagnosis.controller;

import com.example.tetonam.diagnosis.domain.enums.Category;
import com.example.tetonam.diagnosis.dto.ShowAllQuestionnaireDto;
import com.example.tetonam.diagnosis.dto.ShowCategoryQuestionnaireDto;
import com.example.tetonam.diagnosis.service.SurveyService;
import com.example.tetonam.response.ApiResponse;
import com.example.tetonam.user.token.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/mind")
public class SurveyController {

    private final SurveyService surveyService;
    private final JwtTokenProvider jwtTokenProvider;


    @PostMapping("/questionnaire")
    public ResponseEntity<?> createQuestionnaire(@RequestHeader("Authorization") String token, @RequestParam("score") int score, @RequestParam("category") Category category) {
        String email = jwtTokenProvider.getEmail(token.substring(7));
        String result=surveyService.questionnaireCreate(email,score,category);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(result));
    }
    @GetMapping("/questionnaire")
    public ResponseEntity<?> showQuestionnaire(@RequestHeader("Authorization") String token) {
        String email = jwtTokenProvider.getEmail(token.substring(7));
        List<ShowAllQuestionnaireDto> result=surveyService.showQuestionnaire(email);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(result));
    }

    @GetMapping("/questionnaire/{category}")
    public ResponseEntity<?> showCategoryQuestionnaire(@RequestHeader("Authorization") String token,@PathVariable("category") Category category) {
        String email = jwtTokenProvider.getEmail(token.substring(7));
        List<ShowCategoryQuestionnaireDto> result=surveyService.showCategoryQuestionnaire(email,category);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(result));
    }

}
