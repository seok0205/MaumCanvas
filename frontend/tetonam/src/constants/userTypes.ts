// 사용자 타입 라벨 상수
export const USER_TYPE_LABELS = {
  student: '학생',
  counselor: '상담사',
  admin: '관리자',
} as const;

export type UserType = keyof typeof USER_TYPE_LABELS;

// 타입 가드 함수
export const isValidUserType = (type: string): type is UserType => {
  return type in USER_TYPE_LABELS;
};

// 사용자 타입 라벨 가져오기 함수 (타입 안전성 강화)
export const getUserTypeLabel = (type: string): string => {
  if (!type || typeof type !== 'string') {
    if (import.meta.env.DEV) {
      console.warn('getUserTypeLabel: 유효하지 않은 타입 입력:', type);
    }
    return '알 수 없음';
  }

  if (isValidUserType(type)) {
    return USER_TYPE_LABELS[type];
  }

  // 개발 환경에서 경고 로그
  if (import.meta.env.DEV) {
    console.warn(`getUserTypeLabel: 알 수 없는 사용자 타입 "${type}"`);
  }

  return type; // 알 수 없는 타입인 경우 원본 값 반환
};

// 사용자 타입 목록 가져오기 함수
export const getUserTypes = (): UserType[] => {
  return Object.keys(USER_TYPE_LABELS) as UserType[];
};

// 사용자 타입 검증 함수 (더 엄격한 검증)
export const validateUserType = (type: unknown): UserType | null => {
  if (typeof type !== 'string') {
    if (import.meta.env.DEV) {
      console.warn('validateUserType: 문자열이 아닌 타입 입력:', type);
    }
    return null;
  }

  if (isValidUserType(type)) {
    return type;
  }

  if (import.meta.env.DEV) {
    console.warn(`validateUserType: 유효하지 않은 사용자 타입 "${type}"`);
  }

  return null;
};
