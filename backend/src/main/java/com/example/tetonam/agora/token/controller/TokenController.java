package com.example.tetonam.agora.token.controller;


import com.example.tetonam.agora.token.dto.tokenDto;
import com.example.tetonam.agora.token.service.TokenService;
import com.example.tetonam.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("token/c-id/{counseling_id}/u-id/{user_id}/")
public class TokenController {


    private final TokenService tokenService;
    @GetMapping("")
    @Operation(summary = "아고라 토큰 획득", description = "아고라 토큰 상담 id, 유저 id별로 획득")
    public ResponseEntity<?> getToken(@PathVariable String counseling_id, @PathVariable int user_id){
        tokenDto dto = tokenService.getToken(counseling_id, user_id);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(dto));
    }
}
