// 사용자 역할 라벨 상수
export const USER_ROLE_LABELS = {
  USER: '학생',
  COUNSELOR: '상담사',
  ADMIN: '관리자',
} as const;

export type UserRole = keyof typeof USER_ROLE_LABELS;

// 타입 가드 함수
export const isValidUserRole = (role: string): role is UserRole => {
  return role in USER_ROLE_LABELS;
};

// 사용자 역할 라벨 가져오기 함수 (타입 안전성 강화)
export const getUserRoleLabel = (role: string): string => {
  if (!role || typeof role !== 'string') {
    if (import.meta.env.DEV) {
      console.warn('getUserRoleLabel: 유효하지 않은 역할 입력:', role);
    }
    return '알 수 없음';
  }

  if (isValidUserRole(role)) {
    return USER_ROLE_LABELS[role];
  }

  // 개발 환경에서 경고 로그
  if (import.meta.env.DEV) {
    console.warn(`getUserRoleLabel: 알 수 없는 사용자 역할 "${role}"`);
  }

  return role; // 알 수 없는 역할인 경우 원본 값 반환
};

// 사용자 역할 목록 가져오기 함수
export const getUserRoles = (): UserRole[] => {
  return Object.keys(USER_ROLE_LABELS) as UserRole[];
};

// 사용자 역할 검증 함수 (더 엄격한 검증)
export const validateUserRole = (role: unknown): UserRole | null => {
  if (typeof role !== 'string') {
    if (import.meta.env.DEV) {
      console.warn('validateUserRole: 문자열이 아닌 역할 입력:', role);
    }
    return null;
  }

  if (isValidUserRole(role)) {
    return role;
  }

  if (import.meta.env.DEV) {
    console.warn(`validateUserRole: 유효하지 않은 사용자 역할 "${role}"`);
  }

  return null;
};
