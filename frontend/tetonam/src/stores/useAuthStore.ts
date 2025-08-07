import type { UserRole } from '@/constants/userRoles';
import { authService } from '@/services/authService';
import type { AuthError } from '@/types/auth';
import type { AuthState } from '@/types/store';
import type { User } from '@/types/user';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      set => ({
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

            // 로그인 시 이전 선택된 역할 초기화 (백엔드 실제 역할 우선)
            set({ selectedUserRole: null });

            // 백엔드 JWT 토큰의 role 정보를 사용 (모든 역할 정보 보존)
            // 토큰에서 받은 role 배열을 그대로 사용
            const tokenRoles = tokenResponse.role || [];

            // JWT 토큰의 role 정보를 사용 (my-info API는 역할 판단에 불필요)
            const finalRoles = tokenRoles.filter((role): role is UserRole =>
              ['USER', 'COUNSELOR', 'ADMIN'].includes(role)
            );

            // 유효한 역할이 없으면 기본값 설정
            const validatedRoles =
              finalRoles.length > 0 ? finalRoles : (['USER'] as UserRole[]);

            // 로그인 시에는 role 정보만 설정하고, 나머지 정보는 필요시 별도 API로 가져옴
            const user: User = {
              id: `user-${Date.now()}`, // 임시 ID
              email: email, // 로그인 파라미터에서 가져옴
              name: '', // 필요시 my-info API로 별도 조회
              nickname: '',
              gender: '',
              phone: '',
              school: '',
              birthday: '',
              roles: validatedRoles, // 토큰 기반 검증된 roles 배열 사용
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
            const response = await authService.register(userData);

            // 회원가입 성공 시 안전한 사용자 정보 생성
            const user: User = {
              id: response.id.toString(),
              email: userData.email,
              name: userData.name,
              nickname: userData.nickname,
              gender: userData.gender,
              phone: userData.phone,
              school: userData.school.name, // school 객체에서 name만 추출
              birthday: userData.birthday,
              roles: [userData.role as UserRole], // 단일 role을 배열로 변환
              createdAt: new Date().toISOString(),
            };

            set({ user, isAuthenticated: true, isLoading: false });
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
          // 모든 인증 관련 상태 완전 초기화
          set({
            user: null,
            isAuthenticated: false,
            hasCompletedOnboarding: false,
            selectedUserRole: null,
            error: null,
            isLoading: false, // 로딩 상태도 초기화
          });
          // 네비게이션은 useAuthActions에서 처리
        },
      }),
      {
        name: 'auth-storage',
        partialize: state => ({
          hasCompletedOnboarding: state.hasCompletedOnboarding,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          selectedUserRole: state.selectedUserRole, // selectedUserRole 추가
        }),
      }
    ),
    { name: 'auth-store' }
  )
);
