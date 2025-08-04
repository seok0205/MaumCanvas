import { ROUTES } from '@/constants/routes';
import type { UserRole } from '@/constants/userRoles';
import { authService } from '@/services/authService';
import type { AuthError } from '@/types/auth';
import type { AuthState } from '@/types/store';
import type { User } from '@/types/user';
import { getPrimaryRole } from '@/utils/userRoleMapping';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        hasCompletedOnboarding: false,
        selectedUserRole: null,
        error: null,
        isLoading: false,

        setUser: user => set({ user, isAuthenticated: true, error: null }),

        clearUser: () =>
          set({ user: null, isAuthenticated: false, error: null }),

        setCompletedOnboarding: completed =>
          set({ hasCompletedOnboarding: completed }),

        setSelectedUserRole: type => set({ selectedUserRole: type }),

        clearError: () => set({ error: null }),

        login: async (email, password) => {
          set({ isLoading: true, error: null });
          try {
            const tokenResponse = await authService.login(email, password);

            // role 배열을 주요 역할로 변환 (안전한 처리)
            const primaryRole =
              get().selectedUserRole || getPrimaryRole(tokenResponse.roles || []);

            // 사용자 정보 조회 (JWT 토큰 필요)
            const userInfo = await authService.getMyInfo();

            const user: User = {
              id: userInfo.id || `user-${Date.now()}`, // 백엔드에서 ID 제공하지 않는 경우 임시 ID
              email: userInfo.email,
              name: userInfo.name,
              nickname: userInfo.nickname,
              gender: userInfo.gender,
              phone: userInfo.phone,
              school: userInfo.school,
              birthday: userInfo.birthday,
              roles: (userInfo.roles || [primaryRole]) as UserRole[], // 타입 캐스팅
              createdAt: new Date().toISOString(),
            };

            // 인증 상태를 먼저 설정하여 다른 컴포넌트들이 인증 상태를 인식할 수 있도록 함
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            });

            // 인증 완료 후 약간의 지연을 두어 토큰이 완전히 설정되도록 함
            await new Promise(resolve => setTimeout(resolve, 100));

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
            const response = await authService.register(userData);

            // 회원가입 성공 시 사용자 정보 생성
            const user: User = {
              id: response.id.toString(),
              email: userData.email,
              name: userData.name,
              nickname: userData.nickname,
              gender: userData.gender,
              phone: userData.phone,
              school: userData.school.name, // school 객체에서 name만 추출
              birthday: userData.birthday,
              roles: userData.roles as UserRole[], // 타입 캐스팅
              createdAt: new Date().toISOString(),
            };

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
            selectedUserRole: null,
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
