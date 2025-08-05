import type { School, SchoolSearchResponse } from '@/types/school';
import { apiClient } from './apiClient';

export const schoolService = {
  getSchoolList: async (): Promise<School[]> => {
    try {
      const response =
        await apiClient.get<SchoolSearchResponse>('/user/school-list');
      return response.data.result;
    } catch (error) {
      console.error('학교 목록 조회 실패:', error);
      throw new Error('학교 목록을 불러오는데 실패했습니다.');
    }
  },

  searchSchool: async (name: string): Promise<School[]> => {
    try {
      const response = await apiClient.get<SchoolSearchResponse>(
        `/user/school/${encodeURIComponent(name)}`
      );
      return response.data.result;
    } catch (error) {
      console.error('학교 검색 실패:', error);
      throw new Error('학교 검색에 실패했습니다.');
    }
  },
};
