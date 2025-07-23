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

    /**
     * 내 닉네임 보기
     *
     * @param token
     * @return
     */
    @GetMapping("/my-nickname")
    public ResponseEntity<?> findNickname(@RequestHeader("Authorization") String token) {
        String email = jwtTokenProvider.getUserName(token.substring(7));
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
    public ResponseEntity<?> reissue(@RequestBody ReissueDto reissueDto) {
        // 토큰 재발급 처리
        JwtToken jwtToken = userService.reissue(reissueDto);
        return ResponseEntity.ok().body(ApiResponse.onSuccess(jwtToken));
    }
//    @PatchMapping("/password")
//    public ResponseEntity<?> resetPassword(@RequestBody SignInDto signInDto) {
//        // 토큰 재발급 처리
//        JwtToken jwtToken = userService.reissue(reissueDto);
//        return ResponseEntity.ok().body(ApiResponse.onSuccess(jwtToken));
//    }

}
