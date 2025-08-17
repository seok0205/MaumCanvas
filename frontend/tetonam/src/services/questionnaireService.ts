import {
  getCategoryKoreanName,
  getQuestionnaireCategory,
  getQuestionnaireResultLevel,
} from '@/constants/questionnaire';
import type {
  QuestionnaireCategory,
  QuestionnaireResult,
  QuestionnaireSubmission,
} from '@/types/questionnaire';
import { convertLocalDateTimeArrayToISO } from '@/types/api';
import { apiClient } from './apiClient';

// 백엔드 DTO와 일치하는 타입 정의
interface ShowAllQuestionnaireDto {
  category: QuestionnaireCategory;
  score: string;
}

interface ShowCategoryQuestionnaireDto {
  category: QuestionnaireCategory;
  score: string;
  createdDate: string | number[]; // LocalDateTime은 ISO string 또는 배열로 전송됨
}

interface QuestionnaireApiResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: string | null;
}

// 카테고리별 결과 타입 정의 (내부 서비스용)
interface CategoryQuestionnaireResult {
  category: string;
  score: number | string; // 자살위험성은 string, 나머지는 number
  createdDate: string;
}

type CategoryResults = Record<string, CategoryQuestionnaireResult[]>;

const submitQuestionnaire = async (
  submission: QuestionnaireSubmission
): Promise<QuestionnaireApiResponse> => {
  try {
    // ✅ 영어 카테고리 ID를 한글로 변환 (백엔드 Category enum에 맞춤)
    const koreanCategory = getCategoryKoreanName(submission.category);

    // ✅ 백엔드 API 스펙에 맞게 query parameter 방식으로 전송
    // ✅ 백엔드에서 body를 받지 않으므로 null을 명시적으로 전달
    // ✅ 모든 설문의 score를 string으로 변환하여 전송
    const response = await apiClient.post<QuestionnaireApiResponse>(
      `/api/mind/questionnaire?score=${encodeURIComponent(String(submission.score))}&category=${encodeURIComponent(koreanCategory)}`,
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
    level: level,
    responses: submission.responses,
    submittedAt: new Date(),
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
        // ✅ 이미 한글 카테고리이므로 getCategoryKoreanName 변환 불필요
        const koreanCategory = String(category); // 한글 카테고리 그대로 사용

        const response = await apiClient.get<{
          isSuccess: boolean;
          code: string;
          message: string;
          result: ShowCategoryQuestionnaireDto[];
        }>(`/api/mind/questionnaire/${koreanCategory}`);

        if (response.data.isSuccess && response.data.result) {
          // 백엔드 DTO를 프론트엔드 결과 형태로 변환
          results[koreanCategory] = response.data.result.map(item => ({
            category: String(item.category), // 문자열로 변환
            score: isNaN(parseInt(item.score, 10))
              ? item.score
              : parseInt(item.score, 10), // 자살위험성은 문자열, 나머지는 숫자
            createdDate: Array.isArray(item.createdDate)
              ? convertLocalDateTimeArrayToISO(item.createdDate)
              : item.createdDate, // 배열이면 ISO 문자열로 변환, 아니면 그대로 사용
          }));
        } else {
          results[koreanCategory] = [];
        }
      } catch (error) {
        const koreanCategory = String(category); // 한글 카테고리 그대로 사용
        console.error(`❌ API 호출 실패 (${koreanCategory}):`, error);
        results[koreanCategory] = [];
      }
    }

    return results;
  } catch (error) {
    console.error('❌ 설문 결과 조회 실패:', error);
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
