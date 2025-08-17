// const BASE_URL = 'https://i13e108.p.ssafy.io';

// 인증 관련 상수 - 백엔드 API 문서 기반
export const AUTH_CONSTANTS = {
  // API 엔드포인트 - 실제 백엔드 엔드포인트
  ENDPOINTS: {
    LOGIN: '/api/user/sign-in',
    // LOGIN: `${BASE_URL}/api/user/sign-in`,
    REGISTER: '/api/user/sign-up',
    // REGISTER: `${BASE_URL}/api/user/sign-up`,
    PASSWORD_RESET: '/api/user/password',
    // PASSWORD_RESET: `${BASE_URL}/api/user/password`,
    TOKEN_REISSUE: '/api/user/token/reissue',
    // TOKEN_REISSUE: `${BASE_URL}/api/user/token/reissue`,
    EMAIL_DUPLICATE_CHECK: '/api/user/email-duplicate-check',
    // EMAIL_DUPLICATE_CHECK: `${BASE_URL}/api/user/email-duplicate-check`,
    NICKNAME_DUPLICATE_CHECK: '/api/user/nickname-duplicate-check',
    // NICKNAME_DUPLICATE_CHECK: `${BASE_URL}/api/user/nickname-duplicate-check`,
    EMAIL_SEND: '/api/mail/send',
    // EMAIL_SEND: `${BASE_URL}/api/mail/send`,
    EMAIL_SEND_PASSWORD: '/api/mail/send-password',
    // EMAIL_SEND_PASSWORD: `${BASE_URL}/api/mail/send-password`,
    EMAIL_AUTH_CHECK: '/api/mail/auth-check',
    // EMAIL_AUTH_CHECK: `${BASE_URL}/api/mail/auth-check`,
    MY_INFO: '/api/user/my-info',
    // MY_INFO: `${BASE_URL}/api/user/my-info`,
    MY_NICKNAME: '/api/user/my-nickname',
    // MY_NICKNAME: `${BASE_URL}/api/user/my-nickname`,
    MY_PASSWORD_UPDATE: '/api/user/mypage-password',
    // MY_PASSWORD_UPDATE: `${BASE_URL}/api/user/mypage-password`,
    MY_NICKNAME_UPDATE: '/api/user/mypage-nickname',
    // MY_NICKNAME_UPDATE: `${BASE_URL}/api/user/mypage-nickname`,
  },

  // 로컬 스토리지 키
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
  },

  // 에러 메시지
  ERROR_MESSAGES: {
    LOGIN_FAILED: '이메일 또는 비밀번호가 올바르지 않습니다.',
    REGISTER_FAILED: '회원가입 중 오류가 발생했습니다.',
    PASSWORD_RESET_FAILED: '비밀번호 재설정에 실패했습니다.',
    EMAIL_SEND_FAILED: '이메일 발송에 실패했습니다.',
    EMAIL_VERIFICATION_FAILED: '이메일 인증에 실패했습니다.',
    EMAIL_CHECK_FAILED: '이메일 중복 확인에 실패했습니다.',
    NICKNAME_CHECK_FAILED: '닉네임 중복 확인에 실패했습니다.',
    NICKNAME_GET_FAILED: '닉네임 조회에 실패했습니다.',
    USER_INFO_FAILED: '사용자 정보 조회에 실패했습니다.',
    NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
    UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
  },
} as const;
