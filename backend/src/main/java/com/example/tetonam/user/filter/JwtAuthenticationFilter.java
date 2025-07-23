package com.example.tetonam.user.filter;


import com.example.tetonam.exception.handler.TokenHandler;
import com.example.tetonam.user.token.JwtTokenProvider;
import com.example.tetonam.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.GenericFilterBean;

import java.io.IOException;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends GenericFilterBean {

  private final JwtTokenProvider jwtTokenProvider;
  private final ObjectMapper objectMapper;


  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {
    HttpServletRequest httpServletRequest = (HttpServletRequest) request;
    HttpServletResponse httpServletResponse = (HttpServletResponse) response;
    // 1. Request Header에서 JWT 토큰 추출
    try {
      String token = resolveToken(httpServletRequest);
      // 2. validateToken으로 토큰 유효성 검사
      if (token != null && jwtTokenProvider.validateToken(token)) {
        // 토큰이 유효할 경우 토큰에서 Authentication 객체를 가지고 와서 SecurityContext에 저장
        Authentication authentication = jwtTokenProvider.getAuthentication(token);
        SecurityContextHolder.getContext().setAuthentication(authentication);
      }
    } catch (TokenHandler e) {
      logger.error(e.getMessage());
      // 만료된 토큰에 대한 응답 설정
      httpServletResponse.setStatus(e.getErrorReasonHttpStatus().getHttpStatus().value());
      httpServletResponse.setContentType("application/json;charset=UTF-8");
      ApiResponse<Object> apiResponse = ApiResponse.onFailure(e.getErrorReason().getCode(),
          e.getErrorReason().getMessage());
      String json = objectMapper.writeValueAsString(apiResponse);
      httpServletResponse.getWriter().write(json);
      return; // 필터 체인의 나머지 부분을 실행하지 않고 반환
    } catch (Exception e) {
      logger.error("Security context에 설정되지 않음", e);
    }
    chain.doFilter(request, response);
  }

  // Request Header에서 토큰 정보 추출
  private String resolveToken(HttpServletRequest request) {
    String bearerToken = request.getHeader("Authorization");
    if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer")) {
      return bearerToken.substring(7);
    }
    return null;
  }
}