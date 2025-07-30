package com.example.tetonam.diagnosis.controller;

import com.example.tetonam.diagnosis.domain.enums.Category;
import com.example.tetonam.diagnosis.dto.ShowAllQuestionnaireDto;
import com.example.tetonam.diagnosis.dto.ShowCategoryQuestionnaireDto;
import com.example.tetonam.diagnosis.service.SurveyService;
import com.example.tetonam.response.ApiResponse;
import com.example.tetonam.user.token.JwtTokenProvider;
import io.swagger.v3.oas.annotations.Operation;
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
    @Operation(summary = "설문결과 저장 API", description = "설문했던 결과(점수)를 저장합니다.")
    public ResponseEntity<?> createQuestionnaire(@RequestHeader("Authorization") String token, @RequestParam("score") int score, @RequestParam("category") Category category) {
        String email = jwtTokenProvider.getEmail(token.substring(7));
        String result=surveyService.questionnaireCreate(email,score,category);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(result));
    }
    @GetMapping("/questionnaire")
    @Operation(summary = "카테고리 설문결과 반환 API", description = "카테고리별 설문결과를 반환합니다.")
    public ResponseEntity<?> showQuestionnaire(@RequestHeader("Authorization") String token) {
        String email = jwtTokenProvider.getEmail(token.substring(7));
        List<ShowAllQuestionnaireDto> result=surveyService.showQuestionnaire(email);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(result));
    }

    @GetMapping("/questionnaire/{category}")
    @Operation(summary = "특정 카테고리 설문결과 전체반환 API", description = "해당 카테고리의 설문결과를 모두 반환합니다.")
    public ResponseEntity<?> showCategoryQuestionnaire(@RequestHeader("Authorization") String token,@PathVariable("category") Category category) {
        String email = jwtTokenProvider.getEmail(token.substring(7));
        List<ShowCategoryQuestionnaireDto> result=surveyService.showCategoryQuestionnaire(email,category);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(result));
    }

}
