export const FORM_CONSTANTS = {
  BIRTH_DATE: {
    MIN_YEAR: 1900,
    MAX_YEAR: new Date().getFullYear(),
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 15,
    PATTERN: /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/,
  },
  EMAIL: {
    VERIFICATION_ATTEMPTS: 3,
    RESEND_LIMIT: 5,
  },
  VALIDATION: {
    NAME_MIN_LENGTH: 2,
    NICKNAME_MIN_LENGTH: 2,
    NICKNAME_MAX_LENGTH: 10,
    NICKNAME_PATTERN: /^[가-힣a-zA-Z0-9]+$/,
    PHONE_MIN_LENGTH: 10,
    PHONE_MAX_LENGTH: 13,
    // 한국 휴대폰 번호 패턴 (하이픈 포함/미포함 모두 허용)
    PHONE_PATTERN: /^(01[016789])-?(\d{3,4})-?(\d{4})$/,
    // 하이픈 제거 후 순수 숫자만 검증하는 패턴
    PHONE_NUMBER_ONLY_PATTERN: /^01[016789]\d{7,8}$/,
    KOREAN_PATTERN: /^[가-힣]+$/,
  },
} as const;

export const FORM_MESSAGES = {
  VALIDATION: {
    NAME_MIN: '이름은 2자 이상 입력해주세요',
    NAME_KOREAN_ONLY: '이름은 한글로만 입력해주세요',
    EMAIL_INVALID: '올바른 이메일 주소를 입력해주세요',
    PASSWORD_MIN: '비밀번호는 8자 이상이어야 합니다',
    PASSWORD_MAX: '비밀번호는 15자 이하여야 합니다',
    PASSWORD_PATTERN: '영문, 숫자, 특수문자를 포함해야 합니다',
    PASSWORD_MISMATCH: '비밀번호가 일치하지 않습니다',
    PHONE_MIN: '휴대폰 번호는 10자 이상 입력해주세요',
    PHONE_MAX: '휴대폰 번호는 13자 이하여야 합니다',
    PHONE_INVALID: '올바른 휴대폰 번호 형식을 입력해주세요 (예: 010-1234-5678)',
    PHONE_PATTERN: '010, 011, 016, 017, 018, 019로 시작하는 번호를 입력해주세요',
    NICKNAME_MIN: '닉네임은 2자 이상 입력해주세요',
    NICKNAME_MAX: '닉네임은 10자 이하여야 합니다',
    NICKNAME_PATTERN: '닉네임은 한글(완성형), 영문, 숫자만 사용 가능합니다',
    BIRTH_DATE_REQUIRED: '생년월일을 입력해주세요',
    BIRTH_DATE_INVALID: '유효한 생년월일을 입력해주세요',
    GENDER_REQUIRED: '성별을 선택해주세요',
  },
  EMAIL_VERIFICATION: {
    EMAIL_REQUIRED: '이메일 주소를 입력해주세요.',
    CODE_REQUIRED: '이메일과 인증번호를 모두 입력해주세요.',
    INVALID_CODE: '인증번호가 올바르지 않습니다.',
    EXPIRED_CODE: '인증번호가 만료되었습니다.',
    MAX_ATTEMPTS: '인증 시도 횟수를 초과했습니다. 처음부터 다시 시도해주세요.',
    MAX_RESEND:
      '재전송 횟수를 초과했습니다. 페이지를 새로고침 후 다시 시도해주세요.',
    SEND_SUCCESS: '이메일로 인증번호가 발송되었습니다.',
    VERIFICATION_SUCCESS: '이메일 인증이 완료되었습니다.',
    PROCESS_ERROR: '이메일 인증 과정에서 오류가 발생했습니다.',
    VERIFICATION_FAILED: '이메일 인증에 실패했습니다.',
    BLOCKED: '인증이 차단되었습니다. 페이지를 새로고침 후 다시 시도해주세요.',
  },
  PRIVACY: {
    DEFAULT: '개인정보 보호: 입력하신 정보는 안전하게 암호화되어 저장됩니다.',
    LOGIN:
      '모든 입력값은 안전하게 처리되며, 개인정보 보호 정책에 따라 관리됩니다.',
  },
  PASSWORD: {
    SHOW: '비밀번호 보기',
    HIDE: '비밀번호 숨기기',
  },
} as const;
