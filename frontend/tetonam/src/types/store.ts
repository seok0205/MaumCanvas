import type { UserRole } from '@/constants/userRoles';
import type { RegisterCredentials } from './api';

// Store 타입 - 순수 인증 상태만 관리
export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  selectedUserRole: UserRole | null;
  error: string | null;
  isLoading: boolean;

  // Actions
  setToken: (token: string | null) => void;
  clearAuth: () => void;
  setSelectedUserRole: (type: UserRole) => void;
  clearError: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterCredentials) => Promise<boolean>;
  logout: () => void;
}
