package com.example.tetonam.agora.token.service;

import com.example.tetonam.agora.token.dto.tokenDto;
import com.example.tetonam.agora.token.util.RtcTokenBuilder2;
import com.example.tetonam.exception.handler.BoardHandler;
import com.example.tetonam.response.code.status.ErrorStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
@Slf4j
public class TokenService {
    static int tokenExpirationInSeconds = 3600;
    static int privilegeExpirationInSeconds = 3600;
    @Value("${AGORA_APP_ID}")
    private String appId;
    @Value("${AGORA_APP_CERTIFICATE}")
    private String appCertificate;
    public tokenDto getToken(String counseling_id, int user_id){
        if (appId == null || appId.isEmpty() || appCertificate == null || appCertificate.isEmpty()) {
            throw new BoardHandler(ErrorStatus.CERTIFICATE_EMPTY);
        }
        RtcTokenBuilder2 token = new RtcTokenBuilder2();
        String result = token.buildTokenWithUid(appId, appCertificate, counseling_id, user_id, RtcTokenBuilder2.Role.ROLE_PUBLISHER, tokenExpirationInSeconds, privilegeExpirationInSeconds);
        return tokenDto.toDto(result, counseling_id, user_id);
    }
}
