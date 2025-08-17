package com.example.tetonam.user.service;


import com.example.tetonam.exception.handler.UserHandler;
import com.example.tetonam.exception.handler.TokenHandler;
import com.example.tetonam.user.dto.JwtToken;
import com.example.tetonam.user.domain.School;
import com.example.tetonam.user.domain.User;
import com.example.tetonam.user.dto.*;
import com.example.tetonam.user.repository.SchoolRepository;
import com.example.tetonam.user.repository.UserRepository;
import com.example.tetonam.user.token.JwtTokenProvider;
import com.example.tetonam.response.code.status.ErrorStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class UserService {
    private final UserRepository userRepository;
    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final RedisTemplate<String, String> redisTemplate;
    private final SchoolRepository schoolRepository;


    @Transactional
    public JwtToken signIn(String username, String password) {

        // 1. username + password 를 기반으로 Authentication 객체 생성
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(username, password);
        try {
            // 2. 실제 검증. authenticate() 메서드를 통해 요청된 Master 에 대한 검증 진행
            Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);

            // 3. 인증 정보를 기반으로 JWT 토큰 생성
//            JwtToken jwtToken = jwtTokenProvider.generateToken(authentication);
            JwtToken jwtToken = jwtTokenProvider.generateToken(authentication);

            // Refresh Token을 Redis에 저장
            redisTemplate.opsForValue()
                    .set("RT:" + authentication.getName(), jwtToken.getRefreshToken(), jwtToken.getRefreshTokenExpirationTime(), TimeUnit.MILLISECONDS);

            log.info("[signIn] 로그인 성공: username = {}", username);
            return jwtToken;
        } catch (BadCredentialsException e) {
            log.error("[signIn] 로그인 실패: 잘못된 아이디 및 비밀번호, username = {}", username);
            throw new UserHandler(ErrorStatus.USER_INVALID_CREDENTIALS);  // 'INVALID_CREDENTIALS' 에러 코드로 구체적인 비밀번호 오류 처리
        } catch (Exception e) {
            log.error("[signIn] 로그인 실패: username = {}, 오류 = {}", username, e.getMessage());
            throw new UserHandler(ErrorStatus._INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public UserDto signUp(SignUpDto signUpDto) {
        log.info("[signUp] 회원가입 요청: username = {}", signUpDto.getEmail());

        // Password 암호화
        String encodedPassword = passwordEncoder.encode(signUpDto.getPassword());
//    List<Role> roles = new ArrayList<>();
//    roles.add(Role.USER);  // USER 권한 부여

        School s = schoolRepository.findById(signUpDto.getSchool().getName())
                .orElseThrow(() -> new UserHandler(ErrorStatus.SCHOOL_NOT_FOUND));

        System.out.println(s.getName() + "DB");
        // 회원가입 성공 처리
        UserDto userDto = UserDto.toDto(userRepository.save(signUpDto.toEntity(signUpDto, encodedPassword, s)));
        log.info("[signUp] 회원가입 성공: username = {}", signUpDto.getEmail());

        return userDto;
    }

    @Transactional
    public JwtToken reissue(ReissueDto reissueDto) {
        log.info("[reissue] 토큰 갱신 요청: accessToken = {}", reissueDto.getAccessToken());


        // RefreshToken 검증
        if (!jwtTokenProvider.validateToken(reissueDto.getRefreshToken())) {
            log.warn("[reissue] RefreshToken 유효하지 않음: refreshToken = {}", reissueDto.getRefreshToken());
            throw new TokenHandler(ErrorStatus.REFRESH_TOKEN_NOT_VALID);
        }

        Authentication authentication = jwtTokenProvider.getAuthentication(reissueDto.getAccessToken());
        String refreshToken = (String) redisTemplate.opsForValue().get("RT:" + authentication.getName());

        if (refreshToken == null) {
            throw new TokenHandler(ErrorStatus.REFRESH_TOKEN_EXPIRED);
        }

        if (!refreshToken.equals(reissueDto.getRefreshToken())) {
            log.warn("[reissue] RefreshToken 불일치: username = {}", authentication.getName());
            throw new TokenHandler(ErrorStatus.REFRESH_TOKEN_NOT_MATCH);
        }

        // 새 JWT 토큰 생성
        JwtToken jwtToken = jwtTokenProvider.generateToken(authentication);

        // RefreshToken Redis 업데이트
        redisTemplate.opsForValue()
                .set("RT:" + authentication.getName(), jwtToken.getRefreshToken(), jwtToken.getRefreshTokenExpirationTime(), TimeUnit.MILLISECONDS);

        log.info("[reissue] 토큰 갱신 성공: username = {}", authentication.getName());
        return jwtToken;
    }

    public String findByNickname(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
        return user.getNickname();
    }

    public String checkEmailDuplicate(String email) {
        // 이메일 중복체크
        if (userRepository.existsByEmail(email)) {
            throw new UserHandler(ErrorStatus.USER_ID_IN_USE);
        }
        return "사용가능한 이메일입니다";

    }

    public String checknicknameDuplicate(String nickname) {
        // 닉네임 중복체크
        if (userRepository.existsByNickname(nickname)) {
            throw new UserHandler(ErrorStatus.USER_NICKNAME_IN_USE);
        }
        return "사용가능한 닉네임입니다";
    }

    @Transactional
    public String resetPassword(ResetPasswordDto resetPasswordDto) {
        User user = userRepository.findByEmail(resetPasswordDto.getEmail())
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
        String uuid = (String) redisTemplate.opsForValue().get("UUID:" + resetPasswordDto.getEmail());
        if (uuid == null || !uuid.equals(resetPasswordDto.getUuid())) {
            throw new UserHandler(ErrorStatus.USER_NOT_AUTHORITY);
        }
        String encodedPassword = passwordEncoder.encode(resetPasswordDto.getPassword());
        user.setPassword(encodedPassword);

        redisTemplate.delete("UUID:" + resetPasswordDto.getUuid());
        return "비밀번호가 변경되었습니다.";
    }

    @Transactional
    public String mypageResetPassword(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
        String encodedPassword = passwordEncoder.encode(password);
        user.setPassword(encodedPassword);
        return "비밀번호가 변경되었습니다";
    }

    /**
     * 닉네임 변경
     *
     * @param email
     * @param nickname
     * @return
     */

    @Transactional
    public String mypageResetNickname(String email, String nickname) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
        if (userRepository.existsByNickname(nickname)) {
            throw new UserHandler(ErrorStatus.USER_NICKNAME_IN_USE);
        }
        user.setNickname(nickname);

        return "닉네임이 변경되었습니다";
    }

    public MyInfoResponseDto myInfo(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
        return MyInfoResponseDto.toDto(user);
    }

    public List<School> schoolList() {
        return schoolRepository.findAll();
    }

    public List<School> schoolSearch(String name) {
        return schoolRepository.findByNameContaining(name);
    }

    public MainMyInfoResponseDto mainPageMyInfo(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserHandler(ErrorStatus.USER_NOT_FOUND));
        return MainMyInfoResponseDto.toDto(user);
    }
}
