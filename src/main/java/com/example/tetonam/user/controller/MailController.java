package com.example.tetonam.user.controller;

import com.example.tetonam.response.ApiResponse;
import com.example.tetonam.user.dto.EmailCheckDto;
import com.example.tetonam.user.dto.EmailRequestDto;
import com.example.tetonam.user.service.MailSendService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.hibernate.annotations.Check;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
public class MailController {
    private final MailSendService mailService;

    @PostMapping("/mail-send")
    public ResponseEntity<?> mailSend(@RequestBody @Valid EmailRequestDto emailDto) {
        String code=mailService.joinEmail(emailDto.getEmail());

        return ResponseEntity.ok().body(ApiResponse.onSuccess(code));
    }

    @PostMapping("/mail-auth-check")
    public ResponseEntity<?> AuthCheck(@RequestBody @Valid EmailCheckDto emailCheckDto){
        String Checked=mailService.CheckAuthNum(emailCheckDto.getEmail(),emailCheckDto.getAuthNum());
        return ResponseEntity.ok().body(ApiResponse.onSuccess(Checked));

    }
}
    