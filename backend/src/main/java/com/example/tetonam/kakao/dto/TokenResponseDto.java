package com.example.tetonam.kakao.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@NoArgsConstructor // JSON을 객체로 변환할 때 기본 생성자가 필요합니다.
@ToString // 객체 내용을 System.out.println()으로 쉽게 확인하기 위해 추가하면 좋습니다.
public class TokenResponseDto {

    // JSON 키 "access_token"을 이 필드에 매핑합니다.
    @JsonProperty("access_token")
    private String accessToken;

    // JSON 키 "token_type"을 이 필드에 매핑합니다.
    @JsonProperty("token_type")
    private String tokenType;

    // JSON 키 "refresh_token"을 이 필드에 매핑합니다.
    @JsonProperty("refresh_token")
    private String refreshToken;

    // JSON 키 "expires_in"을 이 필드에 매핑합니다. (타입을 Integer나 long으로 하는 것이 좋습니다)
    @JsonProperty("expires_in")
    private Integer expiresIn;

    // JSON 키 "refresh_token_expires_in"을 이 필드에 매핑합니다.
    @JsonProperty("refresh_token_expires_in")
    private Integer refreshTokenExpiresIn;

}