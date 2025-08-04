import type { UserRole } from '@/constants/userRoles';
import type { RegisterCredentials } from './api';
import type { User } from './user';

// Store 타입
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  selectedUserRole: UserRole | null;
  error: string | null;
  isLoading: boolean;

  // Actions
  setUser: (user: User) => void;
  clearUser: () => void;
  setCompletedOnboarding: (completed: boolean) => void;
  setSelectedUserRole: (type: UserRole) => void;
  clearError: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterCredentials) => Promise<boolean>;
  logout: () => void;
}
