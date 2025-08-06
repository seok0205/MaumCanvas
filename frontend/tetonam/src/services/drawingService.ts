import {
  DRAWING_CONFIG,
  DRAWING_ENDPOINTS,
  DRAWING_ERROR_CODES,
} from '@/constants/drawing';
import type { ApiResponse } from '@/types/api';
import { AuthenticationError } from '@/types/auth';
import type {
  CounselingImagesResponse,
  CounselingRagRequest,
  CounselingRagResponse,
  CreateDrawingResponse,
  HTPImageFiles,
  RecentDrawingsResponse,
} from '@/types/drawing';
import type { AxiosError } from 'axios';
import { apiClient } from './apiClient';

// Drawing 관련 API 서비스
export const drawingService = {
  // HTP 검사 이미지 업로드 (4장의 그림 저장)
  createDrawing: async (
    files: HTPImageFiles,
    signal?: AbortSignal
  ): Promise<CreateDrawingResponse> => {
    try {
      const formData = new FormData();
      formData.append('homeImageUrl', files.homeImageUrl);
      formData.append('treeImageUrl', files.treeImageUrl);
      formData.append('humanImageFirstUrl', files.humanImageFirstUrl);
      formData.append('humanImageSecondUrl', files.humanImageSecondUrl);

      const response = await apiClient.post<ApiResponse<CreateDrawingResponse>>(
        DRAWING_ENDPOINTS.CREATE_DRAWING,
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
          response.data.code || DRAWING_ERROR_CODES.DRAWING_UPLOAD_FAILED,
          '그림 업로드에 실패했습니다. 다시 시도해주세요.'
        );
      }

      return response.data.result;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;

      if (axiosError.response?.data) {
        throw new AuthenticationError(
          axiosError.response.data.code ||
            DRAWING_ERROR_CODES.DRAWING_UPLOAD_ERROR,
          axiosError.response.data.message ||
            '그림 업로드 중 오류가 발생했습니다.'
        );
      }

      throw new AuthenticationError(
        DRAWING_ERROR_CODES.NETWORK_ERROR,
        '네트워크 오류가 발생했습니다. 다시 시도해주세요.'
      );
    }
  },

  // 최근 그림 조회
  getRecentImages: async (
    signal?: AbortSignal
  ): Promise<RecentDrawingsResponse> => {
    try {
      const response = await apiClient.get<ApiResponse<RecentDrawingsResponse>>(
        DRAWING_ENDPOINTS.RECENT_IMAGES,
        {
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess || !response.data.result) {
        throw new AuthenticationError(
          response.data.code || DRAWING_ERROR_CODES.RECENT_IMAGES_FETCH_FAILED,
          '최근 그림을 불러오는데 실패했습니다.'
        );
      }

      return response.data.result;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;

      if (axiosError.response?.data) {
        throw new AuthenticationError(
          axiosError.response.data.code ||
            DRAWING_ERROR_CODES.RECENT_IMAGES_FETCH_ERROR,
          axiosError.response.data.message ||
            '최근 그림을 불러오는 중 오류가 발생했습니다.'
        );
      }

      throw new AuthenticationError(
        DRAWING_ERROR_CODES.NETWORK_ERROR,
        '네트워크 오류가 발생했습니다. 다시 시도해주세요.'
      );
    }
  },

  // 상담의 그림 조회
  getCounselingImages: async (
    counselingId: number,
    signal?: AbortSignal
  ): Promise<CounselingImagesResponse> => {
    try {
      const response = await apiClient.get<
        ApiResponse<CounselingImagesResponse>
      >(`${DRAWING_ENDPOINTS.COUNSELING_IMAGES}/${counselingId}`, {
        ...(signal && { signal }),
      });

      if (!response.data.isSuccess || !response.data.result) {
        throw new AuthenticationError(
          response.data.code ||
            DRAWING_ERROR_CODES.COUNSELING_IMAGES_FETCH_FAILED,
          '상담 그림을 불러오는데 실패했습니다.'
        );
      }

      return response.data.result;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;

      if (axiosError.response?.data) {
        throw new AuthenticationError(
          axiosError.response.data.code ||
            DRAWING_ERROR_CODES.COUNSELING_IMAGES_FETCH_ERROR,
          axiosError.response.data.message ||
            '상담 그림을 불러오는 중 오류가 발생했습니다.'
        );
      }

      throw new AuthenticationError(
        DRAWING_ERROR_CODES.NETWORK_ERROR,
        '네트워크 오류가 발생했습니다. 다시 시도해주세요.'
      );
    }
  },

  // 상담사의 코멘트 RAG 저장
  saveCounselingRag: async (
    counselingId: number,
    request: CounselingRagRequest,
    signal?: AbortSignal
  ): Promise<CounselingRagResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<CounselingRagResponse>>(
        `${DRAWING_ENDPOINTS.COUNSELING_RAG}/${counselingId}`,
        request,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess || !response.data.result) {
        throw new AuthenticationError(
          response.data.code || DRAWING_ERROR_CODES.COUNSELING_RAG_SAVE_FAILED,
          '상담사 코멘트 저장에 실패했습니다.'
        );
      }

      return response.data.result;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;

      if (axiosError.response?.data) {
        throw new AuthenticationError(
          axiosError.response.data.code ||
            DRAWING_ERROR_CODES.COUNSELING_RAG_SAVE_ERROR,
          axiosError.response.data.message ||
            '상담사 코멘트 저장 중 오류가 발생했습니다.'
        );
      }

      throw new AuthenticationError(
        DRAWING_ERROR_CODES.NETWORK_ERROR,
        '네트워크 오류가 발생했습니다. 다시 시도해주세요.'
      );
    }
  },

  // 파일 유효성 검사
  validateImageFile: (file: File): boolean => {
    // 파일 크기 검사
    if (file.size > DRAWING_CONFIG.MAX_FILE_SIZE) {
      throw new AuthenticationError(
        DRAWING_ERROR_CODES.FILE_TOO_LARGE,
        '파일 크기가 10MB를 초과합니다.'
      );
    }

    // 파일 타입 검사
    if (!DRAWING_CONFIG.ALLOWED_FILE_TYPES.includes(file.type as any)) {
      throw new AuthenticationError(
        DRAWING_ERROR_CODES.INVALID_FILE_TYPE,
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
            DRAWING_ERROR_CODES.MISSING_FILE,
            '모든 이미지 파일을 선택해주세요.'
          );
        }
        drawingService.validateImageFile(file);
      });
      return true;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError(
        DRAWING_ERROR_CODES.VALIDATION_FAILED,
        '파일 검증에 실패했습니다.'
      );
    }
  },
};
