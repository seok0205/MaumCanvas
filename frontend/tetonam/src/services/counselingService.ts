import type {
  ApiResponse,
  CounselingHistory,
  CounselingReservationRequest,
  CounselorInfo,
  UpcomingCounseling,
} from '@/types/api';
import { AuthenticationError } from '@/types/auth';
import {
  handleApiError,
  handleHttpError,
  handleNetworkError,
} from '@/utils/errorHandler';
import type { AxiosError } from 'axios';
import { apiClient } from './apiClient';

// 상담 관련 API 엔드포인트
const COUNSELING_ENDPOINTS = {
  GET_AVAILABLE_COUNSELORS: '/api/counseling',
  RESERVE_COUNSELING: '/api/counseling',
  GET_MY_COUNSELING: '/api/counseling/my-counseling',
  GET_RECENT_COUNSELING: '/api/counseling/my-counseling-recent',
  GET_UPCOMING_COUNSELING: '/api/counseling/my-counseling-recent',
} as const;

// 상담 관련 API 서비스
export const counselingService = {
  // 가능한 상담사 조회
  getAvailableCounselors: async (
    time: string,
    signal?: AbortSignal
  ): Promise<CounselorInfo[]> => {
    try {
      const response = await apiClient.get<ApiResponse<CounselorInfo[]>>(
        `${COUNSELING_ENDPOINTS.GET_AVAILABLE_COUNSELORS}?time=${encodeURIComponent(time)}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess || !response.data.result) {
        throw new AuthenticationError(
          response.data.code || 'COUNSELOR_FETCH_FAILED',
          '상담사 조회에 실패했습니다. 다시 시도해주세요.'
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
        throw handleNetworkError(axiosError);
      }

      // HTTP 상태 코드 기반 에러 처리
      if (axiosError.response?.status) {
        throw handleHttpError(axiosError.response.status);
      }

      // API 에러 처리
      if (axiosError.response?.data) {
        throw handleApiError(axiosError.response.data);
      }

      throw new AuthenticationError(
        'COUNSELOR_FETCH_FAILED',
        '상담사 조회에 실패했습니다. 다시 시도해주세요.'
      );
    }
  },

  // 상담 예약
  reserveCounseling: async (
    data: CounselingReservationRequest,
    signal?: AbortSignal
  ): Promise<string> => {
    try {
      const response = await apiClient.post<ApiResponse<string>>(
        COUNSELING_ENDPOINTS.RESERVE_COUNSELING,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess || !response.data.result) {
        throw new AuthenticationError(
          response.data.code || 'COUNSELING_RESERVE_FAILED',
          '상담 예약에 실패했습니다. 다시 시도해주세요.'
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
        throw handleNetworkError(axiosError);
      }

      // HTTP 상태 코드 기반 에러 처리
      if (axiosError.response?.status) {
        throw handleHttpError(axiosError.response.status);
      }

      // 🚨 상담 예약 특화 에러 처리
      if (axiosError.response?.data) {
        const apiError = axiosError.response.data;

        // 그림 그리기 미완료 에러 특별 처리
        if (apiError.code === 'STUDENT_HAVE_NOT_IMAGE') {
          throw new AuthenticationError(
            'DRAWING_REQUIRED',
            '상담 예약을 위해 그림 그리기를 먼저 완료해주세요.'
          );
        }

        // 기타 상담 관련 에러 처리
        if (apiError.code === 'ALREADY_RESERVED') {
          throw new AuthenticationError(
            'TIME_ALREADY_RESERVED',
            '선택한 시간에 이미 예약이 있습니다. 다른 시간을 선택해주세요.'
          );
        }

        throw handleApiError(axiosError.response.data);
      }

      throw new AuthenticationError(
        'COUNSELING_RESERVE_FAILED',
        '상담 예약에 실패했습니다. 다시 시도해주세요.'
      );
    }
  },

  // 내 상담 내역 조회
  getMyCounselingHistory: async (
    signal?: AbortSignal
  ): Promise<CounselingHistory[]> => {
    try {
      const response = await apiClient.get<ApiResponse<CounselingHistory[]>>(
        COUNSELING_ENDPOINTS.GET_MY_COUNSELING,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess || !response.data.result) {
        throw new AuthenticationError(
          response.data.code || 'COUNSELING_HISTORY_FETCH_FAILED',
          '상담 내역 조회에 실패했습니다. 다시 시도해주세요.'
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
          case 'COUNSELING4001': // 상담예약이 없습니다
          case 'COMMON400': // 잘못된 요청입니다
          case 'COMMON401': // 인증이 필요합니다
          case 'COMMON403': // 금지된 요청입니다
          case 'COMMON500': // 서버 에러
          default:
            throw new AuthenticationError(
              apiError.code || 'COUNSELING_HISTORY_FETCH_FAILED',
              '상담 내역 조회에 실패했습니다. 다시 시도해주세요.'
            );
        }
      }

      throw new AuthenticationError(
        'COUNSELING_HISTORY_FETCH_FAILED',
        '상담 내역 조회에 실패했습니다. 다시 시도해주세요.'
      );
    }
  },

  // 최근 상담 내역 조회
  getRecentCounseling: async (
    signal?: AbortSignal
  ): Promise<CounselingHistory | null> => {
    try {
      const response = await apiClient.get<ApiResponse<CounselingHistory>>(
        COUNSELING_ENDPOINTS.GET_RECENT_COUNSELING,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess) {
        throw new AuthenticationError(
          response.data.code || 'RECENT_COUNSELING_FETCH_FAILED',
          '최근 상담 내역 조회에 실패했습니다. 다시 시도해주세요.'
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
          case 'COUNSELING4001': // 상담예약이 없습니다
          case 'COMMON400': // 잘못된 요청입니다
          case 'COMMON401': // 인증이 필요합니다
          case 'COMMON403': // 금지된 요청입니다
          case 'COMMON500': // 서버 에러
          default:
            throw new AuthenticationError(
              apiError.code || 'RECENT_COUNSELING_FETCH_FAILED',
              '최근 상담 내역 조회에 실패했습니다. 다시 시도해주세요.'
            );
        }
      }

      throw new AuthenticationError(
        'RECENT_COUNSELING_FETCH_FAILED',
        '최근 상담 내역 조회에 실패했습니다. 다시 시도해주세요.'
      );
    }
  },

  // 다가오는 상담 조회 (my-counseling-recent API)
  getUpcomingCounseling: async (
    signal?: AbortSignal
  ): Promise<UpcomingCounseling | null> => {
    try {
      const response = await apiClient.get<ApiResponse<UpcomingCounseling>>(
        COUNSELING_ENDPOINTS.GET_UPCOMING_COUNSELING,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess) {
        // 상담예약이 없는 경우는 null을 반환 (에러가 아님)
        if (response.data.code === 'COUNSELING4001') {
          return null;
        }
        throw new AuthenticationError(
          response.data.code || 'UPCOMING_COUNSELING_FETCH_FAILED',
          '다가오는 상담 조회에 실패했습니다. 다시 시도해주세요.'
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
          case 'COUNSELING4001': // 상담예약이 없습니다
            return null; // 상담예약이 없는 경우는 null 반환
          case 'COMMON400': // 잘못된 요청입니다
          case 'COMMON401': // 인증이 필요합니다
          case 'COMMON403': // 금지된 요청입니다
          case 'COMMON500': // 서버 에러
          default:
            throw new AuthenticationError(
              apiError.code || 'UPCOMING_COUNSELING_FETCH_FAILED',
              '다가오는 상담 조회에 실패했습니다. 다시 시도해주세요.'
            );
        }
      }

      throw new AuthenticationError(
        'UPCOMING_COUNSELING_FETCH_FAILED',
        '다가오는 상담 조회에 실패했습니다. 다시 시도해주세요.'
      );
    }
  },
};
