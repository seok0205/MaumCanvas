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
    REFRESH_TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "TOKEN4007","Refresh Token이 만료되었습니다."),
    NO_AUTHENTICATION_INFORMATION(HttpStatus.UNAUTHORIZED,"TOKEN4008","인증 정보가 없는 토큰입니다."),

    // user 응답
    USER_ID_IN_USE(HttpStatus.BAD_REQUEST, "USER4000", "사용중인 이메일 입니다."),
    USER_ID_NOT_FOUND(HttpStatus.BAD_REQUEST, "USER4004", "아이디를 잘못 입력했습니다"),
    USER_NICKNAME_IN_USE(HttpStatus.BAD_REQUEST, "USER4001", "사용중인 닉네임 입니다"),
    USER_NOT_FOUND(HttpStatus.BAD_REQUEST, "USER4002", "해당 유저가 없습니다"),
    USER_NOT_AUTHORITY(HttpStatus.UNAUTHORIZED, "USER4002", "권한이 없습니다"),
    USER_INVALID_CREDENTIALS(HttpStatus.BAD_REQUEST, "USER4003", "로그인 정보가 일치하지 않습니다."),
    USER_NOT_MATCH(HttpStatus.UNAUTHORIZED, "USER4004", "접근 권한이 없습니다."),

    // mail 응답
    MAIL_SEND_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "MAIL5000", "이메일 전송에 에러가 발생했습니다."),
    MAIL_NUMBER_IS_NULL(HttpStatus.BAD_REQUEST,"MAIL4000","인증번호를 입력해주세요"),
    MAIL_NUMBER_IS_NOT_MATCH(HttpStatus.BAD_REQUEST,"MAIL4000","인증번호가 틀렸습니다"),

    // school 응답
    SCHOOL_NOT_FOUND(HttpStatus.BAD_REQUEST,"SCHOOL4000","해당 학교가 없습니다."),


    //AWS 응답
    IMAGE_NOT_SAVE(HttpStatus.INTERNAL_SERVER_ERROR,"IMAGE5000","이미지를 저장할 수 없습니다 (S3 에러)"),
    FILE_NOT_VALID(HttpStatus.BAD_REQUEST,"IMAGE4000","잘못된 형식의 파일 입니다"),
    AI_CLIENT_ERROR(HttpStatus.BAD_REQUEST,"AI_SERVER4000","잘못된 요청입니다"),
    AI_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR,"AI_SERVER5000","AI서버 에러 입니다"),

    //상담 예약 응답
    ALREADY_RESERVED(HttpStatus.BAD_REQUEST,"COUNSELING4000","이미 예약된 시간입니다."),
    NOTING_COUNSELING(HttpStatus.BAD_REQUEST,"COUNSELING4001","상담예약이 없습니다."),
    COUNSELING_IS_NOT_AUTHORITY(HttpStatus.UNAUTHORIZED,"COUNSELING4002","권한이 없는 예약입니다."),
    STUDENT_HAVE_NOT_IMAGE(HttpStatus.BAD_REQUEST,"COUNSELING4003","학생이 그림을 그리지 않았습니다. (그림을 먼저 그려주세요)"),

    //사진관련
    DRAWING_NOT_FOUND(HttpStatus.INTERNAL_SERVER_ERROR,"DRAWING5000","해당 이미지를 찾을 수없습니다."),
    DRAWING_NOT_VALID(HttpStatus.UNAUTHORIZED,"DRAWING4000","해당 이미지에 권한이 없습니다."),
    NOT_FOUND_RAG(HttpStatus.INTERNAL_SERVER_ERROR,"DRAWING5001","RAG서버 결과가 저장되지 않았습니다."),
    ALREADY_RAG(HttpStatus.INTERNAL_SERVER_ERROR,"DRAWING5002","이미 RAG서버 결과가 저장되어 있습니다."),

    POST_LIST_EMPTY(HttpStatus.BAD_REQUEST, "BOARD4000", "없는 게시글입니다."),
    COMMENT_LIST_EMPTY(HttpStatus.BAD_REQUEST, "BOARD4001", "댓글을 찾을 수 없습니다.");


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
