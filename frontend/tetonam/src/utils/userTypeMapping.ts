import type { UserType } from '@/types/user';

/**
 * 백엔드 role 배열을 프론트엔드 userType으로 변환
 * @param roles - 백엔드에서 제공하는 role 배열
 * @returns 프론트엔드 userType
 */
export const roleToUserType = (roles: string[]): UserType => {
  if (!Array.isArray(roles) || roles.length === 0) {
    console.warn('roleToUserType: 유효하지 않은 roles 배열:', roles);
    return 'user'; // 기본값
  }

  // 우선순위: COUNSELOR > ADMIN > USER
  if (roles.includes('COUNSELOR')) return 'counselor';
  if (roles.includes('ADMIN')) return 'admin';
  if (roles.includes('USER')) return 'user';

  // 알 수 없는 role인 경우 경고 및 기본값 반환
  console.warn('roleToUserType: 알 수 없는 role들:', roles);
  return 'user';
};

/**
 * 프론트엔드 userType을 백엔드 roles 배열로 변환
 * @param userType - 프론트엔드 userType
 * @returns 백엔드 roles 배열
 */
export const userTypeToRoles = (userType: UserType): string[] => {
  switch (userType) {
    case 'counselor':
      return ['COUNSELOR'];
    case 'admin':
      return ['ADMIN'];
    case 'user':
    default:
      return ['USER'];
  }
};

/**
 * role 문자열을 userType으로 변환 (단일 role인 경우)
 * @param role - 단일 role 문자열
 * @returns 프론트엔드 userType
 */
export const singleRoleToUserType = (role: string): UserType => {
  return roleToUserType([role]);
};

/**
 * userType이 유효한지 검증
 * @param userType - 검증할 userType
 * @returns 유효성 여부
 */
export const isValidUserType = (userType: unknown): userType is UserType => {
  return (
    typeof userType === 'string' &&
    ['user', 'counselor', 'admin'].includes(userType)
  );
};
