import { queryClient } from '@/config/queryClient';
import type { UserRole } from '@/constants/userRoles';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
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
        // hasCompletedOnboarding 제거 - 항상 온보딩을 시작점으로 사용
        selectedUserRole: null,
        error: null,
        isLoading: false,

        setUser: user => set({ user, isAuthenticated: true, error: null }),

        // 사용자 프로필 정보 업데이트 (name, nickname 등)
        updateUserProfile: (profileData: { name?: string; nickname?: string; id?: string }) =>
          set(state => {
            if (!state.user) return state;
            
            const updatedUser = {
              ...state.user,
              ...(profileData.name && { name: profileData.name.trim() }),
              ...(profileData.nickname && { nickname: profileData.nickname.trim() }),
              ...(profileData.id && { id: profileData.id }),
            };
            
            return { 
              user: updatedUser,
              error: null 
            };
          }),

        clearUser: () =>
          set({ user: null, isAuthenticated: false, error: null }),

        // setCompletedOnboarding 제거

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

            // 백엔드 enum은 ROLE_USER 형태를 반환하므로 정규화
            const normalizeRole = (r: string): string => {
              if (r.startsWith('ROLE_')) return r.replace('ROLE_', '');
              return r;
            };
            const normalized = tokenRoles.map(normalizeRole);

            // 정규화 후 프론트 UserRole로 필터
            const finalRoles = normalized.filter((role): role is UserRole =>
              ['USER', 'COUNSELOR', 'ADMIN'].includes(role)
            );

            // 유효한 역할이 없으면 기본값 설정
            const validatedRoles =
              finalRoles.length > 0 ? finalRoles : (['USER'] as UserRole[]);

            // 🎯 하이브리드 접근법: ID는 즉시 가져오기 (핵심 기능 보장)
            // name, nickname은 TanStack Query에서 동기화
            let userId = '';
            try {
              const myInfo = await userService.getHomeMyInfo();
              const idCandidate =
                myInfo?.id ?? myInfo?.userId;
              if (typeof idCandidate === 'number' && idCandidate > 0) {
                userId = String(idCandidate);
              }
            } catch (error) {
              // ID 조회 실패해도 로그인은 성공으로 처리
              console.warn('사용자 ID 조회 실패, 나중에 동기화 예정:', error);
            }

            const user: User = {
              id: userId, // ✅ 핵심 기능을 위한 ID는 보장
              email: email,
              name: '', // TanStack Query에서 동기화
              nickname: '', // TanStack Query에서 동기화
              gender: '',
              phone: '',
              school: '',
              birthday: '',
              roles: validatedRoles,
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
            // 백엔드 회원가입 DTO가 roles 배열을 제공하므로 이를 검증 후 사용
            const rawRoles: string[] = Array.isArray(userData.roles)
              ? userData.roles
              : [];
            const normalizeRole = (r: string): string =>
              r.startsWith('ROLE_') ? r.replace('ROLE_', '') : r;
            const roles: UserRole[] = rawRoles
              .map(normalizeRole)
              .filter((r): r is UserRole =>
                ['USER', 'COUNSELOR', 'ADMIN'].includes(r)
              );

            const user: User = {
              id: response.id.toString(),
              email: userData.email,
              name: userData.name,
              nickname: userData.nickname,
              gender: userData.gender,
              phone: userData.phone,
              school: userData.school.name, // school 객체에서 name만 추출
              birthday: userData.birthday,
              roles: roles.length > 0 ? roles : (['USER'] as UserRole[]),
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
          // React Query 캐시 전체 초기화 - 이전 사용자 데이터 완전 제거
          queryClient.clear();

          // localStorage에서 토큰 제거
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');

          // 모든 인증 관련 상태 완전 초기화
          set({
            user: null,
            isAuthenticated: false,
            // hasCompletedOnboarding 제거 - 항상 온보딩을 시작점으로 사용
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
          // hasCompletedOnboarding 제거 - 온보딩 상태 추적하지 않음
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          selectedUserRole: state.selectedUserRole, // selectedUserRole 추가
        }),
      }
    ),
    { name: 'auth-store' }
  )
);
