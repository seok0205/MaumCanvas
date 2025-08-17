package com.example.tetonam.agora.token.dto;

import lombok.*;

@Getter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class tokenDto {
    private String token;
    private String counselingId;
    private int userId;

    static public tokenDto toDto(String token, String counselingId, int userId){
        return tokenDto.builder()
                .token(token)
                .counselingId(counselingId)
                .userId(userId)
                .build();
    }
}
