import type { ApiResponse } from '@/types/api';
import { AuthenticationError } from '@/types/auth';
import type { AxiosError } from 'axios';
import { apiClient } from './apiClient';

// 설문 결과 타입
export interface QuestionnaireResult {
  category: string;
  score: number;
  createdDate?: string;
}

// 설문 관련 API 엔드포인트
const QUESTIONNAIRE_ENDPOINTS = {
  CREATE_RESULT: '/api/mind/questionnaire',
  GET_ALL_RESULTS: '/api/mind/questionnaire',
  GET_RESULTS_BY_CATEGORY: '/api/mind/questionnaire',
} as const;

// 진단/설문 관련 API 서비스
export const questionnaireService = {
  // 설문 결과 생성
  createQuestionnaireResult: async (
    score: number,
    category: string,
    signal?: AbortSignal
  ): Promise<string> => {
    try {
      const response = await apiClient.post<ApiResponse<string>>(
        `${QUESTIONNAIRE_ENDPOINTS.CREATE_RESULT}?score=${score}&category=${encodeURIComponent(category)}`,
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
          response.data.code || 'QUESTIONNAIRE_CREATE_FAILED',
          '설문 결과 저장에 실패했습니다. 다시 시도해주세요.'
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
          case 'COMMON400': // 잘못된 요청입니다
          case 'COMMON401': // 인증이 필요합니다
          case 'COMMON403': // 금지된 요청입니다
          case 'COMMON500': // 서버 에러
          default:
            throw new AuthenticationError(
              apiError.code || 'QUESTIONNAIRE_CREATE_FAILED',
              '설문 결과 저장에 실패했습니다. 다시 시도해주세요.'
            );
        }
      }

      throw new AuthenticationError(
        'QUESTIONNAIRE_CREATE_FAILED',
        '설문 결과 저장에 실패했습니다. 다시 시도해주세요.'
      );
    }
  },

  // 전체 설문 결과 조회
  getAllQuestionnaireResults: async (
    signal?: AbortSignal
  ): Promise<QuestionnaireResult[]> => {
    try {
      const response = await apiClient.get<ApiResponse<QuestionnaireResult[]>>(
        QUESTIONNAIRE_ENDPOINTS.GET_ALL_RESULTS,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess || !response.data.result) {
        throw new AuthenticationError(
          response.data.code || 'QUESTIONNAIRE_FETCH_FAILED',
          '설문 결과 조회에 실패했습니다. 다시 시도해주세요.'
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
          case 'COMMON400': // 잘못된 요청입니다
          case 'COMMON401': // 인증이 필요합니다
          case 'COMMON403': // 금지된 요청입니다
          case 'COMMON500': // 서버 에러
          default:
            throw new AuthenticationError(
              apiError.code || 'QUESTIONNAIRE_FETCH_FAILED',
              '설문 결과 조회에 실패했습니다. 다시 시도해주세요.'
            );
        }
      }

      throw new AuthenticationError(
        'QUESTIONNAIRE_FETCH_FAILED',
        '설문 결과 조회에 실패했습니다. 다시 시도해주세요.'
      );
    }
  },

  // 카테고리별 설문 결과 조회
  getQuestionnaireResultsByCategory: async (
    category: string,
    signal?: AbortSignal
  ): Promise<QuestionnaireResult[]> => {
    try {
      const response = await apiClient.get<ApiResponse<QuestionnaireResult[]>>(
        `${QUESTIONNAIRE_ENDPOINTS.GET_RESULTS_BY_CATEGORY}/${encodeURIComponent(category)}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess || !response.data.result) {
        throw new AuthenticationError(
          response.data.code || 'QUESTIONNAIRE_CATEGORY_FETCH_FAILED',
          '카테고리별 설문 결과 조회에 실패했습니다. 다시 시도해주세요.'
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
          case 'COMMON400': // 잘못된 요청입니다
          case 'COMMON401': // 인증이 필요합니다
          case 'COMMON403': // 금지된 요청입니다
          case 'COMMON500': // 서버 에러
          default:
            throw new AuthenticationError(
              apiError.code || 'QUESTIONNAIRE_CATEGORY_FETCH_FAILED',
              '카테고리별 설문 결과 조회에 실패했습니다. 다시 시도해주세요.'
            );
        }
      }

      throw new AuthenticationError(
        'QUESTIONNAIRE_CATEGORY_FETCH_FAILED',
        '카테고리별 설문 결과 조회에 실패했습니다. 다시 시도해주세요.'
      );
    }
  },
};
