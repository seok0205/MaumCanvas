package com.example.tetonam.image.controller;


import com.example.tetonam.counseling.dto.MyCounselingDetailResponseDto;
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



}


