package com.example.tetonam.user.dto;

import com.example.tetonam.user.domain.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MainMyInfoResponseDto {
    private String name;
    private String nickname;
    public static MainMyInfoResponseDto toDto(User user){
        return MainMyInfoResponseDto.builder()
                .name(user.getName())
                .nickname(user.getNickname())
                .build();
    }
}
