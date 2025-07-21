package com.example.tetonam.response.code.status;


import com.example.tetonam.response.code.BaseErrorCode;
import com.example.tetonam.response.code.ErrorReasonDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorStatus implements BaseErrorCode {

    // 일반적인 응답
    _INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "COMMON500", "서버 에러, 관리자에게 문의 바랍니다."),
    _BAD_REQUEST(HttpStatus.BAD_REQUEST,"COMMON400","잘못된 요청입니다."),
    _UNAUTHORIZED(HttpStatus.UNAUTHORIZED,"COMMON401","인증이 필요합니다."),
    _FORBIDDEN(HttpStatus.FORBIDDEN, "COMMON403", "금지된 요청입니다."),


    // Token 응답
    ACCESS_TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "TOKEN4001", "액세스 토큰이 만료되었습니다"),
    ACCESS_TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "TOKEN4002", "잘못된 토큰 입니다."),
    UNSUPPORTED_JWT_TOKEN(HttpStatus.UNAUTHORIZED, "TOKEN4003", "지원되지 않는 JWT 토큰입니다."),
    INVALID_JWT_TOKEN(HttpStatus.UNAUTHORIZED, "TOKEN4004", "JWT 토큰이 잘못되었습니다."),
    REFRESH_TOKEN_NOT_VALID(HttpStatus.UNAUTHORIZED, "TOKEN4005","Refresh Token 정보가 유효하지 않습니다."),
    REFRESH_TOKEN_NOT_MATCH(HttpStatus.UNAUTHORIZED, "TOKEN4005-1","Refresh Token 정보가 일치하지 않습니다."),
    TOKEN_IS_NOT_AUTHORITY(HttpStatus.UNAUTHORIZED,"TOKEN4006","권한 정보가 없는 토큰입니다."),
    NO_AUTHENTICATION_INFORMATION(HttpStatus.UNAUTHORIZED,"TOKEN4006","인증 정보가 없는 토큰입니다."),

    // user 응답
    USER_ID_IN_USE(HttpStatus.NOT_FOUND, "USER4000", "사용중인 유저아이디 입니다."),
    USER_ID_NOT_FOUND(HttpStatus.NOT_FOUND, "USER4004", "아이디를 잘못 입력했습니다"),
    USER_NICKNAME_IN_USE(HttpStatus.NOT_FOUND, "USER4001", "사용중인 닉네임 입니다"),
    MASTER_NOT_FOUND(HttpStatus.NOT_FOUND, "USER4002", "해당 유저가 없습니다"),
    MASTER_NOT_AUTHORITY(HttpStatus.NOT_FOUND, "USER4002", "권한이 없습니다"),
    USER_INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "USER4003", "로그인 정보가 일치하지 않습니다."),
    ;



    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

    @Override
    public ErrorReasonDTO getReason() {
        return ErrorReasonDTO.builder()
                .message(message)
                .code(code)
                .isSuccess(false)
                .build();
    }

    @Override
    public ErrorReasonDTO getReasonHttpStatus() {
        return ErrorReasonDTO.builder()
                .message(message)
                .code(code)
                .isSuccess(false)
                .httpStatus(httpStatus)
                .build();
    }

}
