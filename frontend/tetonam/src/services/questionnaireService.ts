import {
  getQuestionnaireCategory,
  getQuestionnaireResultLevel,
} from '@/constants/questionnaire';
import {
  QuestionnaireResult,
  QuestionnaireSubmission,
} from '@/types/questionnaire';
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
    level: level,
    responses: submission.responses,
    submittedAt: new Date(),
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
