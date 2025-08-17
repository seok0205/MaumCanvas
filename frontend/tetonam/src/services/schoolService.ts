import type {
  School,
  SchoolSearchError,
  SchoolSearchResponse,
} from '@/types/school';
import { apiClient } from './apiClient';

export const schoolService = {
  getSchoolList: async (): Promise<School[]> => {
    try {
      const response =
        await apiClient.get<SchoolSearchResponse>('/api/user/school-list');

      // API 응답 검증
      if (!response.data.isSuccess) {
        throw new Error(
          response.data.message || '학교 목록을 불러오는데 실패했습니다.'
        );
      }

      return response.data.result;
    } catch (error) {
      console.error('학교 목록 조회 실패:', error);
      throw new Error('학교 목록을 불러오는데 실패했습니다.');
    }
  },

  searchSchool: async (name: string): Promise<School[]> => {
    try {
      const response = await apiClient.get<SchoolSearchResponse>(
        `/api/user/school/${encodeURIComponent(name)}`
      );

      // HTTP 상태 코드 확인
      if (response.status !== 200) {
        throw new Error('학교 검색에 실패했습니다.');
      }

      // API 응답 검증
      if (!response.data.isSuccess) {
        const error: SchoolSearchError = {
          code: response.data.code,
          message: response.data.message || '학교 검색에 실패했습니다.',
          originalError: response.data,
        };
        throw error;
      }

      return response.data.result;
    } catch (error) {
      console.error('학교 검색 실패:', error);

      // 이미 SchoolSearchError인 경우 그대로 던지기
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }

      // 일반적인 에러인 경우 SchoolSearchError로 변환
      const searchError: SchoolSearchError = {
        code: 'UNKNOWN_ERROR',
        message: '학교 검색에 실패했습니다.',
        originalError: error,
      };
      throw searchError;
    }
  },
};
