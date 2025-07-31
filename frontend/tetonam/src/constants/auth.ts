// 인증 관련 상수 - 백엔드 API 문서 기반
export const AUTH_CONSTANTS = {
  // Mock 데이터 (개발용)
  MOCK_TOKEN: 'mock-jwt-token',
  MOCK_VERIFICATION_CODE: '123456',

  // API 엔드포인트 - 실제 백엔드 엔드포인트
  ENDPOINTS: {
    LOGIN: '/user/sign-in',
    REGISTER: '/user/sign-up',
    PASSWORD_RESET: '/user/password',
    TOKEN_REISSUE: '/user/token/reissue',
    EMAIL_DUPLICATE_CHECK: '/user/email-duplicate-check',
    NICKNAME_DUPLICATE_CHECK: '/user/nickname-duplicate-check',
    EMAIL_SEND: '/mail/send',
    EMAIL_AUTH_CHECK: '/mail/auth-check',
    MY_INFO: '/user/my-info',
    MY_NICKNAME: '/user/my-nickname',
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
