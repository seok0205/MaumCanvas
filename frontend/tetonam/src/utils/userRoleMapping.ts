import type { UserRole } from '@/constants/userRoles';

/**
 * 백엔드 role 배열을 프론트엔드 UserRole로 변환
 * @param roles - 백엔드에서 제공하는 role 배열
 * @returns 프론트엔드 UserRole
 */
export const getPrimaryRole = (
  roles: string[] | undefined | null
): UserRole => {
  // 더 엄격한 유효성 검사
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    // 개발 환경에서만 경고 출력
    if (process.env['NODE_ENV'] === 'development') {
      console.warn('getPrimaryRole: 유효하지 않은 roles 배열:', roles);
    }
    return 'USER'; // 기본값
  }

  // 우선순위: COUNSELOR > ADMIN > USER
  if (roles.includes('COUNSELOR')) return 'COUNSELOR';
  if (roles.includes('ADMIN')) return 'ADMIN';
  if (roles.includes('USER')) return 'USER';

  // 알 수 없는 role인 경우 경고 및 기본값 반환
  if (process.env['NODE_ENV'] === 'development') {
    console.warn('getPrimaryRole: 알 수 없는 role들:', roles);
  }
  return 'USER';
};

/**
 * 프론트엔드 UserRole을 백엔드 roles 배열로 변환
 * @param role - 프론트엔드 UserRole
 * @returns 백엔드 roles 배열
 */
export const roleToRolesArray = (role: UserRole): string[] => {
  switch (role) {
    case 'COUNSELOR':
      return ['COUNSELOR'];
    case 'ADMIN':
      return ['ADMIN'];
    case 'USER':
    default:
      return ['USER'];
  }
};

/**
 * role 문자열을 UserRole로 변환 (단일 role인 경우)
 * @param role - 단일 role 문자열
 * @returns 프론트엔드 UserRole
 */
export const singleRoleToUserRole = (role: string): UserRole => {
  return getPrimaryRole([role]);
};
