package com.example.tetonam.user.controller;


import com.example.tetonam.user.domain.JwtToken;
import com.example.tetonam.user.domain.School;
import com.example.tetonam.user.dto.*;
import com.example.tetonam.user.service.UserService;
import com.example.tetonam.user.token.JwtTokenProvider;
import com.example.tetonam.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping("/school-list")
    @Operation(summary = "학교목록 API", description = "학교 목록을 반환합니다.")
    public ResponseEntity<?> schoolList() {
        List<School> schoolList=userService.schoolList();
        return ResponseEntity.ok().body(ApiResponse.onSuccess(schoolList));
    }



    @GetMapping("/my-info")
    @Operation(summary = "마이페이지 API", description = "마이페이지 정보를 반환합니다.")
    public ResponseEntity<?> myInfo(@RequestHeader("Authorization") String token) {
        String email = jwtTokenProvider.getEmail(token.substring(7));
          MyInfoResponseDto myInfo= userService.myInfo(email);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(myInfo));
    }

    /**
     * 내 닉네임 보기
     *
     * @param token
     * @return
     */
    @GetMapping("/my-nickname")
    @Operation(summary = "내 닉네임 확인 API", description = "내 닉네임을 확인합니다.")
    public ResponseEntity<?> findNickname(@RequestHeader("Authorization") String token) {
        String email = jwtTokenProvider.getEmail(token.substring(7));
        String nickname = userService.findByNickname(email);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(nickname));
    }

    /**
     * 이메일 중복체크
     *
     * @param email
     * @return
     */
    @PostMapping("/email-duplicate-check")
    @Operation(summary = "이메일 중복확인 API", description = "이메일을 중복을 확인합니다.")

    public ResponseEntity<?> checkEmailDuplicate(@RequestParam("email") String email) {
        String result = userService.checkEmailDuplicate(email);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(result));
    }

    /**
     * 닉네임 중복체크
     *
     * @param nickname
     * @return
     */
    @PostMapping("/nickname-duplicate-check")
    @Operation(summary = "닉네임 중복확인 API", description = "닉네임 중복을 확인합니다.")
    public ResponseEntity<?> checknicknameDuplicate(@RequestParam("nickname") String nickname) {
        String result = userService.checknicknameDuplicate(nickname);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(result));
    }

    /**
     * 로그인
     *
     * @param signInDto
     * @return
     */
    @PostMapping("/sign-in")
    @Operation(summary = "로그인 API", description = "로그인을 합니다.")
    public ResponseEntity<?> signIn(@RequestBody SignInDto signInDto) {
        String email = signInDto.getEmail();
        String password = signInDto.getPassword();
        JwtToken jwtToken = userService.signIn(email, password);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(jwtToken));
    }

    /**
     * 회원가입
     *
     * @param signUpDto
     * @return
     */
    @PostMapping("/sign-up")
    @Operation(summary = "회원가입 API", description = "회원가입을 합니다.")
    public ResponseEntity<?> signUp(@RequestBody SignUpDto signUpDto) {
        // 회원가입 처리
        UserDto savedMemberDto = userService.signUp(signUpDto);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(savedMemberDto));
    }

    /**
     * 토큰 재발급
     *
     * @param reissueDto
     * @return
     */
    @PostMapping("/token/reissue")
    @Operation(summary = "토큰 재발급 API", description = "액세스토큰,리프레쉬토큰을 재발급합니다.(RTR)")
    public ResponseEntity<?> reissue(@RequestBody ReissueDto reissueDto) {
        // 토큰 재발급 처리
        JwtToken jwtToken = userService.reissue(reissueDto);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(jwtToken));
    }

    /**
     * mypage에서 비밀번호 재설정
     * @param token
     * @param password
     * @return
     */
    @PatchMapping("/mypage-password")
    @Operation(summary = "비밀번호 재설정 API", description = "비밀번호를 재설정합니다.")
    public ResponseEntity<?> mypageResetPassword(@RequestHeader("Authorization") String token,@RequestParam("password") String password) {
        String email = jwtTokenProvider.getEmail(token.substring(7));
        String result=userService.mypageResetPassword(email,password);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(result));
    }



    /**
     * 비밀번호 찾기
     * @param resetPasswordDto
     * @return
     */
    @PatchMapping("/password")
    @Operation(summary = "비밀번호 찾기 API", description = "비밀번호를 찾습니다.")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordDto resetPasswordDto) {
        String result=userService.resetPassword(resetPasswordDto);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(result));
    }

    @PatchMapping("/mypage-nickname")
    @Operation(summary = "닉네임 재설정 API", description = "닉네임을 재설정합니다.")
    public ResponseEntity<?> resetNickname(@RequestHeader("Authorization") String token,@RequestParam("nickname") String nickname) {
        String email = jwtTokenProvider.getEmail(token.substring(7));
        String result=userService.mypageResetNickname(email,nickname);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(result));
    }


}
