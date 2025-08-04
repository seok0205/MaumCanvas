import { getAllCategoriesQuestionnaireResults } from '@/services/questionnaireService';
import type { QuestionnaireCategory, QuestionnaireResult } from '@/types/api';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

const MAX_RETRIES = 5;
const RETRY_DELAY = 2000; // 2초

// 카테고리별 결과 타입 정의
type CategoryResults = Record<QuestionnaireCategory, QuestionnaireResult[]>;

export const useQuestionnaireResults = () => {
  const [retryCount, setRetryCount] = useState(0);
  const [selectedCategory, setSelectedCategory] =
    useState<QuestionnaireCategory>('스트레스');

  const categories: QuestionnaireCategory[] = [
    '스트레스',
    '우울',
    '불안',
    '자살',
  ];

  const {
    data: allResults,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['questionnaire-results', categories],
    queryFn: async (): Promise<CategoryResults> => {
      try {
        const results = await getAllCategoriesQuestionnaireResults(categories);
        setRetryCount(0); // 성공 시 재시도 카운트 리셋
        return results;
      } catch (error) {
        setRetryCount(prev => prev + 1);
        throw error;
      }
    },
    retry: (failureCount, _error) => {
      // 네트워크 에러가 아니거나 최대 재시도 횟수를 초과한 경우 재시도하지 않음
      if (failureCount >= MAX_RETRIES) {
        return false;
      }

      // 2초 후 재시도
      return true;
    },
    retryDelay: RETRY_DELAY,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });

  const handleRefresh = useCallback(async () => {
    setRetryCount(0);
    await refetch();
  }, [refetch]);

  const getCategoryResults = useCallback(
    (category: QuestionnaireCategory): QuestionnaireResult[] => {
      return allResults?.[category] || [];
    },
    [allResults]
  );

  const getSelectedCategoryResults = useCallback((): QuestionnaireResult[] => {
    return getCategoryResults(selectedCategory);
  }, [getCategoryResults, selectedCategory]);

  const hasAnyResults = useCallback((): boolean => {
    if (!allResults) return false;
    return Object.values(allResults).some(results => results.length > 0);
  }, [allResults]);

  const getCategoryDisplayName = useCallback(
    (category: QuestionnaireCategory): string => {
      return category; // API 문서와 일치하므로 카테고리명 그대로 사용
    },
    []
  );

  return {
    allResults,
    selectedCategory,
    setSelectedCategory,
    categories,
    isLoading,
    error,
    retryCount,
    maxRetries: MAX_RETRIES,
    refetch: handleRefresh,
    getCategoryResults,
    getSelectedCategoryResults,
    hasAnyResults,
    getCategoryDisplayName,
  };
};
