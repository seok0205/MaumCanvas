// 인증 관련 상수
export const AUTH_CONSTANTS = {
  // Mock 데이터 (개발용)
  MOCK_TOKEN: 'mock-jwt-token',
  MOCK_VERIFICATION_CODE: '123456',

  // API 엔드포인트
  ENDPOINTS: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PASSWORD_RESET_REQUEST: '/auth/password-reset/request',
    PASSWORD_RESET_VERIFY: '/auth/password-reset/verify',
    PASSWORD_RESET_CONFIRM: '/auth/password-reset/confirm',
    VALIDATE_TOKEN: '/auth/me',
  },

  // 로컬 스토리지 키
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'accessToken',
  },

  // 에러 메시지
  ERROR_MESSAGES: {
    LOGIN_FAILED: '이메일 또는 비밀번호가 올바르지 않습니다.',
    REGISTER_FAILED: '회원가입 중 오류가 발생했습니다.',
    PASSWORD_RESET_REQUEST_FAILED:
      '비밀번호 재설정 이메일 발송에 실패했습니다.',
    VERIFICATION_CODE_FAILED: '인증 코드가 올바르지 않습니다.',
    PASSWORD_RESET_FAILED: '비밀번호 재설정에 실패했습니다.',
    NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
    UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
  },
} as const;
