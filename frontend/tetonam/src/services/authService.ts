import { AUTH_CONSTANTS } from '@/constants/auth';
import type {
  ApiResponse,
  EmailVerificationData,
  JwtTokenResponse,
  LoginCredentials,
  RegisterCredentials,
  RegisterResponse,
  ResetPasswordData,
  UserInfoResponse,
} from '@/types/api';
import { AuthenticationError } from '@/types/auth';
import type { AxiosError } from 'axios';
import { apiClient } from './apiClient';

// 인증 관련 API 서비스 - 백엔드 API 문서 기반
export const authService = {
  // 로그인
  login: async (
    email: string,
    password: string,
    signal?: AbortSignal
  ): Promise<JwtTokenResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<JwtTokenResponse>>(
        '/user/sign-in',
        { email, password } as LoginCredentials,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess || !response.data.result) {
        throw new AuthenticationError(
          response.data.code || 'LOGIN_FAILED',
          '이메일 혹은 비밀번호를 잘못 입력하였습니다. 다시 시도해주세요.'
        );
      }

      // 토큰 저장
      const { accessToken, refreshToken } = response.data.result;
      localStorage.setItem(
        AUTH_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN,
        accessToken
      );
      localStorage.setItem(
        AUTH_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN,
        refreshToken
      );

      return response.data.result;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthenticationError('ABORTED', '요청이 취소되었습니다.');
      }

      // 네트워크 에러 처리
      const axiosError = error as AxiosError<ApiResponse<null>>;
      if (
        axiosError.code === 'NETWORK_ERROR' ||
        axiosError.code === 'ERR_NETWORK'
      ) {
        throw new AuthenticationError(
          'NETWORK_ERROR',
          '네트워크 연결을 확인해주세요.'
        );
      }

      // API 에러 처리 (백엔드에서 반환하는 에러)
      if (axiosError.response?.data) {
        const apiError = axiosError.response.data;
        // 백엔드 API 문서의 에러 코드들에 대한 처리
        switch (apiError.code) {
          case 'USER4003': // 로그인 정보가 일치하지 않습니다
          case 'USER4004': // 아이디를 잘못 입력했습니다
          case 'USER4002': // 해당 유저가 없습니다
          case 'COMMON400': // 잘못된 요청입니다
          case 'COMMON401': // 인증이 필요합니다
          case 'COMMON403': // 금지된 요청입니다
          case 'COMMON500': // 서버 에러
          default:
            throw new AuthenticationError(
              apiError.code || 'LOGIN_FAILED',
              '이메일 혹은 비밀번호를 잘못 입력하였습니다. 다시 시도해주세요.'
            );
        }
      }

      // 기타 예상치 못한 에러
      throw new AuthenticationError(
        'LOGIN_FAILED',
        '이메일 혹은 비밀번호를 잘못 입력하였습니다. 다시 시도해주세요.'
      );
    }
  },

  // 회원가입
  register: async (
    userData: RegisterCredentials,
    signal?: AbortSignal
  ): Promise<RegisterResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<RegisterResponse>>(
        '/user/sign-up',
        userData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess || !response.data.result) {
        throw new AuthenticationError(
          response.data.code || 'REGISTER_FAILED',
          '회원가입에 실패했습니다. 다시 시도해주세요.'
        );
      }

      return response.data.result;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthenticationError('ABORTED', '요청이 취소되었습니다.');
      }

      // 네트워크 에러 처리
      const axiosError = error as AxiosError<ApiResponse<null>>;
      if (
        axiosError.code === 'NETWORK_ERROR' ||
        axiosError.code === 'ERR_NETWORK'
      ) {
        throw new AuthenticationError(
          'NETWORK_ERROR',
          '네트워크 연결을 확인해주세요.'
        );
      }

      // API 에러 처리 (백엔드에서 반환하는 에러)
      if (axiosError.response?.data) {
        const apiError = axiosError.response.data;
        // 백엔드 API 문서의 에러 코드들에 대한 처리
        switch (apiError.code) {
          case 'USER4000': // 사용중인 이메일 입니다
          case 'USER4001': // 사용중인 닉네임 입니다
          case 'COMMON400': // 잘못된 요청입니다
          case 'COMMON401': // 인증이 필요합니다
          case 'COMMON403': // 금지된 요청입니다
          case 'COMMON500': // 서버 에러
          default:
            throw new AuthenticationError(
              apiError.code || 'REGISTER_FAILED',
              '회원가입에 실패했습니다. 다시 시도해주세요.'
            );
        }
      }

      // 기타 예상치 못한 에러
      throw new AuthenticationError(
        'REGISTER_FAILED',
        '회원가입에 실패했습니다. 다시 시도해주세요.'
      );
    }
  },

  // 비밀번호 재설정
  resetPassword: async (
    email: string,
    newPassword: string,
    signal?: AbortSignal
  ): Promise<void> => {
    try {
      const response = await apiClient.patch<ApiResponse<string>>(
        '/user/password',
        { email, newPassword } as ResetPasswordData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess) {
        throw new AuthenticationError(
          response.data.code || 'PASSWORD_RESET_FAILED',
          '비밀번호 재설정에 실패했습니다. 다시 시도해주세요.'
        );
      }
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthenticationError('ABORTED', '요청이 취소되었습니다.');
      }

      // 네트워크 에러 처리
      const axiosError = error as AxiosError<ApiResponse<null>>;
      if (
        axiosError.code === 'NETWORK_ERROR' ||
        axiosError.code === 'ERR_NETWORK'
      ) {
        throw new AuthenticationError(
          'NETWORK_ERROR',
          '네트워크 연결을 확인해주세요.'
        );
      }

      // API 에러 처리 (백엔드에서 반환하는 에러)
      if (axiosError.response?.data) {
        const apiError = axiosError.response.data;
        // 백엔드 API 문서의 에러 코드들에 대한 처리
        switch (apiError.code) {
          case 'USER4002': // 해당 유저가 없습니다
          case 'COMMON400': // 잘못된 요청입니다
          case 'COMMON401': // 인증이 필요합니다
          case 'COMMON403': // 금지된 요청입니다
          case 'COMMON500': // 서버 에러
          default:
            throw new AuthenticationError(
              apiError.code || 'PASSWORD_RESET_FAILED',
              '비밀번호 재설정에 실패했습니다. 다시 시도해주세요.'
            );
        }
      }

      // 기타 예상치 못한 에러
      throw new AuthenticationError(
        'PASSWORD_RESET_FAILED',
        '비밀번호 재설정에 실패했습니다. 다시 시도해주세요.'
      );
    }
  },

  // 이메일 인증 코드 발송
  sendEmailVerification: async (
    email: string,
    signal?: AbortSignal
  ): Promise<string> => {
    try {
      const response = await apiClient.post<ApiResponse<string>>(
        '/mail/send',
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess || !response.data.result) {
        throw new AuthenticationError(
          response.data.code || 'EMAIL_SEND_FAILED',
          '이메일 발송에 실패했습니다. 다시 시도해주세요.'
        );
      }

      return response.data.result;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthenticationError('ABORTED', '요청이 취소되었습니다.');
      }

      // 네트워크 에러 처리
      const axiosError = error as AxiosError<ApiResponse<null>>;
      if (
        axiosError.code === 'NETWORK_ERROR' ||
        axiosError.code === 'ERR_NETWORK'
      ) {
        throw new AuthenticationError(
          'NETWORK_ERROR',
          '네트워크 연결을 확인해주세요.'
        );
      }

      // API 에러 처리 (백엔드에서 반환하는 에러)
      if (axiosError.response?.data) {
        const apiError = axiosError.response.data;
        // 백엔드 API 문서의 에러 코드들에 대한 처리
        switch (apiError.code) {
          case 'MAIL5000': // 이메일 전송에 에러가 발생했습니다
          case 'COMMON400': // 잘못된 요청입니다
          case 'COMMON401': // 인증이 필요합니다
          case 'COMMON403': // 금지된 요청입니다
          case 'COMMON500': // 서버 에러
          default:
            throw new AuthenticationError(
              apiError.code || 'EMAIL_SEND_FAILED',
              '이메일 발송에 실패했습니다. 다시 시도해주세요.'
            );
        }
      }

      // 기타 예상치 못한 에러
      throw new AuthenticationError(
        'EMAIL_SEND_FAILED',
        '이메일 발송에 실패했습니다. 다시 시도해주세요.'
      );
    }
  },

  // 이메일 인증 코드 확인
  verifyEmailCode: async (
    email: string,
    authNum: string,
    signal?: AbortSignal
  ): Promise<boolean> => {
    try {
      const response = await apiClient.post<ApiResponse<string>>(
        '/mail/auth-check',
        { email, authNum } as EmailVerificationData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          ...(signal && { signal }),
        }
      );

      return response.data.isSuccess;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthenticationError('ABORTED', '요청이 취소되었습니다.');
      }

      // 네트워크 에러 처리
      const axiosError = error as AxiosError<ApiResponse<null>>;
      if (
        axiosError.code === 'NETWORK_ERROR' ||
        axiosError.code === 'ERR_NETWORK'
      ) {
        throw new AuthenticationError(
          'NETWORK_ERROR',
          '네트워크 연결을 확인해주세요.'
        );
      }

      // API 에러 처리 (백엔드에서 반환하는 에러)
      if (axiosError.response?.data) {
        const apiError = axiosError.response.data;
        // 백엔드 API 문서의 에러 코드들에 대한 처리
        switch (apiError.code) {
          case 'MAIL4000': // 인증번호를 입력해주세요 / 인증번호가 틀렸습니다
          case 'COMMON400': // 잘못된 요청입니다
          case 'COMMON401': // 인증이 필요합니다
          case 'COMMON403': // 금지된 요청입니다
          case 'COMMON500': // 서버 에러
          default:
            throw new AuthenticationError(
              apiError.code || 'EMAIL_VERIFICATION_FAILED',
              '이메일 인증에 실패했습니다. 다시 시도해주세요.'
            );
        }
      }

      // 기타 예상치 못한 에러
      throw new AuthenticationError(
        'EMAIL_VERIFICATION_FAILED',
        '이메일 인증에 실패했습니다. 다시 시도해주세요.'
      );
    }
  },

  // 이메일 중복 확인
  checkEmailDuplicate: async (
    email: string,
    signal?: AbortSignal
  ): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('email', email);

      const response = await apiClient.post<ApiResponse<string>>(
        '/user/email-duplicate-check',
        formData,
        {
          ...(signal && { signal }),
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!response.data.isSuccess || !response.data.result) {
        throw new AuthenticationError(
          response.data.code || 'EMAIL_CHECK_FAILED',
          '이메일 중복 확인에 실패했습니다. 다시 시도해주세요.'
        );
      }

      return response.data.result;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthenticationError('ABORTED', '요청이 취소되었습니다.');
      }

      // 네트워크 에러 처리
      const axiosError = error as AxiosError<ApiResponse<null>>;
      if (
        axiosError.code === 'NETWORK_ERROR' ||
        axiosError.code === 'ERR_NETWORK'
      ) {
        throw new AuthenticationError(
          'NETWORK_ERROR',
          '네트워크 연결을 확인해주세요.'
        );
      }

      // API 에러 처리 (백엔드에서 반환하는 에러)
      if (axiosError.response?.data) {
        const apiError = axiosError.response.data;
        // 백엔드 API 문서의 에러 코드들에 대한 처리
        switch (apiError.code) {
          case 'USER4000': // 사용중인 이메일 입니다
          case 'COMMON400': // 잘못된 요청입니다
          case 'COMMON401': // 인증이 필요합니다
          case 'COMMON403': // 금지된 요청입니다
          case 'COMMON500': // 서버 에러
          default:
            throw new AuthenticationError(
              apiError.code || 'EMAIL_CHECK_FAILED',
              '이메일 중복 확인에 실패했습니다. 다시 시도해주세요.'
            );
        }
      }

      // 기타 예상치 못한 에러
      throw new AuthenticationError(
        'EMAIL_CHECK_FAILED',
        '이메일 중복 확인에 실패했습니다. 다시 시도해주세요.'
      );
    }
  },

  // 닉네임 중복 확인
  checkNicknameDuplicate: async (
    nickname: string,
    signal?: AbortSignal
  ): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('nickname', nickname);

      const response = await apiClient.post<ApiResponse<string>>(
        '/user/nickname-duplicate-check',
        formData,
        {
          ...(signal && { signal }),
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!response.data.isSuccess || !response.data.result) {
        throw new AuthenticationError(
          response.data.code || 'NICKNAME_CHECK_FAILED',
          '닉네임 중복 확인에 실패했습니다. 다시 시도해주세요.'
        );
      }

      return response.data.result;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthenticationError('ABORTED', '요청이 취소되었습니다.');
      }

      // 네트워크 에러 처리
      const axiosError = error as AxiosError<ApiResponse<null>>;
      if (
        axiosError.code === 'NETWORK_ERROR' ||
        axiosError.code === 'ERR_NETWORK'
      ) {
        throw new AuthenticationError(
          'NETWORK_ERROR',
          '네트워크 연결을 확인해주세요.'
        );
      }

      // API 에러 처리 (백엔드에서 반환하는 에러)
      if (axiosError.response?.data) {
        const apiError = axiosError.response.data;
        // 백엔드 API 문서의 에러 코드들에 대한 처리
        switch (apiError.code) {
          case 'USER4001': // 사용중인 닉네임 입니다
          case 'COMMON400': // 잘못된 요청입니다
          case 'COMMON401': // 인증이 필요합니다
          case 'COMMON403': // 금지된 요청입니다
          case 'COMMON500': // 서버 에러
          default:
            throw new AuthenticationError(
              apiError.code || 'NICKNAME_CHECK_FAILED',
              '닉네임 중복 확인에 실패했습니다. 다시 시도해주세요.'
            );
        }
      }

      // 기타 예상치 못한 에러
      throw new AuthenticationError(
        'NICKNAME_CHECK_FAILED',
        '닉네임 중복 확인에 실패했습니다. 다시 시도해주세요.'
      );
    }
  },

  // 마이페이지 정보 조회
  getMyInfo: async (signal?: AbortSignal): Promise<UserInfoResponse> => {
    try {
      const response = await apiClient.get<ApiResponse<UserInfoResponse>>(
        '/user/my-info',
        {
          headers: {
            'Content-Type': 'application/json',
          },
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess || !response.data.result) {
        throw new AuthenticationError(
          response.data.code || 'USER_INFO_FAILED',
          '사용자 정보 조회에 실패했습니다. 다시 시도해주세요.'
        );
      }

      return response.data.result;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthenticationError('ABORTED', '요청이 취소되었습니다.');
      }

      // 네트워크 에러 처리
      const axiosError = error as AxiosError<ApiResponse<null>>;
      if (
        axiosError.code === 'NETWORK_ERROR' ||
        axiosError.code === 'ERR_NETWORK'
      ) {
        throw new AuthenticationError(
          'NETWORK_ERROR',
          '네트워크 연결을 확인해주세요.'
        );
      }

      // API 에러 처리 (백엔드에서 반환하는 에러)
      if (axiosError.response?.data) {
        const apiError = axiosError.response.data;
        // 백엔드 API 문서의 에러 코드들에 대한 처리
        switch (apiError.code) {
          case 'USER4002': // 해당 유저가 없습니다
          case 'COMMON400': // 잘못된 요청입니다
          case 'COMMON401': // 인증이 필요합니다
          case 'COMMON403': // 금지된 요청입니다
          case 'COMMON500': // 서버 에러
          default:
            throw new AuthenticationError(
              apiError.code || 'USER_INFO_FAILED',
              '사용자 정보 조회에 실패했습니다. 다시 시도해주세요.'
            );
        }
      }

      // 기타 예상치 못한 에러
      throw new AuthenticationError(
        'USER_INFO_FAILED',
        '사용자 정보 조회에 실패했습니다. 다시 시도해주세요.'
      );
    }
  },

  // 내 닉네임 조회
  getMyNickname: async (signal?: AbortSignal): Promise<string> => {
    try {
      const response = await apiClient.get<ApiResponse<string>>(
        '/user/my-nickname',
        {
          headers: {
            'Content-Type': 'application/json',
          },
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess || !response.data.result) {
        throw new AuthenticationError(
          response.data.code || 'NICKNAME_GET_FAILED',
          '닉네임 조회에 실패했습니다. 다시 시도해주세요.'
        );
      }

      return response.data.result;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthenticationError('ABORTED', '요청이 취소되었습니다.');
      }

      // 네트워크 에러 처리
      const axiosError = error as AxiosError<ApiResponse<null>>;
      if (
        axiosError.code === 'NETWORK_ERROR' ||
        axiosError.code === 'ERR_NETWORK'
      ) {
        throw new AuthenticationError(
          'NETWORK_ERROR',
          '네트워크 연결을 확인해주세요.'
        );
      }

      // API 에러 처리 (백엔드에서 반환하는 에러)
      if (axiosError.response?.data) {
        const apiError = axiosError.response.data;
        // 백엔드 API 문서의 에러 코드들에 대한 처리
        switch (apiError.code) {
          case 'USER4002': // 해당 유저가 없습니다
          case 'COMMON400': // 잘못된 요청입니다
          case 'COMMON401': // 인증이 필요합니다
          case 'COMMON403': // 금지된 요청입니다
          case 'COMMON500': // 서버 에러
          default:
            throw new AuthenticationError(
              apiError.code || 'NICKNAME_GET_FAILED',
              '닉네임 조회에 실패했습니다. 다시 시도해주세요.'
            );
        }
      }

      // 기타 예상치 못한 에러
      throw new AuthenticationError(
        'NICKNAME_GET_FAILED',
        '닉네임 조회에 실패했습니다. 다시 시도해주세요.'
      );
    }
  },

  // 로그아웃
  logout: (): void => {
    localStorage.removeItem(AUTH_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN);
  },

  // 토큰 확인
  validateToken: async (
    signal?: AbortSignal
  ): Promise<UserInfoResponse | null> => {
    try {
      const token = localStorage.getItem(
        AUTH_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN
      );
      if (!token) return null;

      // 토큰 유효성 검증을 위해 마이페이지 정보 조회
      return await authService.getMyInfo(signal);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      return null;
    }
  },
};
