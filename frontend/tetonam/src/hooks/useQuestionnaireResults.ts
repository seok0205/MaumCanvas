import { getAllCategoriesQuestionnaireResults } from '@/services/questionnaireService';
import type {
  QuestionnaireCategory as QuestionnaireCategoryKey,
  QuestionnaireResult,
} from '@/types/api';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { useProgressiveLoading } from './useDelayedLoading';

const MAX_RETRIES = 5;
const RETRY_DELAY = 2000; // 2초

// 서비스에서 반환하는 객체는 한글 카테고리명을 키로 사용하므로 string 인덱스
type CategoryResults = Record<string, QuestionnaireResult[]>;

export const useQuestionnaireResults = () => {
  const [retryCount, setRetryCount] = useState(0);
  const [selectedCategory, setSelectedCategory] =
    useState<QuestionnaireCategoryKey>('스트레스');

  const categories: QuestionnaireCategoryKey[] = [
    '스트레스',
    '우울',
    '불안',
  ];

  const {
    data: allResults,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['questionnaire-results', categories],
    queryFn: async (): Promise<CategoryResults> => {
      try {
        const raw = await getAllCategoriesQuestionnaireResults(
          categories as unknown as any[]
        );
        // 서비스 결과(CategoryQuestionnaireResult[])를 QuestionnaireResult[]로 정규화
        const normalized: CategoryResults = {};
        Object.entries(raw).forEach(([k, arr]) => {
          normalized[k] = (arr as any[]).map(item => ({
            category: k,
            score:
              typeof item.score === 'number'
                ? item.score
                : parseInt(item.score, 10) || 0,
            createdDate: item.createdDate,
          }));
        });
        setRetryCount(0);
        return normalized;
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

  // Progressive Loading 상태 관리
  const progressiveLoadingState = useProgressiveLoading({
    isLoading,
    isFetching,
    data: allResults,
    error,
  });

  const handleRefresh = useCallback(async () => {
    setRetryCount(0);
    await refetch();
  }, [refetch]);

  const getCategoryResults = useCallback(
    (category: QuestionnaireCategoryKey): QuestionnaireResult[] => {
      const results = allResults?.[category] || [];
      console.log(`🔍 getCategoryResults (${category}):`, results);
      return results;
    },
    [allResults]
  );

  const getSelectedCategoryResults = useCallback((): QuestionnaireResult[] => {
    const results = getCategoryResults(selectedCategory);
    console.log(`🎯 getSelectedCategoryResults (${selectedCategory}):`, results);
    return results;
  }, [getCategoryResults, selectedCategory]);

  const hasAnyResults = useCallback((): boolean => {
    if (!allResults) return false;
    return Object.values(allResults).some(results => results.length > 0);
  }, [allResults]);

  const getCategoryDisplayName = useCallback(
    (category: QuestionnaireCategoryKey): string => {
      return category;
    },
    []
  );

  return {
    // 기존 반환값들
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

    // Progressive Loading 상태들 추가
    ...progressiveLoadingState,
  };
};
