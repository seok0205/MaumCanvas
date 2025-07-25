package com.example.tetonam.counseling.controller;

import com.example.tetonam.counseling.dto.CounselorResponseDto;
import com.example.tetonam.counseling.service.CounselingService;
import com.example.tetonam.diagnosis.domain.enums.Category;
import com.example.tetonam.diagnosis.dto.ShowAllQuestionnaireDto;
import com.example.tetonam.diagnosis.dto.ShowCategoryQuestionnaireDto;
import com.example.tetonam.diagnosis.service.SurveyService;
import com.example.tetonam.response.ApiResponse;
import com.example.tetonam.user.token.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/counseling")
public class CounselingController {

    private final JwtTokenProvider jwtTokenProvider;
    private final CounselingService counselingService;
    @GetMapping("")
    public ResponseEntity<?> showPossibleCounselor(@RequestHeader("Authorization") String token, @RequestParam LocalDateTime time) {
        String email = jwtTokenProvider.getEmail(token.substring(7));
        List<CounselorResponseDto> result=counselingService.showPossibleCounselor(email,time);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(result));
    }

}
