// 백엔드 에러 코드 상수 정의
export const ERROR_CODES = {
  // 일반적인 응답
  COMMON500: 'COMMON500',
  COMMON400: 'COMMON400',
  COMMON401: 'COMMON401',
  COMMON403: 'COMMON403',

  // 토큰 관련
  TOKEN4001: 'TOKEN4001', // 액세스 토큰이 만료되었습니다
  TOKEN4002: 'TOKEN4002', // 잘못된 토큰 입니다
  TOKEN4003: 'TOKEN4003', // 지원되지 않는 JWT 토큰입니다
  TOKEN4004: 'TOKEN4004', // JWT 토큰이 잘못되었습니다
  TOKEN4005: 'TOKEN4005', // Refresh Token 정보가 유효하지 않습니다
  TOKEN4006: 'TOKEN4006', // 권한 정보가 없는 토큰입니다
  TOKEN4007: 'TOKEN4007', // Refresh Token이 만료되었습니다
  TOKEN4008: 'TOKEN4008', // 인증 정보가 없는 토큰입니다

  // 사용자 관련
  USER4000: 'USER4000', // 사용중인 이메일 입니다
  USER4001: 'USER4001', // 사용중인 닉네임 입니다
  USER4002: 'USER4002', // 해당 유저가 없습니다
  USER4003: 'USER4003', // 로그인 정보가 일치하지 않습니다
  USER4004: 'USER4004', // 아이디를 잘못 입력했습니다

  // 상담 관련
  COUNSELING4000: 'COUNSELING4000', // 이미 예약된 시간입니다
  COUNSELING4001: 'COUNSELING4001', // 상담예약이 없습니다

  // 이메일 관련
  MAIL4000: 'MAIL4000', // 인증번호 관련 오류
  MAIL5000: 'MAIL5000', // 이메일 전송에 에러가 발생했습니다

  // 학교 관련
  SCHOOL4000: 'SCHOOL4000', // 해당 학교가 없습니다

  // 이미지 관련
  IMAGE4000: 'IMAGE4000', // 잘못된 형식의 파일 입니다
  IMAGE5000: 'IMAGE5000', // 이미지를 저장할 수 없습니다 (S3 에러)

  // AI 서버 관련
  AI_SERVER4000: 'AI_SERVER4000', // 잘못된 요청입니다
  AI_SERVER5000: 'AI_SERVER5000', // AI서버 에러 입니다

  // 게시판 관련
  BOARD4000: 'BOARD4000', // 없는 게시글입니다
} as const;

// 보안 수준별 에러 분류
export const ERROR_SECURITY_LEVELS = {
  // 보안 민감 - 사용자에게 노출하지 않음 (내부 로깅용)
  SECURITY_SENSITIVE: [
    ERROR_CODES.TOKEN4002, // 잘못된 토큰
    ERROR_CODES.TOKEN4003, // 지원되지 않는 JWT 토큰
    ERROR_CODES.TOKEN4004, // JWT 토큰이 잘못됨
    ERROR_CODES.TOKEN4005, // Refresh Token 정보가 유효하지 않음
    ERROR_CODES.TOKEN4006, // 권한 정보가 없는 토큰
    ERROR_CODES.USER4002, // 해당 유저가 없음
    ERROR_CODES.COMMON500, // 서버 에러
    ERROR_CODES.MAIL5000, // 이메일 전송 에러
    ERROR_CODES.IMAGE5000, // 이미지 저장 에러
    ERROR_CODES.AI_SERVER5000, // AI서버 에러
  ],

  // 비즈니스 로직 - 사용자에게 구체적 안내
  BUSINESS_LOGIC: [
    ERROR_CODES.COUNSELING4000, // 이미 예약된 시간
    ERROR_CODES.USER4000, // 사용중인 이메일
    ERROR_CODES.USER4001, // 사용중인 닉네임
    ERROR_CODES.MAIL4000, // 인증번호 오류
    ERROR_CODES.IMAGE4000, // 잘못된 파일 형식
  ],

  // 인증 관련 - 재로그인 안내
  AUTHENTICATION: [
    ERROR_CODES.TOKEN4001, // 액세스 토큰 만료
    ERROR_CODES.TOKEN4007, // Refresh Token 만료
    ERROR_CODES.TOKEN4008, // 인증 정보 없음
    ERROR_CODES.COMMON401, // 인증 필요
    ERROR_CODES.USER4003, // 로그인 정보 불일치
    ERROR_CODES.USER4004, // 아이디 잘못 입력
  ],

  // 권한 관련 - 접근 제한 안내
  AUTHORIZATION: [
    ERROR_CODES.COMMON403, // 금지된 요청
  ],

  // 입력 검증 - 입력 정보 확인 안내
  VALIDATION: [
    ERROR_CODES.COMMON400, // 잘못된 요청
    ERROR_CODES.AI_SERVER4000, // AI 서버 요청 오류
  ],
} as const;

// 사용자에게 노출할 통일된 에러 메시지
export const USER_FRIENDLY_MESSAGES = {
  // 보안 민감한 에러 - 일반적인 서버 에러 메시지로 통일
  SECURITY_SENSITIVE:
    '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',

  // 비즈니스 로직 에러 - 구체적 안내
  BUSINESS_LOGIC: {
    [ERROR_CODES.COUNSELING4000]:
      '이미 예약된 시간입니다. 다른 시간을 선택해주세요.',
    [ERROR_CODES.USER4000]: '이미 사용 중인 이메일입니다.',
    [ERROR_CODES.USER4001]: '이미 사용 중인 닉네임입니다.',
    [ERROR_CODES.MAIL4000]: '인증번호를 확인해주세요.',
    [ERROR_CODES.IMAGE4000]: '지원하지 않는 파일 형식입니다.',
  },

  // 인증 관련 에러 - 재로그인 안내
  AUTHENTICATION: '로그인이 필요합니다. 다시 로그인해주세요.',

  // 권한 관련 에러 - 접근 제한 안내
  AUTHORIZATION: '접근 권한이 없습니다.',

  // 입력 검증 에러 - 입력 정보 확인 안내
  VALIDATION: '입력 정보를 확인해주세요.',

  // 기본 에러 메시지
  DEFAULT: '요청을 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.',
} as const;

// 에러 타입 정의
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
