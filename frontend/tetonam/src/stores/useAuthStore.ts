import { queryClient } from '@/config/queryClient';
import { authService } from '@/services/authService';
import type { AuthError } from '@/types/auth';
import type { AuthState } from '@/types/store';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      set => ({
        token: null,
        isAuthenticated: false,
        selectedUserRole: null,
        error: null,
        isLoading: false,

        setToken: token => set({ token, isAuthenticated: !!token, error: null }),

        clearAuth: () =>
          set({ token: null, isAuthenticated: false, error: null }),

        setSelectedUserRole: type => set({ selectedUserRole: type }),

        clearError: () => set({ error: null }),

        login: async (email, password) => {
          set({ isLoading: true, error: null });
          try {
            const tokenResponse = await authService.login(email, password);

            // 로그인 시 이전 선택된 역할 초기화 (백엔드 실제 역할 우선)
            set({ selectedUserRole: null });

            // ✅ 순수 인증 상태만 관리 - token 저장
            set({
              token: tokenResponse.accessToken,
              isAuthenticated: true,
              isLoading: false,
            });

            // 인증 완료 후 약간의 지연을 두어 토큰이 완전히 설정되도록 함
            await new Promise(resolve => setTimeout(resolve, 100));

            return true;
          } catch (error) {
            // 구체적인 에러 타입 확인 및 사용자 친화적 메시지
            let errorMessage = '로그인에 실패했습니다. 다시 시도해주세요.';
            let errorCode = 'LOGIN_FAILED';

            if (error instanceof Error) {
              // 네트워크 에러 처리
              if (
                error.message.includes('Network Error') ||
                error.message.includes('ERR_NETWORK')
              ) {
                errorMessage = '네트워크 연결을 확인해주세요.';
                errorCode = 'NETWORK_ERROR';
              }
              // 인증 에러 처리
              else if (
                error.message.includes('401') ||
                error.message.includes('Unauthorized')
              ) {
                errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
                errorCode = 'INVALID_CREDENTIALS';
              }
              // 서버 에러 처리
              else if (
                error.message.includes('500') ||
                error.message.includes('Internal Server Error')
              ) {
                errorMessage =
                  '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
                errorCode = 'SERVER_ERROR';
              }
            }

            const authError: AuthError = {
              type: 'authentication',
              code: errorCode,
              message: errorMessage,
              ...(error instanceof Error && { details: error.message }),
            };

            set({ error: authError.message, isLoading: false });
            return false;
          }
        },

        register: async userData => {
          set({ isLoading: true, error: null });
          try {
            await authService.register(userData);

            // 회원가입 성공 시 - token이 있다면 저장, 없다면 등록 완료만 표시
            set({
              isAuthenticated: false, // 회원가입 후 로그인 필요
              isLoading: false
            });
            return true;
          } catch (error) {
            // 구체적인 회원가입 에러 처리
            let errorMessage = '회원가입에 실패했습니다. 다시 시도해주세요.';
            let errorCode = 'REGISTER_FAILED';

            if (error instanceof Error) {
              if (error.message.includes('이미 사용 중인 이메일')) {
                errorMessage = '이미 사용 중인 이메일입니다.';
                errorCode = 'EMAIL_ALREADY_EXISTS';
              } else if (error.message.includes('닉네임')) {
                errorMessage = '이미 사용 중인 닉네임입니다.';
                errorCode = 'NICKNAME_ALREADY_EXISTS';
              } else if (error.message.includes('Network Error')) {
                errorMessage = '네트워크 연결을 확인해주세요.';
                errorCode = 'NETWORK_ERROR';
              }
            }

            const authError: AuthError = {
              type: 'validation',
              code: errorCode,
              message: errorMessage,
              ...(error instanceof Error && { details: error.message }),
            };

            set({ error: authError.message, isLoading: false });
            // 에러 정보를 보존하여 상위에서 처리할 수 있도록 함
            throw error;
          }
        },

        logout: () => {
          // React Query 캐시 전체 초기화 - 이전 사용자 데이터 완전 제거
          queryClient.clear();

          // localStorage에서 토큰 제거
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');

          // 모든 인증 관련 상태 완전 초기화
          set({
            token: null,
            isAuthenticated: false,
            selectedUserRole: null,
            error: null,
            isLoading: false,
          });
          // 네비게이션은 useAuthActions에서 처리
        },
      }),
      {
        name: 'auth-storage',
        partialize: state => ({
          token: state.token,
          isAuthenticated: state.isAuthenticated,
          selectedUserRole: state.selectedUserRole,
        }),
      }
    ),
    { name: 'auth-store' }
  )
);
