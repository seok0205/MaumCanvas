import type { ApiResponse, ApiResult } from '@/types/api';
import { AuthenticationError } from '@/types/auth';
import type { AxiosError } from 'axios';
import { apiClient } from './apiClient';

// HTP 검사 이미지 업로드 타입
export interface HTPImageFiles {
  homeImageUrl: File;
  treeImageUrl: File;
  humanImageFirstUrl: File;
  humanImageSecondUrl: File;
}

// const BASE_URL = 'https://i13e108.p.ssafy.io';

// 이미지 관련 API 엔드포인트
const IMAGE_ENDPOINTS = {
  UPLOAD_HTP_IMAGES: '/api/image',
  // 상담 상세에서 그림 목록
  GET_COUNSELING_IMAGES: (counselingId: number | string) =>
    `/api/image/counseling/${counselingId}`,
  // 그림 상세: AI 객체탐지 결과
  GET_AI_RESULT: (drawingId: number | string) =>
    `/api/image/counseling/ai/${drawingId}`,
  // 그림 상세: RAG 결과 조회/제출
  GET_RAG_RESULT: (drawingId: number | string) =>
    `/api/image/counseling/rag/${drawingId}`,
  POST_RAG_PROMPT: (drawingId: number | string) =>
    `/api/image/counseling/rag/${drawingId}`,
  // UPLOAD_HTP_IMAGES: `${BASE_URL}/api/image`,
} as const;

