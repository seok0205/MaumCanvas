package com.example.tetonam.kakao.contoroller;


import com.example.tetonam.response.ApiResponse;
import com.example.tetonam.user.domain.User;
import com.example.tetonam.user.dto.KakaoTokenResponseDto;
import com.example.tetonam.kakao.service.KakaoService;
import com.example.tetonam.util.WebClientUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("")
public class KakaoLoginController {
    private final KakaoService kakaoService;
    private final WebClientUtil webClientUtil;

    @GetMapping("/callback")
    public ResponseEntity<?> callback(@RequestParam("code") String code) {
        KakaoTokenResponseDto Token = kakaoService.getAccessTokenFromKakao(code);
//        KakaoUserInfoResponseDto userInfo = kakaoService.getUserInfo(accessToken);

//        System.out.println(userInfo);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(Token));
    }

    @GetMapping("/send-mail")
    public ResponseEntity<?> sendMessage() {

//        kakaoService.sendMessage("타이틀 테스트","상세보기 테스트","https://www.naver.com/");
        return ResponseEntity.ok().body(ApiResponse.onSuccess("fuck"));
    }
}