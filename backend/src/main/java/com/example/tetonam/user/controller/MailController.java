package com.example.tetonam.user.controller;

import com.example.tetonam.response.ApiResponse;
import com.example.tetonam.user.dto.EmailCheckDto;
import com.example.tetonam.user.dto.EmailRequestDto;
import com.example.tetonam.user.service.MailSendService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.hibernate.annotations.Check;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
@RequestMapping("/mail")

public class MailController {
    private final MailSendService mailService;


    @PostMapping("/send")
    @Operation(summary = "인증메일 보내기 API", description = "이메일로 인증메일을 보냅니다")
    public ResponseEntity<?> mailSend(@RequestBody @Valid EmailRequestDto emailDto) {
//        String code=mailService.joinEmail(emailDto.getEmail());
         mailService.joinEmail(emailDto.getEmail());

        return ResponseEntity.ok().body(ApiResponse.onSuccess("메일이 전송되었습니다"));
    }

    @PostMapping("/send-password")
    @Operation(summary = "인증메일 보내기 API", description = "이메일로 인증메일을 보냅니다")
    public ResponseEntity<?> mailSendForPassword(@RequestBody @Valid EmailRequestDto emailDto) {
//        String code=mailService.joinEmail(emailDto.getEmail());
        String result=mailService.mailSendForPassword(emailDto.getEmail());

        return ResponseEntity.ok().body(ApiResponse.onSuccess(result));
    }


    @PostMapping("/auth-check")
    @Operation(summary = "인증번호 확인 API", description = "인증번호가 맞는지 확인합니다.")
    public ResponseEntity<?> AuthCheck(@RequestBody @Valid EmailCheckDto emailCheckDto){
        String Checked=mailService.CheckAuthNum(emailCheckDto.getEmail(),emailCheckDto.getAuthNum());
        return ResponseEntity.ok().body(ApiResponse.onSuccess(Checked));

    }
}
    