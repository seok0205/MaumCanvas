import type { ApiResponse } from '@/types/api';
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
