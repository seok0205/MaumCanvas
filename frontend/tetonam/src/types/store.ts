import type { UserRole } from '@/constants/userRoles';
import type { RegisterCredentials } from './api';
import type { User } from './user';

// Store 타입 - 인증 상태와 기본 사용자 정보 관리
export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  selectedUserRole: UserRole | null;
  user: User | null; // 기본 사용자 정보 (로그인 시 토큰에서 추출)
  error: string | null;
  isLoading: boolean;

  // Actions
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
  setSelectedUserRole: (type: UserRole) => void;
  clearError: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterCredentials) => Promise<boolean>;
  logout: () => void;
}
