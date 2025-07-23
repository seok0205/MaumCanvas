package com.example.tetonam.user.controller;



import com.example.tetonam.user.domain.JwtToken;
import com.example.tetonam.user.dto.UserDto;
import com.example.tetonam.user.dto.ReissueDto;
import com.example.tetonam.user.dto.SignInDto;
import com.example.tetonam.user.dto.SignUpDto;
import com.example.tetonam.user.service.UserService;
import com.example.tetonam.user.token.JwtTokenProvider;
import com.example.tetonam.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {

  private final UserService userService;

  private final JwtTokenProvider jwtTokenProvider;

  @GetMapping("/my-nickname")
  public ResponseEntity<?> findNickname(@RequestHeader("Authorization") String token) {
    String email=jwtTokenProvider.getUserName(token.substring(7));
    String nickname= userService.findByNickname(email);
    return ResponseEntity.ok().body(ApiResponse.onSuccess(nickname));
  }

  @PostMapping("/email-duplicate-check")
  public ResponseEntity<?> checkEmailDuplicate(@RequestParam("email") String email) {
    String result=userService.checkEmailDuplicate(email);
    return ResponseEntity.ok().body(ApiResponse.onSuccess(result));
  }

  @PostMapping("/nickname-duplicate-check")
  public ResponseEntity<?> checknicknameDuplicate(@RequestParam("nickname") String nickname) {
    String result=userService.checknicknameDuplicate(nickname);
    return ResponseEntity.ok().body(ApiResponse.onSuccess(result));
  }

  @PostMapping("/sign-in")
  public ResponseEntity<?> signIn(@RequestBody SignInDto signInDto) {
    String email = signInDto.getEmail();
    String password = signInDto.getPassword();

    // 로그인 처리
    JwtToken jwtToken = userService.signIn(email, password);

    return ResponseEntity.ok().body(ApiResponse.onSuccess(jwtToken));
  }

  @PostMapping("/sign-up")
  public ResponseEntity<?> signUp(@RequestBody SignUpDto signUpDto) {
    log.info("[signUp] 회원가입 요청: username = {}, nickname = {}", signUpDto.getEmail(), signUpDto.getNickname());

    // 회원가입 처리
    UserDto savedMemberDto = userService.signUp(signUpDto);

    // 회원가입 성공 로그
    log.info("[signUp] 회원가입 성공: username = {}", signUpDto.getEmail());

    return ResponseEntity.ok().body(ApiResponse.onSuccess(savedMemberDto));
  }

  @PostMapping("/token/reissue")
  public ResponseEntity<?> reissue(@RequestBody ReissueDto reissueDto) {
    log.info("[reissue] 토큰 재발급 요청: accessToken = {}", reissueDto.getAccessToken());

    // 토큰 재발급 처리
    JwtToken jwtToken = userService.reissue(reissueDto);

    // 토큰 재발급 성공 로그
    log.info("[reissue] 토큰 재발급 성공: accessToken = {}, refreshToken = {}", jwtToken.getAccessToken(), jwtToken.getRefreshToken());

    return ResponseEntity.ok().body(ApiResponse.onSuccess(jwtToken));
  }
}
