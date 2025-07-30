import { ROUTES } from '@/constants/routes';
import { authService } from '@/services/authService';
import type { AuthError } from '@/types/auth';
import type { AuthState } from '@/types/store';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        hasCompletedOnboarding: false,
        selectedUserType: null,
        error: null,
        isLoading: false,

        setUser: user => set({ user, isAuthenticated: true, error: null }),

        clearUser: () =>
          set({ user: null, isAuthenticated: false, error: null }),

        setCompletedOnboarding: completed =>
          set({ hasCompletedOnboarding: completed }),

        setSelectedUserType: type => set({ selectedUserType: type }),

        clearError: () => set({ error: null }),

        login: async (email, password) => {
          set({ isLoading: true, error: null });
          try {
            const user = await authService.login(email, password);
            const userWithType = {
              ...user,
              userType: get().selectedUserType || user.userType,
            };

            set({
              user: userWithType,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          } catch (error) {
            const authError: AuthError = {
              type: 'authentication',
              code: 'LOGIN_FAILED',
              message: '이메일 또는 비밀번호가 올바르지 않습니다.',
              ...(error instanceof Error && { details: error.message }),
            };
            set({ error: authError.message, isLoading: false });
            return false;
          }
        },

        register: async userData => {
          set({ isLoading: true, error: null });
          try {
            const user = await authService.register(userData);
            set({ user, isAuthenticated: true, isLoading: false });
            return true;
          } catch (error) {
            const authError: AuthError = {
              type: 'validation',
              code: 'REGISTER_FAILED',
              message: '회원가입에 실패했습니다. 다시 시도해주세요.',
              ...(error instanceof Error && { details: error.message }),
            };
            set({ error: authError.message, isLoading: false });
            return false;
          }
        },

        logout: () => {
          set({
            user: null,
            isAuthenticated: false,
            selectedUserType: null,
            error: null,
          });
          // 로그아웃 후 로그인 페이지로 이동
          window.location.href = ROUTES.LOGIN;
        },
      }),
      {
        name: 'auth-storage',
        partialize: state => ({
          hasCompletedOnboarding: state.hasCompletedOnboarding,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'auth-store' }
  )
);
