package com.example.tetonam.user.controller;


import com.example.tetonam.image.domain.DrawingResult;
import com.example.tetonam.response.ApiResponse;
import com.example.tetonam.user.dto.KakaoTokenResponseDto;
import com.example.tetonam.user.dto.KakaoUserInfoResponseDto;
import com.example.tetonam.user.service.KakaoService;
import com.example.tetonam.util.WebClientUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

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
    public ResponseEntity<?> findFriends() {

        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("template_id", "123284");
        formData.add("receiver_uuids", "[\"-s38z_zP-87i0-fS597t3OvH9sT9zvbB-H8\"]");
        formData.add("template_args", "{\"TITLE\":\"타이틀입니다.\", \"DETAIL\":\"상세 내용입니다.\", \"REGI_WEB_DOMAIN\":\"https://nexon.com\"}");

        webClientUtil.postForm("https://kapi.kakao.com/v1/api/talk/friends/message/send", formData, String.class)
                .subscribe(result -> {
                    System.out.println(result);
                }, error -> {
                    error.printStackTrace();
                });




        return ResponseEntity.ok().body(ApiResponse.onSuccess("fuck"));
    }
}