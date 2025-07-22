package com.example.tetonam.user.dto;


import com.example.tetonam.user.domain.User;
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

  private String email;
  private String password;
  private String nickname;
  private String name;
  private List<Role> roles = new ArrayList<>();

  public User toEntity(String encodedPassword, List<Role> roles) {

    return User.builder()
            .email(email)
        .password(encodedPassword)
        .nickname(nickname)
        .roles(roles)
        .build();
  }
}