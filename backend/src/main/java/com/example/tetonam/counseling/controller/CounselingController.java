package com.example.tetonam.counseling.controller;

import com.example.tetonam.counseling.dto.*;
import com.example.tetonam.counseling.service.CounselingService;
import com.example.tetonam.response.ApiResponse;
import com.example.tetonam.user.token.JwtTokenProvider;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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


    @GetMapping("/check/valid/{id}")
    @Operation(summary = "화상방에 들어갈 수 있는 권한 확인 API", description = "화상통화 방에 들어갈 수 있는지 확인합니다.")
    public ResponseEntity<?> checkValid(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        String email = jwtTokenProvider.getEmail(token.substring(7));
        String result=counselingService.checkValid(email,id);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(result));
    }

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
        System.out.println(counselingReserveRequestDto.getTime());
//        String result=counselingService.createCounseling(email,counselingReserveRequestDto);
        String lockKey="counselor:" + counselingReserveRequestDto.getCounselorId() + ":time:" + counselingReserveRequestDto.getTime().format(FORMATTER);
        String result=counselingService.createCounselingWithLock(email,counselingReserveRequestDto,lockKey);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(result));
    }

    @GetMapping("/my-counseling-counselor")
    @PreAuthorize("hasRole('COUNSELOR')")
    @Operation(summary = "내(상담사) 상담내역 전체 조회 API", description = "나의 전체 상담내역을 반환합니다")
    public ResponseEntity<?> showCounselorCounselingList(@RequestHeader("Authorization") String token) {
        String email = jwtTokenProvider.getEmail(token.substring(7));
        List<CounselorCounselingListResponseDto> result=counselingService.showCounselorCounselingList(email);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(result));
    }


    @GetMapping("/my-counseling-student")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "내(학생) 상담내역 전체 조회 API", description = "나의 전체 상담내역을 반환합니다")
    public ResponseEntity<?> showStudentCounselingList(@RequestHeader("Authorization") String token) {
        String email = jwtTokenProvider.getEmail(token.substring(7));
        List<StudentCounselingListResponseDto> result=counselingService.showStudentCounselingList(email);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(result));
    }

    @GetMapping("/my-counseling/{id}")
    @Operation(summary = "내 상담내역 상세 조회 API", description = "나의 상담내역을 상세 조회합니다")
    public ResponseEntity<?> showMyCounselingDetail(@RequestHeader("Authorization") String token,@PathVariable Long id) {
        String email = jwtTokenProvider.getEmail(token.substring(7));
         CounselingDetailResponseDto result=counselingService.showMyCounselingDetail(email,id);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(result));
    }

    @GetMapping("/my-counseling-recent")
    @Operation(summary = "학생 메인 다가오는상담 조회 API", description = "나의 제일 가까운 상담내역을 반환합니다")
    public ResponseEntity<?> showMyRecentCounseling(@RequestHeader("Authorization") String token) {
        String email = jwtTokenProvider.getEmail(token.substring(7));
        StudentCounselingListResponseDto result=counselingService.showMyRecentCounseling(email);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(result));
    }





}