// 이미지 업로드 관련 API 서비스
export const imageService = {
  // HTP 검사 이미지 업로드
  uploadHTPImages: async (
    files: HTPImageFiles,
    signal?: AbortSignal
  ): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('homeImageUrl', files.homeImageUrl);
      formData.append('treeImageUrl', files.treeImageUrl);
      formData.append('humanImageFirstUrl', files.humanImageFirstUrl);
      formData.append('humanImageSecondUrl', files.humanImageSecondUrl);

      const response = await apiClient.post<ApiResponse<string>>(
        IMAGE_ENDPOINTS.UPLOAD_HTP_IMAGES,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess || !response.data.result) {
        throw new AuthenticationError(
          response.data.code || 'IMAGE_UPLOAD_FAILED',
          '이미지 업로드에 실패했습니다. 다시 시도해주세요.'
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
          case 'IMAGE4000': // 잘못된 형식의 파일 입니다
          case 'IMAGE5000': // 이미지를 저장할 수 없습니다 (S3 에러)
          case 'COMMON400': // 잘못된 요청입니다
          case 'COMMON401': // 인증이 필요합니다
          case 'COMMON403': // 금지된 요청입니다
          case 'COMMON500': // 서버 에러
          default:
            throw new AuthenticationError(
              apiError.code || 'IMAGE_UPLOAD_FAILED',
              '이미지 업로드에 실패했습니다. 다시 시도해주세요.'
            );
        }
      }

      throw new AuthenticationError(
        'IMAGE_UPLOAD_FAILED',
        '이미지 업로드에 실패했습니다. 다시 시도해주세요.'
      );
    }
  },

  // 상담의 그림 목록 조회
  getCounselingImages: async (
    counselingId: number | string,
    signal?: AbortSignal
  ): Promise<Array<{ id: number; category: string; imageUrl: string }>> => {
    try {
      const response = await apiClient.get<
        ApiResponse<Array<{ id: number; category: string; imageUrl: string }>>
      >(IMAGE_ENDPOINTS.GET_COUNSELING_IMAGES(counselingId), {
        ...(signal && { signal }),
      });
      if (!response.data.isSuccess || !response.data.result) return [];
      return response.data.result;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      if (axiosError.response?.status === 401) {
        throw new AuthenticationError('UNAUTHORIZED', '로그인이 필요합니다.');
      }
      return [];
    }
  },

  // 객체탐지 결과 조회
  getAiDetectionText: async (
    drawingId: number | string,
    signal?: AbortSignal
  ): Promise<string> => {
    const response = await apiClient.get<ApiResponse<string>>(
      IMAGE_ENDPOINTS.GET_AI_RESULT(drawingId),
      {
        ...(signal && { signal }),
      }
    );
    if (!response.data.isSuccess) {
      throw new AuthenticationError(
        'AI_RESULT_FETCH_FAILED',
        'AI 결과 조회 실패'
      );
    }
    return response.data.result ?? '';
  },

  // RAG 결과 조회
  getRagResult: async (
    drawingId: number | string,
    signal?: AbortSignal
  ): Promise<ApiResult<string>> => {
    try {
      const response = await apiClient.get<ApiResponse<string>>(
        IMAGE_ENDPOINTS.GET_RAG_RESULT(drawingId),
        {
          ...(signal && { signal }),
        }
      );
      if (!response.data.isSuccess) {
        // 백엔드 에러 코드가 DRAWING5001인 경우 RAG_NOT_READY로 처리
        if (response.data.code === 'DRAWING5001') {
          return { data: null, error: 'RAG_NOT_READY' };
        }
        return { data: null, error: 'NOT_FOUND' };
      }
      return { data: response.data.result || null };
    } catch (error) {
      // 개발 환경에서 에러 로깅
      if (import.meta.env.DEV) {
        console.error('RAG 결과 조회 중 에러 발생:', error);
      }

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosError<ApiResponse<null>>;
        
        // 응답에 구체적인 에러 코드가 있는 경우 먼저 확인
        if (axiosError.response?.data?.code === 'DRAWING5001') {
          return { data: null, error: 'RAG_NOT_READY' };
        }
        
        if (
          axiosError.response?.status === 401 ||
          axiosError.response?.status === 403
        ) {
          return { data: null, error: 'UNAUTHORIZED' };
        }
        if (axiosError.response?.status === 404) {
          return { data: null, error: 'NOT_FOUND' };
        }
      }
      if (signal?.aborted) {
        throw new AuthenticationError('ABORTED', '요청이 취소되었습니다.');
      }
      return { data: null, error: 'NETWORK' };
    }
  },

  // RAG 프롬프트 제출
  submitRagPrompt: async (
    drawingId: number | string,
    prompt: string
  ): Promise<string> => {
    const response = await apiClient.post<ApiResponse<string>>(
      IMAGE_ENDPOINTS.POST_RAG_PROMPT(drawingId),
      { comment: prompt }
    );
    if (!response.data.isSuccess) {
      throw new AuthenticationError('RAG_SUBMIT_FAILED', '프롬프트 제출 실패');
    }
    return response.data.result ?? '저장되었습니다.';
  },

  // 특정 drawing의 정보를 가져오기 (임시 해결책)
  // 실제로는 백엔드에서 GET /api/image/drawing/{id} API가 필요함
  getDrawingInfo: async (
    drawingId: number | string
  ): Promise<{ id: number; category: string; imageUrl: string } | null> => {
    // 현재 백엔드 API 구조상 drawing ID만으로는 이미지 정보를 직접 가져올 수 없음
    // 이는 백엔드에서 새로운 API가 필요한 상황
    // 임시로 null을 반환하되, 추후 백엔드 API 추가 시 구현 예정

    console.warn(
      `DrawingID ${drawingId}에 대한 이미지 정보를 가져올 수 없습니다. ` +
        '백엔드에서 GET /api/image/drawing/{id} API 구현이 필요합니다.'
    );

    return null;
  },

  // 파일 유효성 검사
  validateImageFile: (file: File): boolean => {
    // 파일 크기 검사 (10MB 제한)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new AuthenticationError(
        'FILE_TOO_LARGE',
        '파일 크기가 10MB를 초과합니다.'
      );
    }

    // 파일 타입 검사
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new AuthenticationError(
        'INVALID_FILE_TYPE',
        '지원하지 않는 파일 형식입니다. (JPEG, PNG, GIF만 지원)'
      );
    }

    return true;
  },

  // HTP 이미지 파일들 유효성 검사
  validateHTPImages: (files: HTPImageFiles): boolean => {
    try {
      Object.values(files).forEach(file => {
        if (!file) {
          throw new AuthenticationError(
            'MISSING_FILE',
            '모든 이미지 파일을 선택해주세요.'
          );
        }
        imageService.validateImageFile(file);
      });
      return true;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError(
        'VALIDATION_FAILED',
        '파일 검증에 실패했습니다.'
      );
    }
  },
};
