package com.example.tetonam.image.controller;


import com.example.tetonam.image.service.DrawingService;
import com.example.tetonam.response.ApiResponse;
import com.example.tetonam.user.token.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/image")
public class DrawingController {
    private final DrawingService drawingService;
    private final JwtTokenProvider jwtTokenProvider;
    @PostMapping()
    public ResponseEntity<?> createDrawing(MultipartFile homeImageUrl,MultipartFile treeImageUrl,MultipartFile humanImageFirstUrl,MultipartFile humanImageSecondUrl,@RequestHeader("Authorization") String token){


        List<MultipartFile> multipartFileList=new ArrayList<>();
        multipartFileList.add(homeImageUrl); // 0은 home
        multipartFileList.add(treeImageUrl); // 1은 tree
        multipartFileList.add(humanImageFirstUrl); //2은 human
        multipartFileList.add(humanImageSecondUrl); //3은 human2
        String email = jwtTokenProvider.getEmail(token.substring(7));
        String result=drawingService.createDrawing(email,multipartFileList);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(result));
    }
}


