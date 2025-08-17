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
public class MyInfoResponseDto {
    private String name;
    private String birthday;
    private String phone;
    private String school;
    private String email;
    private String gender;
    private String nickname;

    public static MyInfoResponseDto toDto(User user){
        return MyInfoResponseDto.builder()
                .name(user.getName())
                .birthday(user.getBirthday())
                .phone(user.getPhone())
                .school(user.getSchool().getName())
                .email(user.getEmail())
                .gender(user.getGender().toString())
                .nickname(user.getNickname())
                .build();

    }
}
