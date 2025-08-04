import {
  getQuestionnaireCategory,
  getQuestionnaireResultLevel,
} from '@/constants/questionnaire';
import type { QuestionnaireCategory, QuestionnaireResult } from '@/types/api';
import { QuestionnaireSubmission } from '@/types/questionnaire';
import { apiClient } from './apiClient';

export interface QuestionnaireApiResponse {
  isSuccess: boolean;
  message: string;
  result?: {
    id: string;
    category: string;
    score: number;
    submittedAt: string;
  };
}

// 카테고리별 결과 타입 정의
type CategoryResults = Record<QuestionnaireCategory, QuestionnaireResult[]>;

export const submitQuestionnaire = async (
  submission: QuestionnaireSubmission
): Promise<QuestionnaireApiResponse> => {
  try {
    const response = await apiClient.post<QuestionnaireApiResponse>(
      '/api/mind/questionnaire',
      {
        category: submission.category,
        score: submission.score,
        responses: submission.responses,
      }
    );

    return response.data;
  } catch (error) {
    console.error('설문지 제출 실패:', error);
    throw new Error('설문지 제출에 실패했습니다.');
  }
};

export const calculateQuestionnaireResult = (
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

export const submitQuestionnaireAndGetResult = async (
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

export const getAllCategoriesQuestionnaireResults = async (
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
    // 현재는 임시로 빈 배열 반환
    for (const category of categories) {
      try {
        const response = await apiClient.get<QuestionnaireResult[]>(
          `/api/mind/questionnaire/results/${category}`
        );
        results[category] = response.data || [];
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
