package com.example.tetonam.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
public class ResetPasswordDto {
  private String email;
  private String password;
  private String uuid;
}