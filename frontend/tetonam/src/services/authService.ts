import { AUTH_CONSTANTS } from '@/constants/auth';
import type {
  ApiResponse,
  EmailVerificationData,
  JwtTokenResponse,
  LoginCredentials,
  RegisterCredentials,
  RegisterResponse,
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
        AUTH_CONSTANTS.ENDPOINTS.LOGIN,
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
        AUTH_CONSTANTS.ENDPOINTS.REGISTER,
        userData, // 이미 roles 배열이 포함되어 있음
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

  // 비밀번호 재설정 (이메일 인증 코드 발송)
  requestPasswordReset: async (
    email: string,
    signal?: AbortSignal
  ): Promise<void> => {
    try {
      const response = await apiClient.post<ApiResponse<string>>(
        AUTH_CONSTANTS.ENDPOINTS.EMAIL_SEND,
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess) {
        throw new AuthenticationError(
          response.data.code || 'EMAIL_SEND_FAILED',
          '이메일 발송에 실패했습니다. 다시 시도해주세요.'
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
          case 'MAIL5000': // 이메일 전송에 에러가 발생했습니다
            throw new AuthenticationError(
              apiError.code,
              '이메일 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
            );
          case 'COMMON400': // 잘못된 요청입니다
            throw new AuthenticationError(
              apiError.code,
              '잘못된 요청입니다. 이메일 주소를 확인해주세요.'
            );
          case 'COMMON401': // 인증이 필요합니다
            throw new AuthenticationError(apiError.code, '인증이 필요합니다.');
          case 'COMMON403': // 금지된 요청입니다
            throw new AuthenticationError(apiError.code, '금지된 요청입니다.');
          case 'COMMON500': // 서버 에러
            throw new AuthenticationError(
              apiError.code,
              '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
            );
          default:
            throw new AuthenticationError(
              apiError.code || 'EMAIL_SEND_FAILED',
              apiError.message ||
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

  // 이메일 인증 코드 확인 (비밀번호 재설정용)
  verifyResetCode: async (
    email: string,
    authNum: string,
    signal?: AbortSignal
  ): Promise<string> => {
    try {
      const response = await apiClient.post<ApiResponse<string>>(
        AUTH_CONSTANTS.ENDPOINTS.EMAIL_AUTH_CHECK,
        { email, authNum } as EmailVerificationData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          ...(signal && { signal }),
        }
      );

      // 백엔드에서 성공 시 UUID를 result에 반환
      if (!response.data.isSuccess || !response.data.result) {
        throw new AuthenticationError(
          response.data.code || 'EMAIL_VERIFICATION_FAILED',
          '인증번호가 올바르지 않습니다. 다시 확인해주세요.'
        );
      }

      return response.data.result; // UUID 반환
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
          case 'MAIL4000': // 인증번호를 입력해주세요 / 인증번호가 틀렸습니다
            throw new AuthenticationError(
              apiError.code,
              '인증번호가 올바르지 않습니다. 다시 확인해주세요.'
            );
          case 'COMMON400': // 잘못된 요청입니다
            throw new AuthenticationError(
              apiError.code,
              '잘못된 요청입니다. 입력 정보를 확인해주세요.'
            );
          case 'COMMON401': // 인증이 필요합니다
            throw new AuthenticationError(apiError.code, '인증이 필요합니다.');
          case 'COMMON403': // 금지된 요청입니다
            throw new AuthenticationError(apiError.code, '금지된 요청입니다.');
          case 'COMMON500': // 서버 에러
            throw new AuthenticationError(
              apiError.code,
              '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
            );
          default:
            throw new AuthenticationError(
              apiError.code || 'EMAIL_VERIFICATION_FAILED',
              apiError.message ||
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

  // 비밀번호 재설정 (API 문서에 맞게 수정)
  resetPassword: async (
    email: string,
    uuid: string,
    newPassword: string,
    signal?: AbortSignal
  ): Promise<void> => {
    try {
      const response = await apiClient.patch<ApiResponse<string>>(
        AUTH_CONSTANTS.ENDPOINTS.PASSWORD_RESET,
        { email, password: newPassword, uuid },
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
            throw new AuthenticationError(
              apiError.code,
              '해당 사용자를 찾을 수 없습니다.'
            );
          case 'COMMON400': // 잘못된 요청입니다
            throw new AuthenticationError(
              apiError.code,
              '잘못된 요청입니다. 입력 정보를 확인해주세요.'
            );
          case 'COMMON401': // 인증이 필요합니다
            throw new AuthenticationError(apiError.code, '인증이 필요합니다.');
          case 'COMMON403': // 금지된 요청입니다
            throw new AuthenticationError(apiError.code, '금지된 요청입니다.');
          case 'COMMON500': // 서버 에러
            throw new AuthenticationError(
              apiError.code,
              '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
            );
          default:
            throw new AuthenticationError(
              apiError.code || 'PASSWORD_RESET_FAILED',
              apiError.message ||
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
        AUTH_CONSTANTS.ENDPOINTS.EMAIL_SEND,
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess) {
        throw new AuthenticationError(
          response.data.code || 'EMAIL_SEND_FAILED',
          '이메일 발송에 실패했습니다. 다시 시도해주세요.'
        );
      }

      // 백엔드에서 성공 메시지를 반환하므로 result 대신 message 사용
      return response.data.message || '이메일이 발송되었습니다.';
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
            throw new AuthenticationError(
              apiError.code,
              '이메일 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
            );
          case 'COMMON400': // 잘못된 요청입니다
            throw new AuthenticationError(
              apiError.code,
              '잘못된 요청입니다. 이메일 주소를 확인해주세요.'
            );
          case 'COMMON401': // 인증이 필요합니다
            throw new AuthenticationError(apiError.code, '인증이 필요합니다.');
          case 'COMMON403': // 금지된 요청입니다
            throw new AuthenticationError(apiError.code, '금지된 요청입니다.');
          case 'COMMON500': // 서버 에러
            throw new AuthenticationError(
              apiError.code,
              '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
            );
          default:
            throw new AuthenticationError(
              apiError.code || 'EMAIL_SEND_FAILED',
              apiError.message ||
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
        AUTH_CONSTANTS.ENDPOINTS.EMAIL_AUTH_CHECK,
        { email, authNum } as EmailVerificationData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          ...(signal && { signal }),
        }
      );

      // 백엔드에서 성공 시 UUID를 result에 반환하므로 result 존재 여부로 성공 판단
      return response.data.isSuccess && !!response.data.result;
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
            throw new AuthenticationError(
              apiError.code,
              '인증번호가 올바르지 않습니다. 다시 확인해주세요.'
            );
          case 'COMMON400': // 잘못된 요청입니다
            throw new AuthenticationError(
              apiError.code,
              '잘못된 요청입니다. 입력 정보를 확인해주세요.'
            );
          case 'COMMON401': // 인증이 필요합니다
            throw new AuthenticationError(apiError.code, '인증이 필요합니다.');
          case 'COMMON403': // 금지된 요청입니다
            throw new AuthenticationError(apiError.code, '금지된 요청입니다.');
          case 'COMMON500': // 서버 에러
            throw new AuthenticationError(
              apiError.code,
              '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
            );
          default:
            throw new AuthenticationError(
              apiError.code || 'EMAIL_VERIFICATION_FAILED',
              apiError.message ||
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
        AUTH_CONSTANTS.ENDPOINTS.EMAIL_DUPLICATE_CHECK,
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
            throw new AuthenticationError(
              apiError.code,
              '이미 사용 중인 이메일입니다. 다른 이메일을 입력해주세요.'
            );
          case 'COMMON400': // 잘못된 요청입니다
            throw new AuthenticationError(
              apiError.code,
              '잘못된 요청입니다. 이메일 주소를 확인해주세요.'
            );
          case 'COMMON401': // 인증이 필요합니다
            throw new AuthenticationError(apiError.code, '인증이 필요합니다.');
          case 'COMMON403': // 금지된 요청입니다
            throw new AuthenticationError(apiError.code, '금지된 요청입니다.');
          case 'COMMON500': // 서버 에러
            throw new AuthenticationError(
              apiError.code,
              '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
            );
          default:
            throw new AuthenticationError(
              apiError.code || 'EMAIL_CHECK_FAILED',
              apiError.message ||
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
      const response = await apiClient.post<ApiResponse<string>>(
        `${AUTH_CONSTANTS.ENDPOINTS.NICKNAME_DUPLICATE_CHECK}?nickname=${encodeURIComponent(nickname)}`,
        null,
        {
          ...(signal && { signal }),
          headers: {
            'Content-Type': 'application/json',
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
            throw new AuthenticationError(
              apiError.code,
              '사용중인 닉네임입니다.'
            );
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
        AUTH_CONSTANTS.ENDPOINTS.MY_INFO,
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
        AUTH_CONSTANTS.ENDPOINTS.MY_NICKNAME,
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
    console.log('🔐 authService.logout() 호출됨');

    // 모든 가능한 토큰 키에서 삭제 (안전성 확보)
    localStorage.removeItem(AUTH_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // 추가적인 인증 관련 데이터도 정리
    localStorage.removeItem('auth-storage');
    sessionStorage.clear(); // 세션 스토리지도 정리

    console.log('🧹 토큰 삭제 완료');
    console.log('📦 localStorage 상태:', {
      accessToken: localStorage.getItem(
        AUTH_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN
      ),
      refreshToken: localStorage.getItem(
        AUTH_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN
      ),
      accessTokenAlt: localStorage.getItem('accessToken'),
      refreshTokenAlt: localStorage.getItem('refreshToken'),
      authStorage: localStorage.getItem('auth-storage'),
    });
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

  // 마이페이지 비밀번호 재설정
  updateMyPassword: async (
    newPassword: string,
    signal?: AbortSignal
  ): Promise<string> => {
    try {
      const response = await apiClient.patch<ApiResponse<string>>(
        `${AUTH_CONSTANTS.ENDPOINTS.MY_PASSWORD_UPDATE}?password=${encodeURIComponent(newPassword)}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess || !response.data.result) {
        throw new AuthenticationError(
          response.data.code || 'PASSWORD_UPDATE_FAILED',
          '비밀번호 변경에 실패했습니다. 다시 시도해주세요.'
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

      // API 에러 처리
      if (axiosError.response?.data) {
        const apiError = axiosError.response.data;
        switch (apiError.code) {
          case 'USER4002': // 해당 유저가 없습니다
          case 'COMMON400': // 잘못된 요청입니다
          case 'COMMON401': // 인증이 필요합니다
          case 'COMMON403': // 금지된 요청입니다
          case 'COMMON500': // 서버 에러
          default:
            throw new AuthenticationError(
              apiError.code || 'PASSWORD_UPDATE_FAILED',
              '비밀번호 변경에 실패했습니다. 다시 시도해주세요.'
            );
        }
      }

      throw new AuthenticationError(
        'PASSWORD_UPDATE_FAILED',
        '비밀번호 변경에 실패했습니다. 다시 시도해주세요.'
      );
    }
  },

  // 마이페이지 닉네임 재설정
  updateMyNickname: async (
    newNickname: string,
    signal?: AbortSignal
  ): Promise<string> => {
    try {
      const response = await apiClient.patch<ApiResponse<string>>(
        `${AUTH_CONSTANTS.ENDPOINTS.MY_NICKNAME_UPDATE}?nickname=${encodeURIComponent(newNickname)}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess || !response.data.result) {
        throw new AuthenticationError(
          response.data.code || 'NICKNAME_UPDATE_FAILED',
          '닉네임 변경에 실패했습니다. 다시 시도해주세요.'
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

      // API 에러 처리
      if (axiosError.response?.data) {
        const apiError = axiosError.response.data;
        switch (apiError.code) {
          case 'USER4001': // 사용중인 닉네임 입니다
          case 'USER4002': // 해당 유저가 없습니다
          case 'COMMON400': // 잘못된 요청입니다
          case 'COMMON401': // 인증이 필요합니다
          case 'COMMON403': // 금지된 요청입니다
          case 'COMMON500': // 서버 에러
          default:
            throw new AuthenticationError(
              apiError.code || 'NICKNAME_UPDATE_FAILED',
              '닉네임 변경에 실패했습니다. 다시 시도해주세요.'
            );
        }
      }

      throw new AuthenticationError(
        'NICKNAME_UPDATE_FAILED',
        '닉네임 변경에 실패했습니다. 다시 시도해주세요.'
      );
    }
  },
};
