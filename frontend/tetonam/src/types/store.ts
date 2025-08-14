import type { UserRole } from '@/constants/userRoles';
import type { RegisterCredentials } from './api';
import type { User } from './user';

// Store 타입
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  // hasCompletedOnboarding 제거 - 항상 온보딩 페이지를 시작점으로 사용
  selectedUserRole: UserRole | null;
  error: string | null;
  isLoading: boolean;

  // Actions
  setUser: (user: User) => void;
  clearUser: () => void;
  // setCompletedOnboarding 제거
  setSelectedUserRole: (type: UserRole) => void;
  clearError: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterCredentials) => Promise<boolean>;
  logout: () => void;
}
