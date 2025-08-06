package com.example.tetonam.image.controller;


import com.example.tetonam.counseling.dto.MyCounselingDetailResponseDto;
import com.example.tetonam.image.dto.CounselingRagRequestDto;
import com.example.tetonam.image.dto.RecentDrawingResponseDto;
import com.example.tetonam.image.dto.testDto;
import com.example.tetonam.image.service.DrawingService;
import com.example.tetonam.response.ApiResponse;
import com.example.tetonam.user.token.JwtTokenProvider;
import com.example.tetonam.util.WebClientUtil;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/image")
public class DrawingController {
    private final DrawingService drawingService;
    private final JwtTokenProvider jwtTokenProvider;


    @Operation(summary = "그림 저장 API", description = "4장의 그림을 저장합니다..")
    @PostMapping()
    public ResponseEntity<?> createDrawing(MultipartFile homeImageUrl,MultipartFile treeImageUrl,MultipartFile humanImageFirstUrl,MultipartFile humanImageSecondUrl,@RequestHeader("Authorization") String token){
        String email = jwtTokenProvider.getEmail(token.substring(7));

        List<MultipartFile> multipartFileList=new ArrayList<>();
        multipartFileList.add(homeImageUrl); // 0은 home
        multipartFileList.add(treeImageUrl); // 1은 tree
        multipartFileList.add(humanImageFirstUrl); //2은 human
        multipartFileList.add(humanImageSecondUrl); //3은 human2

        String result=drawingService.createDrawing(email,multipartFileList);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(result));
    }

    @GetMapping("/recent-images")
    @Operation(summary = "최근 그림 조회 API", description = "내가 검사한 최근 그림이 나옵니다")
    public ResponseEntity<?> showRecentImages(@RequestHeader("Authorization") String token) {
        String email = jwtTokenProvider.getEmail(token.substring(7));
        List<RecentDrawingResponseDto> recentDrawingResponseDtoList=drawingService.showRecentImages(email);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(recentDrawingResponseDtoList));
    }



    @GetMapping("/counseling/{id}")
    @Operation(summary = "상담의 그림 조회 API", description = "해당 상담의 그림들을 반환합니다")
    public ResponseEntity<?> counselingImage(@RequestHeader("Authorization") String token,@PathVariable Long id) {
        String email = jwtTokenProvider.getEmail(token.substring(7));
        List<RecentDrawingResponseDto> recentDrawingResponseDtoList=drawingService.showCounselingImage(email,id);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(recentDrawingResponseDtoList));
    }

    @PostMapping("/counseling/rag/{id}")
    @Operation(summary = "상담사의 코멘트 Rag API", description = "상담사가 적은 코멘트를 Rag모델을 통해 저장합니다.")
    public ResponseEntity<?> CounselingRag(@RequestHeader("Authorization") String token, @PathVariable Long id, @RequestBody CounselingRagRequestDto counselingRagRequestDto) {
        String email = jwtTokenProvider.getEmail(token.substring(7));
        String result=drawingService.counselingRagSave(email,id,counselingRagRequestDto);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(result));
    }


//    @GetMapping("/{id}")
//    @Operation(summary = "그림 상세 조회 API", description = "RAG모델을 통해 저장된 그림 상세 설명이 나옵니다")
//    public ResponseEntity<?> detailImage(@RequestHeader("Authorization") String token) {
//        String email = jwtTokenProvider.getEmail(token.substring(7));
//
//        return ResponseEntity.ok().body(ApiResponse.onSuccess(recentDrawingResponseDtoList));
//    }



}


