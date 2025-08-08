import type { ApiResponse, MainMyInfoResponse } from '@/types/api';
import { AuthenticationError } from '@/types/auth';
import type { AxiosError } from 'axios';
import { apiClient } from './apiClient';

// 사용자 관련 API 엔드포인트
const USER_ENDPOINTS = {
  GET_HOME_MY_INFO: '/api/user/home-my-info',
} as const;

// 사용자 관련 API 서비스
export const userService = {
  // 메인 화면 사용자 정보 조회 (이름과 닉네임)
  getHomeMyInfo: async (signal?: AbortSignal): Promise<MainMyInfoResponse> => {
    try {
      const response = await apiClient.get<ApiResponse<MainMyInfoResponse>>(
        USER_ENDPOINTS.GET_HOME_MY_INFO,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess || !response.data.result) {
        throw new AuthenticationError(
          response.data.code || 'USER_HOME_INFO_FAILED',
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
              apiError.code || 'USER_HOME_INFO_FAILED',
              '사용자 정보 조회에 실패했습니다. 다시 시도해주세요.'
            );
        }
      }

      throw new AuthenticationError(
        'USER_HOME_INFO_FAILED',
        '사용자 정보 조회에 실패했습니다. 다시 시도해주세요.'
      );
    }
  },
};
