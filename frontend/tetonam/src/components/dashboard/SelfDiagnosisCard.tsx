import { Button } from '@/components/ui/interactive/button';
import { Card } from '@/components/ui/layout/card';
import { useQuestionnaireResults } from '@/hooks/useQuestionnaireResults';
import { AlertCircle, RefreshCw, TrendingUp } from 'lucide-react';
import { memo, useCallback } from 'react';
import { QuestionnaireChart } from './QuestionnaireChart';

export const SelfDiagnosisCard = memo(() => {
  const {
    selectedCategory,
    setSelectedCategory,
    categories,
    isLoading,
    error,
    retryCount,
    maxRetries,
    refetch,
    getSelectedCategoryResults,
    hasAnyResults,
    getCategoryDisplayName,
  } = useQuestionnaireResults();

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleCategoryChange = useCallback(
    (category: string) => {
      setSelectedCategory(category as any);
    },
    [setSelectedCategory]
  );

  // 로딩 상태
  if (isLoading && !hasAnyResults()) {
    return (
      <Card className='p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-foreground'>
            자가 진단 결과
          </h3>
        </div>
        <div className='text-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3'></div>
          <p className='text-muted-foreground'>진단 결과를 불러오는 중...</p>
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

  // 최종 에러 상태 (재시도 실패)
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

  // 데이터가 없는 경우
  if (!hasAnyResults()) {
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

      {/* 카테고리 선택 버튼들 */}
      <div className='flex flex-wrap gap-2 mb-6'>
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size='sm'
            onClick={() => handleCategoryChange(category)}
            className='text-xs'
          >
            {getCategoryDisplayName(category)}
          </Button>
        ))}
      </div>

      {/* 차트 영역 */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h4 className='text-md font-medium text-foreground'>
            {getCategoryDisplayName(selectedCategory)} 진단 추이
          </h4>
          {isLoading && (
            <div className='flex items-center space-x-2'>
              <RefreshCw className='w-3 h-3 animate-spin text-muted-foreground' />
              <span className='text-xs text-muted-foreground'>업데이트 중</span>
            </div>
          )}
        </div>

        <QuestionnaireChart
          results={selectedResults}
          categoryName={getCategoryDisplayName(selectedCategory)}
        />
      </div>
    </Card>
  );
});

SelfDiagnosisCard.displayName = 'SelfDiagnosisCard';
