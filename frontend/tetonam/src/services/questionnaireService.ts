import {
  getQuestionnaireCategory,
  getQuestionnaireResultLevel,
  getCategoryKoreanName, // ✅ 새로운 매핑 함수 import
} from '@/constants/questionnaire';
import type { QuestionnaireCategory, QuestionnaireResult } from '@/types/api';
import type { QuestionnaireSubmission } from '@/types/questionnaire';
import { apiClient } from './apiClient';

// 백엔드 DTO와 일치하는 타입 정의
interface ShowAllQuestionnaireDto {
  category: QuestionnaireCategory;
  score: string;
}

interface ShowCategoryQuestionnaireDto {
  category: QuestionnaireCategory;
  score: string;
  createdDate: string; // LocalDateTime은 ISO string으로 전송됨
}

interface QuestionnaireApiResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: string | null;
}

// 카테고리별 결과 타입 정의
type CategoryResults = Record<QuestionnaireCategory, QuestionnaireResult[]>;

const submitQuestionnaire = async (
  submission: QuestionnaireSubmission
): Promise<QuestionnaireApiResponse> => {
  try {
    // ✅ 영어 카테고리 ID를 한글로 변환 (백엔드 Category enum에 맞춤)
    const koreanCategory = getCategoryKoreanName(submission.category);
    
    // ✅ 디버깅용 로그
    console.log('설문 제출 데이터:', {
      originalCategory: submission.category,
      koreanCategory,
      score: submission.score
    });
    
    // ✅ 백엔드 API 스펙에 맞게 query parameter 방식으로 전송
    // ✅ 백엔드에서 body를 받지 않으므로 null을 명시적으로 전달
    const response = await apiClient.post<QuestionnaireApiResponse>(
      `/api/mind/questionnaire?score=${submission.score}&category=${encodeURIComponent(koreanCategory)}`,
      null // ✅ body를 null로 명시적 설정
    );

    return response.data;
  } catch (error: any) {
    console.error('설문지 제출 실패:', error);

    // 에러 유형별 상세 처리
    if (error.response?.status === 400) {
      throw new Error('잘못된 요청입니다. 설문 데이터를 확인해주세요.');
    } else if (error.response?.status === 401) {
      throw new Error('로그인이 필요합니다.');
    } else if (error.response?.status === 403) {
      throw new Error('접근 권한이 없습니다.');
    } else if (error.response?.status >= 500) {
      throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      throw new Error('설문지 제출에 실패했습니다.');
    }
  }
};

const calculateQuestionnaireResult = (
  submission: QuestionnaireSubmission
): QuestionnaireResult => {
  const category = getQuestionnaireCategory(submission.category);
  if (!category) {
    throw new Error('유효하지 않은 설문지 카테고리입니다.');
  }

  const level = getQuestionnaireResultLevel(category, submission.score);
  if (!level) {
    throw new Error('결과 수준을 계산할 수 없습니다.');
  }

  return {
    category: submission.category,
    score: submission.score,
    createdDate: new Date().toISOString(),
  };
};

const submitQuestionnaireAndGetResult = async (
  submission: QuestionnaireSubmission
): Promise<QuestionnaireResult> => {
  try {
    // API로 결과 제출
    await submitQuestionnaire(submission);

    // 로컬에서 결과 계산하여 반환
    return calculateQuestionnaireResult(submission);
  } catch (error) {
    console.error('설문지 처리 실패:', error);
    // API 실패 시에도 로컬 결과는 반환
    return calculateQuestionnaireResult(submission);
  }
};

const getAllCategoriesQuestionnaireResults = async (
  categories: QuestionnaireCategory[]
): Promise<CategoryResults> => {
  try {
    // 각 카테고리별로 결과를 가져오는 API 호출
    const results: CategoryResults = {
      스트레스: [],
      우울: [],
      불안: [],
      자살: [],
    };

    // 실제 API 구현 시에는 각 카테고리별로 API 호출
    for (const category of categories) {
      try {
        const response = await apiClient.get<{
          isSuccess: boolean;
          code: string;
          message: string;
          result: ShowCategoryQuestionnaireDto[];
        }>(`/api/mind/questionnaire/${category}`);

        if (response.data.isSuccess && response.data.result) {
          // 백엔드 DTO를 프론트엔드 결과 형태로 변환
          results[category] = response.data.result.map(item => ({
            category: item.category,
            score: parseInt(item.score, 10),
            createdDate: item.createdDate, // ISO 형식 날짜 문자열 유지
          }));
        } else {
          results[category] = [];
        }
      } catch (error) {
        console.error(`${category} 설문 결과 조회 실패:`, error);
        results[category] = [];
      }
    }

    return results;
  } catch (error) {
    console.error('설문 결과 조회 실패:', error);
    throw new Error('설문 결과를 가져오는데 실패했습니다.');
  }
};

// 백엔드의 전체 설문 결과 조회 API 활용
const getAllQuestionnaireResults = async (): Promise<
  ShowAllQuestionnaireDto[]
> => {
  try {
    const response = await apiClient.get<{
      isSuccess: boolean;
      code: string;
      message: string;
      result: ShowAllQuestionnaireDto[];
    }>('/api/mind/questionnaire');

    if (!response.data.isSuccess || !response.data.result) {
      throw new Error(
        response.data.message || '설문 결과 조회에 실패했습니다.'
      );
    }

    return response.data.result;
  } catch (error) {
    console.error('전체 설문 결과 조회 실패:', error);
    throw new Error('설문 결과를 가져오는데 실패했습니다.');
  }
};

// 특정 카테고리의 설문 결과 조회 API 활용
const getCategoryQuestionnaireResults = async (
  category: QuestionnaireCategory
): Promise<ShowCategoryQuestionnaireDto[]> => {
  try {
    const response = await apiClient.get<{
      isSuccess: boolean;
      code: string;
      message: string;
      result: ShowCategoryQuestionnaireDto[];
    }>(`/api/mind/questionnaire/${category}`);

    if (!response.data.isSuccess || !response.data.result) {
      throw new Error(
        response.data.message || '설문 결과 조회에 실패했습니다.'
      );
    }

    return response.data.result;
  } catch (error) {
    console.error(`${category} 설문 결과 조회 실패:`, error);
    throw new Error('설문 결과를 가져오는데 실패했습니다.');
  }
};

export {
  calculateQuestionnaireResult,
  getAllCategoriesQuestionnaireResults,
  getAllQuestionnaireResults,
  getCategoryQuestionnaireResults,
  submitQuestionnaire,
  submitQuestionnaireAndGetResult,
};
