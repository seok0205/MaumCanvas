package com.example.tetonam.user.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReissueDto {
  private String accessToken;

  private String refreshToken;
}
