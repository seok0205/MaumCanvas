package com.example.tetonam.user.dto;


import com.example.tetonam.user.domain.School;
import com.example.tetonam.user.domain.User;
import com.example.tetonam.user.domain.enums.Gender;
import com.example.tetonam.user.domain.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignUpDto {

    private String email; // 이메일
    private String password; // 비밀번호
    private String nickname; //닉네임
    private String name; // 이름
    private Gender gender; // 성별
    private String phone; // 휴대폰
    private School school; // 학교
    private String birthday; // 생일
    private List<Role> roles;

    public User toEntity(SignUpDto signUpDto,String encodedPassword,School school) {

        return User.builder()
                .email(signUpDto.getEmail())
                .password(encodedPassword)
                .nickname(signUpDto.getNickname())
                .name(signUpDto.getName())
                .birthday(signUpDto.getBirthday())
                .gender(signUpDto.getGender())
                .school(school)
                .phone(signUpDto.getPhone())
                .roles(signUpDto.getRoles())
                .build();
    }
}