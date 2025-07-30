package com.example.tetonam.counseling.controller;

import com.example.tetonam.counseling.dto.CounselingPossibleCounselorResponseDto;
import com.example.tetonam.counseling.dto.CounselingReserveRequestDto;
import com.example.tetonam.counseling.dto.MyCounselingListResponseDto;
import com.example.tetonam.counseling.service.CounselingService;
import com.example.tetonam.response.ApiResponse;
import com.example.tetonam.user.token.JwtTokenProvider;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/counseling")
public class CounselingController {

    private final JwtTokenProvider jwtTokenProvider;
    private final CounselingService counselingService;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmm");


    @GetMapping("")
    @Operation(summary = "상담가능 상담사 조회 API", description = "해당 일자의 상담가능한 상담사리스트를 반환합니다.")
    public ResponseEntity<?> showPossibleCounselor(@RequestHeader("Authorization") String token, @RequestParam LocalDateTime time) {
        String email = jwtTokenProvider.getEmail(token.substring(7));
        List<CounselingPossibleCounselorResponseDto> result=counselingService.showPossibleCounselor(email,time);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(result));
    }

    @PostMapping("")
    @Operation(summary = "상담예약 API", description = "상담사를 선택하여 상담예약을 진행합니다.")
    public ResponseEntity<?> createCounseling(@RequestHeader("Authorization") String token, @RequestBody CounselingReserveRequestDto counselingReserveRequestDto) {
        String email = jwtTokenProvider.getEmail(token.substring(7));
//        String result=counselingService.createCounseling(email,counselingReserveRequestDto);
        String lockKey="counselor:" + counselingReserveRequestDto.getCounselorId() + ":time:" + counselingReserveRequestDto.getTime().format(FORMATTER);
        String result=counselingService.createCounselingWithLock(email,counselingReserveRequestDto,lockKey);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(result));
    }

    @GetMapping("/my-counseling")
    @Operation(summary = "내 상담내역 조회 API", description = "나의 상담내역을 반환합니다")
    public ResponseEntity<?> showMyCounselingList(@RequestHeader("Authorization") String token) {
        String email = jwtTokenProvider.getEmail(token.substring(7));
        List<MyCounselingListResponseDto> result=counselingService.showMyCounselingList(email);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(result));
    }



}
