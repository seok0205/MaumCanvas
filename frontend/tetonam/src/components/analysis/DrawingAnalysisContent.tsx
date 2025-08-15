import { memo } from 'react';

import { DrawingImage } from '@/components/ui/drawing/DrawingImage';
import { Button } from '@/components/ui/interactive/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/layout/card';
import { Skeleton } from '@/components/ui/layout/skeleton';
import { useDrawingAnalysis } from '@/hooks/useDrawingAnalysis';

// TypeScript 인터페이스 정의
interface DrawingAnalysisContentProps {
  drawingId: string | null;
  imageUrl?: string;
  category?: string;
  compact?: boolean;
  className?: string;
  autoFetch?: boolean;
  enablePolling?: boolean;
  showImage?: boolean;
  onSubmitSuccess?: () => void;
  onSubmitError?: (error: Error) => void;
}

/**
 * 그림 분석 결과를 표시하는 공통 컴포넌트
 *
 * @description AI 분석 결과와 RAG 결과를 표시하며, 상담사의 경우 프롬프트 입력 기능도 제공합니다.
 * 비즈니스 로직은 useDrawingAnalysis 훅에 위임하고, UI 렌더링만 담당합니다.
 *
 * @param props 컴포넌트 속성
 */
export const DrawingAnalysisContent = memo<DrawingAnalysisContentProps>(({
  drawingId,
  imageUrl,
  category,
  compact = false,
  className = '',
  autoFetch = true,
  enablePolling = true,
  showImage = true,
  onSubmitSuccess,
  onSubmitError,
}) => {
  // 커스텀 훅으로 비즈니스 로직 분리
  const {
    aiText,
    ragText,
    ragHtml,
    ragError,
    prompt,
    loadingAI,
    loadingRAG,
    submitting,
    setPrompt,
    submitPrompt,
    isCounselor,
  } = useDrawingAnalysis({
    drawingId,
    autoFetch,
    enablePolling,
  });

  // 프롬프트 제출 핸들러 (에러 처리 포함)
  const handleSubmitPrompt = async () => {
    try {
      await submitPrompt();
      onSubmitSuccess?.();
    } catch (error) {
      console.error('❌ [DrawingAnalysisContent] 프롬프트 제출 실패:', error);
      onSubmitError?.(error as Error);
    }
  };

  // drawingId가 없으면 아무것도 렌더링하지 않음
  if (!drawingId) {
    return (
      <div className={`text-center ${className}`}>
        <p className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
          그림을 선택해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-${compact ? '3' : '6'} ${className}`}>
      {/* 그림 표시 영역 */}
      {showImage && imageUrl && (
        <Card className={compact ? 'p-3' : ''}>
          <CardHeader className={compact ? 'p-0 pb-2' : ''}>
            <CardTitle className={compact ? 'text-sm' : 'text-base'}>
              그림
            </CardTitle>
          </CardHeader>
          <CardContent className={compact ? 'p-0' : ''}>
            <div className='flex justify-center'>
              <DrawingImage
                imageUrl={imageUrl}
                category={category}
                className={compact ? 'max-h-48' : 'max-w-md max-h-96 object-contain rounded-lg'}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI 객체 탐지 결과 - 모든 사용자에게 표시 */}
      <Card className={compact ? 'p-3' : ''}>
        <CardHeader className={compact ? 'p-0 pb-2' : ''}>
          <CardTitle className={compact ? 'text-sm' : 'text-base'}>
            AI 객체 탐지 결과
          </CardTitle>
        </CardHeader>
        <CardContent className={compact ? 'p-0' : ''}>
          {loadingAI ? (
            <div className='space-y-2'>
              <Skeleton className={`h-${compact ? '3' : '4'} w-3/4`} />
              <Skeleton className={`h-${compact ? '3' : '4'} w-1/2`} />
              <Skeleton className={`h-${compact ? '3' : '4'} w-2/3`} />
            </div>
          ) : aiText ? (
            <pre className={`whitespace-pre-wrap ${compact ? 'text-xs' : 'text-sm'} text-muted-foreground bg-muted ${compact ? 'p-2' : 'p-4'} rounded-md`}>
              {aiText}
            </pre>
          ) : (
            <div className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
              객체 탐지 결과가 없습니다.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 심리 분석 결과 - 상담사에게만 표시 */}
      {isCounselor && (
        <Card className={compact ? 'p-3' : ''}>
          <CardHeader className={compact ? 'p-0 pb-2' : ''}>
            <CardTitle className={compact ? 'text-sm' : 'text-base'}>
              RAG 분석 결과
            </CardTitle>
          </CardHeader>
          <CardContent className={`space-y-${compact ? '3' : '4'} ${compact ? 'p-0' : ''}`}>
            {/* 분석 결과 표시 */}
            {loadingRAG ? (
              <div className='space-y-2'>
                <Skeleton className={`h-${compact ? '3' : '4'} w-full`} />
                <Skeleton className={`h-${compact ? '3' : '4'} w-3/4`} />
                <Skeleton className={`h-${compact ? '3' : '4'} w-1/2`} />
              </div>
            ) : submitting ? (
              <div className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground flex items-center space-x-2`}>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-primary'></div>
                <span>분석 중...</span>
              </div>
            ) : ragError ? (
              <div className={`text-center ${compact ? 'p-3' : 'p-6'} text-muted-foreground`}>
                <p className={`mb-2 ${compact ? 'text-xs' : 'text-sm'}`}>
                  {ragError === 'UNAUTHORIZED'
                    ? '분석 결과를 확인할 권한이 없습니다.'
                    : ragError === 'NOT_FOUND' || ragError === 'RAG_NOT_READY'
                      ? '분석을 준비 중입니다...'
                      : ragError === 'NETWORK'
                        ? '네트워크 오류로 결과를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.'
                        : '알 수 없는 오류가 발생했습니다.'}
                </p>
                {(ragError === 'NOT_FOUND' || ragError === 'RAG_NOT_READY') && (
                  <p className={`${compact ? 'text-2xs' : 'text-sm'} text-muted-foreground`}>
                    잠시 후 다시 시도해주세요.
                  </p>
                )}
              </div>
            ) : ragText && ragHtml ? (
              <div className='space-y-4'>
                <div
                  className={`prose prose-slate max-w-none font-sans leading-relaxed ${compact ? 'text-xs prose-sm' : 'text-sm'} text-muted-foreground`}
                  style={{
                    fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif",
                    fontSize: 'inherit',
                    lineHeight: '1.7',
                    color: 'hsl(var(--foreground))',
                  }}
                  dangerouslySetInnerHTML={{ __html: ragHtml }}
                />
              </div>
            ) : (
              <div className={`text-center ${compact ? 'p-3' : 'p-6'} text-muted-foreground`}>
                <p className={compact ? 'text-xs' : 'text-sm'}>심리 분석 결과가 아직 없습니다.</p>
                <p className={`${compact ? 'text-2xs' : 'text-sm'} mt-2`}>
                  아래에서 분석을 요청할 수 있습니다.
                </p>
              </div>
            )}

            {/* 상담사용 프롬프트 입력 */}
            <div className={`flex ${compact ? 'flex-col space-y-2' : 'flex-col sm:flex-row'} ${compact ? '' : 'items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2'}`}>
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={compact ? '분석 요청...' : '그림에 대해 궁금한 점을 입력하세요...'}
                disabled={submitting}
                className={`${compact ? 'text-xs' : 'text-sm'} flex-1 ${compact ? 'h-8 px-2' : 'h-10 px-3'} rounded-md border border-border bg-background`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && prompt.trim() && !submitting) {
                    e.preventDefault();
                    handleSubmitPrompt();
                  }
                }}
              />
              <Button
                onClick={handleSubmitPrompt}
                disabled={submitting || !prompt.trim()}
                size={compact ? 'sm' : 'default'}
                className='w-full sm:w-auto'
              >
                {submitting ? '분석 중...' : '분석 요청'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

DrawingAnalysisContent.displayName = 'DrawingAnalysisContent';
