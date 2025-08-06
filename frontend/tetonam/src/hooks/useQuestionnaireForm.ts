import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  getQuestionnaireCategory,
  QUESTIONNAIRE_MESSAGES,
} from '@/constants/questionnaire';
import { submitQuestionnaire } from '@/services/questionnaireService';
import {
  QuestionnaireCategory,
  QuestionnaireResponse,
  QuestionnaireSubmission,
} from '@/types/questionnaire';

interface UseQuestionnaireFormProps {
  categoryId: string | undefined;
}

interface UseQuestionnaireFormReturn {
  // 상태
  category: QuestionnaireCategory | null;
  responses: QuestionnaireResponse[];
  isLoading: boolean;
  error: string | null;

  // 계산된 값들
  answeredQuestions: number;
  progressPercentage: number;
  isAllAnswered: boolean;

  // 액션들
  handleOptionChange: (questionId: number, score: number) => void;
  handleSubmit: () => Promise<void>;
  handleBack: () => void;
  clearError: () => void;
}

export const useQuestionnaireForm = ({
  categoryId,
}: UseQuestionnaireFormProps): UseQuestionnaireFormReturn => {
  const navigate = useNavigate();

  // ✅ 상태 관리
  const [category, setCategory] = useState<QuestionnaireCategory | null>(null);
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ 카테고리 초기화 (외부 시스템과 동기화)
  useEffect(() => {
    if (!categoryId) return;

    const foundCategory = getQuestionnaireCategory(categoryId);
    if (foundCategory) {
      setCategory(foundCategory);
      setResponses(
        foundCategory.questions.map(q => ({
          questionId: q.id,
          selectedScore: -1,
        }))
      );
    } else {
      navigate('/diagnosis');
    }
  }, [categoryId, navigate]);

  // ✅ 계산된 값들 메모이제이션
  const answeredQuestions = useMemo(() => {
    return responses.filter(res => res.selectedScore !== -1).length;
  }, [responses]);

  const progressPercentage = useMemo(() => {
    if (!category) return 0;
    return (answeredQuestions / category.questions.length) * 100;
  }, [answeredQuestions, category]);

  const isAllAnswered = useMemo(() => {
    if (!category) return false;
    return answeredQuestions === category.questions.length;
  }, [answeredQuestions, category]);

  // ✅ 옵션 변경 핸들러
  const handleOptionChange = useCallback(
    (questionId: number, score: number) => {
      setResponses(prevResponses =>
        prevResponses.map(res =>
          res.questionId === questionId ? { ...res, selectedScore: score } : res
        )
      );
    },
    []
  );

  // ✅ 폼 제출 핸들러 (API 연동 포함)
  const handleSubmit = useCallback(async () => {
    if (!category || !isAllAnswered) {
      setError(QUESTIONNAIRE_MESSAGES.ALL_QUESTIONS_REQUIRED);
      return;
    }

    // 모든 질문에 대한 답변이 완료되었는지 한 번 더 확인
    const unansweredQuestions = responses.filter(
      res => res.selectedScore === -1
    );
    if (unansweredQuestions.length > 0) {
      setError(QUESTIONNAIRE_MESSAGES.ALL_QUESTIONS_REQUIRED);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const totalScore = responses.reduce(
        (sum, res) => sum + res.selectedScore,
        0
      );

      const submission: QuestionnaireSubmission = {
        category: category.id,
        score: totalScore,
        responses: responses,
      };

      // ✅ 실제 API 호출
      await submitQuestionnaire(submission);

      // 성공 시 결과 페이지로 이동
      const resultData = encodeURIComponent(JSON.stringify(submission));
      navigate(`/questionnaire/${categoryId}/result?data=${resultData}`);
    } catch (error: any) {
      console.error('설문 제출 실패:', error);

      // ✅ 에러 메시지를 더 구체적으로 표시
      const errorMessage = error.message || QUESTIONNAIRE_MESSAGES.SUBMIT_ERROR_MESSAGE;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [category, responses, isAllAnswered, navigate, categoryId]);

  // ✅ 뒤로가기 핸들러
  const handleBack = useCallback(() => {
    navigate('/diagnosis');
  }, [navigate]);

  // ✅ 에러 클리어 핸들러
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // 상태
    category,
    responses,
    isLoading,
    error,

    // 계산된 값들
    answeredQuestions,
    progressPercentage,
    isAllAnswered,

    // 액션들
    handleOptionChange,
    handleSubmit,
    handleBack,
    clearError,
  };
};
