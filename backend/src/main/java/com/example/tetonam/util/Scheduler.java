package com.example.tetonam.util;


import com.example.tetonam.counseling.domain.Counseling;
import com.example.tetonam.counseling.domain.enums.Status;
import com.example.tetonam.counseling.repository.CounselingRepository;
import com.example.tetonam.kakao.dto.TokenResponseDto;
import com.example.tetonam.exception.handler.TokenHandler;
import com.example.tetonam.kakao.domain.KakaoToken;
import com.example.tetonam.kakao.repository.KakaoTokenRepository;
import com.example.tetonam.response.code.status.ErrorStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class Scheduler {

    private final WebClientUtil webClientUtil;
    private final KakaoTokenRepository kakaoTokenRepository;
    private final CounselingRepository counselingRepository;

    @Value("${kakao.client_id}")
    private String clientId;

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void closeCounseling(){
        LocalDateTime thresholdTime = LocalDateTime.now().minusHours(1);
        List<Counseling> counselingsToClose = counselingRepository.findCounselingsToClose(Status.OPEN, thresholdTime);
        for (Counseling counseling : counselingsToClose) {
            counseling.setStatus(Status.CLOSE);
        }

    }

    @Scheduled(cron = "0 0 0/5 * * *")
    public void reIssueKakaoToken(){
        String url="https://kauth.kakao.com/oauth/token";
        KakaoToken token=kakaoTokenRepository.findById(1L)
                .orElseThrow(()-> new TokenHandler(ErrorStatus._INTERNAL_SERVER_ERROR));
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("grant_type", "refresh_token");
        formData.add("client_id", clientId);
        formData.add("refresh_token", token.getRefreshToken());

        webClientUtil.postReIssue(url,formData, TokenResponseDto.class).subscribe(result -> {;
            token.setAccessToken(result.getAccessToken());
            kakaoTokenRepository.save(token);

        }, error -> {
            error.printStackTrace();
        });
    }
}
