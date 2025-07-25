package com.example.tetonam.image.controller;

import com.example.tetonam.image.service.AwsS3Service;
import com.example.tetonam.response.ApiResponse;
import com.example.tetonam.user.token.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/iamge")
public class ImageController {
    private final AwsS3Service awsS3Service;
//    @PostMapping()
//    public ResponseEntity<?> uploadFile(List<MultipartFile> multipartFile){
//
//
////        return ResponseEntity.ok().body(ApiResponse.onSuccess(awsS3Service.uploadFile(multipartFile)));
//
//    }
}

