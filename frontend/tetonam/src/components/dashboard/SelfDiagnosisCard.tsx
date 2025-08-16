import { Button } from '@/components/ui/interactive/button';
import { Card } from '@/components/ui/layout/card';
import { useQuestionnaireResults } from '@/hooks/useQuestionnaireResults';
import type { QuestionnaireCategory } from '@/types/api';
import { AlertCircle, RefreshCw, TrendingUp } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { QuestionnaireChart } from './QuestionnaireChart';

// Props 인터페이스 정의 - TanStack Query Best Practice
interface SelfDiagnosisCardProps {
  questionnaireData?: Record<string, any> | null;
  isLoading?: boolean;
  isFetching?: boolean;
}

export const SelfDiagnosisCard = memo<SelfDiagnosisCardProps>(({ 
  questionnaireData,
  isLoading: propsIsLoading = false,
  isFetching: propsIsFetching = false 
}) => {
  // TanStack Query Best Practice: Props 우선, 개별 쿼리는 fallback
  const queryResult = useQuestionnaireResults();
  
  // Props에서 데이터가 제공되면 사용, 없으면 개별 쿼리 결과 사용
  const shouldUseProps = questionnaireData !== undefined && questionnaireData !== null;

  // 성능 최적화: 자살 카테고리를 제외한 카테고리 필터링을 메모이제이션
  const filteredCategories = useMemo(() => {
    const allCategories = shouldUseProps 
      ? Object.keys(questionnaireData || {})
      : queryResult.categories;
    
    // 자살 카테고리 제외
    return allCategories.filter(category => category !== '자살');
  }, [shouldUseProps, questionnaireData, queryResult.categories]);

  // 로컬 카테고리 선택 상태 (props 사용 시에도 카테고리 변경 가능하도록)
  const [localSelectedCategory, setLocalSelectedCategory] = useState<string>(
    filteredCategories[0] || '스트레스'
  );

  // filteredCategories가 변경되면 localSelectedCategory도 업데이트
  useMemo(() => {
    if (filteredCategories.length > 0 && !filteredCategories.includes(localSelectedCategory)) {
      setLocalSelectedCategory(filteredCategories[0] || '스트레스');
    }
  }, [filteredCategories, localSelectedCategory]);  const {
    selectedCategory,
    setSelectedCategory,
    error,
    retryCount,
    maxRetries,
    refetch,
    getSelectedCategoryResults,
    hasAnyResults,
    getCategoryDisplayName,
    // Progressive Loading 상태들
    showSkeleton,
    isBackgroundFetching,
  } = shouldUseProps ? {
    // Props 기반 데이터 사용 시 로컬 상태로 카테고리 관리
    selectedCategory: localSelectedCategory,
    setSelectedCategory: setLocalSelectedCategory,
    error: null,
    retryCount: 0,
    maxRetries: 3,
    refetch: async () => {},
    getSelectedCategoryResults: () => {
      return questionnaireData && localSelectedCategory 
        ? questionnaireData[localSelectedCategory] || [] 
        : [];
    },
    hasAnyResults: () => filteredCategories.length > 0,
    getCategoryDisplayName: (cat: any) => String(cat),
    showSkeleton: propsIsLoading,
    isBackgroundFetching: propsIsFetching,
  } : queryResult;

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleCategoryChange = useCallback(
    (category: string) => {
      setSelectedCategory(category as any);
    },
    [setSelectedCategory]
  );

  // Progressive Loading: 초기 로딩 시 스켈레톤 표시
  if (showSkeleton) {
    return (
      <Card className='p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-foreground'>
            자가 진단 결과
          </h3>
        </div>
        <div className='space-y-4'>
          {/* 카테고리 선택 스켈레톤 */}
          <div className='flex space-x-2'>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className='h-8 bg-gray-200 rounded animate-pulse flex-1'
              />
            ))}
          </div>
          {/* 차트 영역 스켈레톤 */}
          <div className='h-64 bg-gray-200 rounded animate-pulse' />
        </div>
      </Card>
    );
  }

  // 네트워크 에러 상태 (재시도 중)
  if (error && retryCount < maxRetries) {
    return (
      <Card className='p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-foreground'>
            자가 진단 결과
          </h3>
        </div>
        <div className='text-center py-8'>
          <AlertCircle className='w-12 h-12 text-orange-500 mx-auto mb-3' />
          <p className='text-muted-foreground mb-2'>
            데이터를 불러오지 못했습니다
          </p>
          <p className='text-sm text-muted-foreground mb-4'>
            재시도 중... ({retryCount}/{maxRetries})
          </p>
          <div className='flex items-center justify-center space-x-2'>
            <RefreshCw className='w-4 h-4 animate-spin text-muted-foreground' />
            <span className='text-sm text-muted-foreground'>
              자동 재시도 중
            </span>
          </div>
        </div>
      </Card>
    );
  }

  // 최종 에러 상태 (재시도 실패) - 새로고침 버튼 표시
  if (error && retryCount >= maxRetries) {
    return (
      <Card className='p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-foreground'>
            자가 진단 결과
          </h3>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            className='text-xs'
          >
            <RefreshCw className='w-3 h-3 mr-1' />
            새로고침
          </Button>
        </div>
        <div className='text-center py-8'>
          <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-3' />
          <p className='text-muted-foreground mb-2'>
            데이터를 불러오지 못했습니다
          </p>
          <p className='text-sm text-muted-foreground mb-4'>
            네트워크 연결을 확인하고 다시 시도해주세요
          </p>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            className='text-xs'
          >
            <RefreshCw className='w-3 h-3 mr-1' />
            다시 시도
          </Button>
        </div>
      </Card>
    );
  }

  // 데이터가 없는 경우 - 새로고침 버튼 제거
  if (!hasAnyResults()) {
    return (
      <Card className='p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-foreground'>
            자가 진단 결과
          </h3>
        </div>
        <div className='text-center py-8'>
          <TrendingUp className='w-12 h-12 text-muted-foreground mx-auto mb-3' />
          <p className='text-muted-foreground'>아직 진단 결과가 없습니다</p>
          <p className='text-sm text-muted-foreground mt-2'>
            자가 진단을 진행해보세요
          </p>
        </div>
      </Card>
    );
  }

  const selectedResults = getSelectedCategoryResults();

  return (
    <Card className='p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-foreground'>
          자가 진단 결과
        </h3>
        {/* 데이터가 있을 때는 새로고침 버튼 제거 */}
      </div>

      {/* 카테고리 선택 버튼들 */}
      <div className='flex flex-wrap gap-2 mb-6'>
        {filteredCategories.map((category: string) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size='sm'
            onClick={() => handleCategoryChange(category)}
            className='text-xs'
          >
            {getCategoryDisplayName(category as QuestionnaireCategory)}
          </Button>
        ))}
      </div>

      {/* 차트 영역 */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h4 className='text-md font-medium text-foreground'>
            {getCategoryDisplayName(selectedCategory as QuestionnaireCategory)} 진단 추이
          </h4>
          {/* Context7 모범 사례: 백그라운드 갱신 상태 표시 */}
          {isBackgroundFetching && (
            <div className='flex items-center space-x-2'>
              <RefreshCw className='w-3 h-3 animate-spin text-muted-foreground' />
              <span className='text-xs text-muted-foreground'>
                Background Updating...
              </span>
            </div>
          )}
        </div>

        <QuestionnaireChart
          results={selectedResults}
          categoryName={getCategoryDisplayName(selectedCategory as QuestionnaireCategory)}
        />
      </div>
    </Card>
  );
});

SelfDiagnosisCard.displayName = 'SelfDiagnosisCard';
