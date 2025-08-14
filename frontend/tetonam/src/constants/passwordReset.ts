export const PASSWORD_RESET_CONSTANTS = {
  ROUTES: {
    LOGIN: '/login',
  },
  VERIFICATION_CODE_LENGTH: 6,
  PASSWORD_MIN_LENGTH: 8,
  STEPS: {
    EMAIL_INPUT: 1,
    VERIFICATION_CODE: 2,
    NEW_PASSWORD: 3,
  },
} as const;

export const STEP_TITLES = {
  1: '비밀번호 재설정',
  2: '인증 코드 입력',
  3: '새 비밀번호 설정',
} as const;

export const STEP_DESCRIPTIONS = {
  1: '가입하신 이메일 주소로 비밀번호 재설정 인증 코드를 전송합니다.',
  2: '이메일로 전송된 6자리 인증 코드를 입력해주세요.',
  3: '새로 사용할 비밀번호를 설정해주세요.',
} as const;

// 에러 메시지 상수
export const PASSWORD_RESET_ERROR_MESSAGES = {
  EMAIL_SEND_FAILED: '이메일 발송에 실패했습니다.',
  USER_NOT_FOUND: '해당 유저가 없습니다',
  INVALID_VERIFICATION_CODE: '유효하지 않은 인증 코드입니다.',
  VERIFICATION_FAILED: '인증에 실패했습니다.',
  PASSWORD_RESET_FAILED: '비밀번호 재설정에 실패했습니다.',
  MAX_ATTEMPTS: '인증 시도 횟수를 초과했습니다. 처음부터 다시 시도해주세요.',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
} as const;

// 진행 상태 스타일 상수
export const STEP_PROGRESS_STYLES = {
  CURRENT: {
    width: 'w-8',
    bgColor: 'bg-primary',
  },
  COMPLETED: {
    width: 'w-6',
    bgColor: 'bg-primary/60',
  },
  PENDING: {
    width: 'w-2',
    bgColor: 'bg-border',
  },
} as const;
