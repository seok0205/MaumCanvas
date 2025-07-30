import { AUTH_CONSTANTS } from '@/constants/auth';
import { AuthenticationError } from '@/types/auth';
import type { CreateUserRequest, User } from '@/types/user';

// 인증 관련 API 서비스
export const authService = {
  // 로그인
  login: async (
    email: string,
    password: string,
    signal?: AbortSignal
  ): Promise<User> => {
    try {
      // 실제 환경에서는 아래 주석을 해제하고 mock 제거
      // const response = await apiClient.post<LoginResponse>(AUTH_CONSTANTS.ENDPOINTS.LOGIN,
      //   { email, password }, // password 사용
      //   { signal }
      // );
      // localStorage.setItem(AUTH_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN, response.data.token);
      // return response.data.user;

      // Mock 시뮬레이션 (개발용)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // AbortSignal 체크
      if (signal?.aborted) {
        throw new AuthenticationError('ABORTED', '요청이 취소되었습니다.');
      }

      // Mock 비밀번호 검증 (실제 환경에서는 서버에서 처리)
      if (!password || password.length < 6) {
        throw new AuthenticationError(
          'INVALID_PASSWORD',
          '비밀번호가 올바르지 않습니다.'
        );
      }

      // Mock 사용자 데이터
      const mockUser: User = {
        id: '1',
        email,
        name: '홍길동',
        userType: 'student',
        createdAt: new Date().toISOString(),
      };

      // Mock 토큰 저장
      localStorage.setItem(
        AUTH_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN,
        AUTH_CONSTANTS.MOCK_TOKEN
      );
      return mockUser;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthenticationError('ABORTED', '요청이 취소되었습니다.');
      }
      throw new AuthenticationError(
        'LOGIN_FAILED',
        AUTH_CONSTANTS.ERROR_MESSAGES.LOGIN_FAILED
      );
    }
  },

  // 회원가입
  register: async (
    userData: CreateUserRequest,
    signal?: AbortSignal
  ): Promise<User> => {
    try {
      // 실제 환경에서는 아래 주석을 해제하고 mock 제거
      // const response = await apiClient.post<RegisterResponse>(AUTH_CONSTANTS.ENDPOINTS.REGISTER, userData, { signal });
      // localStorage.setItem(AUTH_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN, response.data.token);
      // return response.data.user;

      // Mock 시뮬레이션 (개발용)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // AbortSignal 체크
      if (signal?.aborted) {
        throw new AuthenticationError('ABORTED', '요청이 취소되었습니다.');
      }

      const mockUser: User = {
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      // Mock 토큰 저장
      localStorage.setItem(
        AUTH_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN,
        AUTH_CONSTANTS.MOCK_TOKEN
      );
      return mockUser;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthenticationError('ABORTED', '요청이 취소되었습니다.');
      }
      throw new AuthenticationError(
        'REGISTER_FAILED',
        AUTH_CONSTANTS.ERROR_MESSAGES.REGISTER_FAILED
      );
    }
  },

  // 비밀번호 재설정 요청
  requestPasswordReset: async (
    email: string,
    signal?: AbortSignal
  ): Promise<void> => {
    try {
      // 실제 환경에서는 아래 주석을 해제하고 mock 제거
      // await apiClient.post(AUTH_CONSTANTS.ENDPOINTS.PASSWORD_RESET_REQUEST, { email }, { signal });

      // Mock 시뮬레이션 (개발용)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // AbortSignal 체크
      if (signal?.aborted) {
        throw new AuthenticationError('ABORTED', '요청이 취소되었습니다.');
      }

      console.log('Password reset email sent to:', email);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthenticationError('ABORTED', '요청이 취소되었습니다.');
      }
      throw new AuthenticationError(
        'PASSWORD_RESET_REQUEST_FAILED',
        AUTH_CONSTANTS.ERROR_MESSAGES.PASSWORD_RESET_REQUEST_FAILED
      );
    }
  },

  // 인증 코드 확인
  verifyResetCode: async (
    email: string,
    code: string,
    signal?: AbortSignal
  ): Promise<boolean> => {
    try {
      // 실제 환경에서는 아래 주석을 해제하고 mock 제거
      // const response = await apiClient.post<{ valid: boolean }>(AUTH_CONSTANTS.ENDPOINTS.PASSWORD_RESET_VERIFY, { email, code }, { signal });
      // return response.data.valid;

      // Mock 시뮬레이션 (개발용)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // AbortSignal 체크
      if (signal?.aborted) {
        throw new AuthenticationError('ABORTED', '요청이 취소되었습니다.');
      }

      // Mock 이메일 검증 (실제 환경에서는 서버에서 처리)
      if (!email || !email.includes('@')) {
        throw new AuthenticationError(
          'INVALID_EMAIL',
          '이메일 형식이 올바르지 않습니다.'
        );
      }

      return code === AUTH_CONSTANTS.MOCK_VERIFICATION_CODE; // Mock validation
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthenticationError('ABORTED', '요청이 취소되었습니다.');
      }
      throw new AuthenticationError(
        'VERIFICATION_CODE_FAILED',
        AUTH_CONSTANTS.ERROR_MESSAGES.VERIFICATION_CODE_FAILED
      );
    }
  },

  // 비밀번호 재설정
  resetPassword: async (
    email: string,
    code: string,
    newPassword: string,
    signal?: AbortSignal
  ): Promise<void> => {
    try {
      // 실제 환경에서는 아래 주석을 해제하고 mock 제거
      // await apiClient.post(AUTH_CONSTANTS.ENDPOINTS.PASSWORD_RESET_CONFIRM, { email, code, newPassword }, { signal });

      // Mock 시뮬레이션 (개발용)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // AbortSignal 체크
      if (signal?.aborted) {
        throw new AuthenticationError('ABORTED', '요청이 취소되었습니다.');
      }

      // Mock 입력값 검증 (실제 환경에서는 서버에서 처리)
      if (!email || !email.includes('@')) {
        throw new AuthenticationError(
          'INVALID_EMAIL',
          '이메일 형식이 올바르지 않습니다.'
        );
      }
      if (code !== AUTH_CONSTANTS.MOCK_VERIFICATION_CODE) {
        throw new AuthenticationError(
          'INVALID_CODE',
          '인증 코드가 올바르지 않습니다.'
        );
      }
      if (!newPassword || newPassword.length < 6) {
        throw new AuthenticationError(
          'INVALID_PASSWORD',
          '새 비밀번호는 6자 이상이어야 합니다.'
        );
      }

      console.log('Password reset successful for:', email);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthenticationError('ABORTED', '요청이 취소되었습니다.');
      }
      throw new AuthenticationError(
        'PASSWORD_RESET_FAILED',
        AUTH_CONSTANTS.ERROR_MESSAGES.PASSWORD_RESET_FAILED
      );
    }
  },

  // 로그아웃
  logout: (): void => {
    localStorage.removeItem(AUTH_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN);
  },

  // 토큰 확인
  validateToken: async (signal?: AbortSignal): Promise<User | null> => {
    try {
      const token = localStorage.getItem(
        AUTH_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN
      );
      if (!token) return null;

      // 실제 환경에서는 아래 주석을 해제하고 mock 제거
      // const response = await apiClient.get<{ user: User }>(AUTH_CONSTANTS.ENDPOINTS.VALIDATE_TOKEN, { signal });
      // return response.data.user;

      // Mock 시뮬레이션 (개발용)
      if (signal?.aborted) {
        throw new AuthenticationError('ABORTED', '요청이 취소되었습니다.');
      }

      if (token === AUTH_CONSTANTS.MOCK_TOKEN) {
        return {
          id: '1',
          email: 'user@example.com',
          name: '홍길동',
          userType: 'student',
          createdAt: new Date().toISOString(),
        };
      }

      return null;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      return null;
    }
  },
};
