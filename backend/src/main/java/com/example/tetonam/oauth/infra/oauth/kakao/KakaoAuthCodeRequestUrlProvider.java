package com.example.tetonam.oauth.infra;

import com.example.tetonam.oauth.domain.AuthCodeRequestUrlProvider;
import com.example.tetonam.oauth.domain.OauthServerType;
import com.example.tetonam.oauth.infra.config.KakaoOauthConfig;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

@Component
@RequiredArgsConstructor
public class KakaoAuthCodeRequestUrlProvider implements AuthCodeRequestUrlProvider {

    private final KakaoOauthConfig kakaoOauthConfig;

    @Override
    public OauthServerType supportServer() {
        return OauthServerType.KAKAO;
    }

    @Override
    public String provide() {
        System.out.println(kakaoOauthConfig.redirectUri()+"리다이렉");
        return UriComponentsBuilder
                .fromUriString("https://kauth.kakao.com/oauth/authorize")
                .queryParam("response_type", "code")
                .queryParam("client_id", kakaoOauthConfig.clientId())
                .queryParam("redirect_uri", kakaoOauthConfig.redirectUri())
                .queryParam("scope", String.join(",", kakaoOauthConfig.scope()))
                .toUriString();
    }
}