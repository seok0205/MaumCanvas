import { memo } from 'react';

import { DrawingImage } from '@/components/ui/drawing/DrawingImage';
import { LoadingAnimation } from '@/components/ui/LoadingAnimation';
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
    isPollingAfterPrompt,
    setPrompt,
    submitPrompt,
    isCounselor,
  } = useDrawingAnalysis({
    drawingId,
    autoFetch,
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
    <div className={`space-y-${compact ? '3' : '4'} ${className}`}>
      {/* 그림 표시 영역 */}
      {showImage && imageUrl && (
        <div className="mb-6">
          <DrawingImage
            imageUrl={imageUrl}
            category={category}
            className=""
          />
        </div>
      )}

      {/* 상담사용 객체 탐지 결과 */}
      {isCounselor && (
        <Card className={compact ? 'p-3' : ''}>
          <CardHeader className={compact ? 'p-0 pb-2' : ''}>
            <CardTitle className={compact ? 'text-sm' : 'text-base'}>
              객체 탐지 결과
            </CardTitle>
          </CardHeader>
          {/* 구분선 - 적당히 눈에 띄는 스타일 */}
          <div className="border-t border-border opacity-80 mx-4"></div>
          <CardContent className={compact ? 'p-0 pt-3' : 'pt-6'}>
            {loadingAI ? (
              <div className='space-y-2'>
                <Skeleton className={`h-${compact ? '3' : '4'} w-full`} />
                <Skeleton className={`h-${compact ? '3' : '4'} w-3/4`} />
                <Skeleton className={`h-${compact ? '3' : '4'} w-1/2`} />
              </div>
            ) : aiText ? (
              <div
                className={`prose prose-slate max-w-none font-sans leading-relaxed whitespace-pre-wrap ${compact ? 'text-xs prose-sm' : 'text-sm'} text-foreground`}
                style={{
                  fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif",
                  fontSize: 'inherit',
                  lineHeight: '1.7',
                  color: 'hsl(var(--foreground))',
                }}
              >
                {aiText.replace(/"/g, '')}
              </div>
            ) : (
              <div className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                객체 탐지 결과가 없습니다.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 분석 결과 */}
      <Card className={compact ? 'p-3' : ''}>
        <CardHeader className={compact ? 'p-0 pb-2' : ''}>
          <CardTitle className={compact ? 'text-sm' : 'text-base'}>
            {isCounselor ? 'AI 분석 결과' : '분석 결과'}
          </CardTitle>
        </CardHeader>
        {/* 구분선 - 적당히 눈에 띄는 스타일 */}
        <div className="border-t border-border opacity-80 mx-4"></div>
        <CardContent className={`space-y-${compact ? '3' : '4'} ${compact ? 'p-0 pt-3' : 'pt-6'}`}>
          {/* 분석 결과 표시 */}
          {loadingRAG ? (
            <div className="flex flex-col items-center justify-center py-8">
              <LoadingAnimation
                size="md"
                title="AI 분석 중..."
                message={
                  isPollingAfterPrompt
                    ? "분석을 진행중입니다. 분석 완료 시 카카오톡 알림을 보내드립니다."
                    : "창의적인 마음을 깊이 들여다보고 있어요 ✨"
                }
                showLoadingDots={true}
              />
            </div>
          ) : submitting ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-3">
              <LoadingAnimation
                size="sm"
                message="제출 중..."
                showLoadingDots={true}
              />
            </div>
          ) : ragError ? (
            <div className={`${compact ? 'text-xs' : 'text-sm'} text-red-600`}>
              {ragError === 'UNAUTHORIZED'
                ? '분석 결과를 확인할 권한이 없습니다.'
                : ragError === 'NOT_FOUND'
                  ? '아직 분석 결과가 없습니다.'
                  : ragError === 'RAG_NOT_READY'
                    ? isCounselor
                      ? '아직 분석을 시작하지 않았습니다. 예시를 참고하여 구체적으로 기술해주시면 더 정확한 분석이 가능합니다.'
                      : '아직 그림 분석이 진행되지 않았습니다. 분석이 완료되면 결과를 확인할 수 있습니다.'
                    : ragError === 'TIMEOUT'
                      ? '분석 시간이 초과되었습니다. 다시 시도해주세요.'
                      : ragError === 'NETWORK'
                        ? '네트워크 오류로 결과를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.'
                        : '알 수 없는 오류가 발생했습니다.'}
            </div>
          ) : ragText && ragHtml ? (
            <div
              className={`prose prose-slate max-w-none font-sans leading-relaxed ${compact ? 'text-xs prose-sm' : 'text-sm'}`}
              style={{
                fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif",
                fontSize: 'inherit',
                lineHeight: '1.7',
                color: 'hsl(var(--foreground))',
              }}
              dangerouslySetInnerHTML={{ __html: ragHtml }}
            />
          ) : (
            <div className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
              {isCounselor
                ? '프롬프트를 입력하시면 답변 드립니다.'
                : '아직 결과가 없습니다.'}
            </div>
          )}

          {/* 상담사용 프롬프트 입력 */}
          {isCounselor && (
            <div className={`${compact ? 'space-y-2' : 'space-y-3'}`}>
              {!compact && (
                <div className='text-sm text-muted-foreground bg-muted/50 p-4 rounded-md'>
                  <div className='font-medium mb-2 text-base'>예시:</div>
                  집의 크기는 적절하다. 지붕이 존재하나, 굴뚝이 존재하지 않는다. 창문의 개수는 2개이며 집의 크기에 비해 작은 편이다.
                </div>
              )}
              <div className={`${compact ? 'space-y-2' : 'space-y-3'}`}>
                <input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder='최소 4가지 특징에 대해서 묘사해주세요.'
                  disabled={submitting}
                  className={`w-full ${compact ? 'text-xs h-8 px-2' : 'text-sm h-12 px-4'} rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
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
                  className={`w-full ${compact ? 'h-8' : 'h-12'}`}
                >
                  {submitting ? '제출 중...' : '제출'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

DrawingAnalysisContent.displayName = 'DrawingAnalysisContent';
