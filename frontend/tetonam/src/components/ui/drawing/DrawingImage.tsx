import { memo, useCallback, useEffect, useState } from 'react';

import { Card, CardContent } from '@/components/ui/layout/card';
import { Skeleton } from '@/components/ui/layout/skeleton';

interface DrawingImageProps {
  readonly imageUrl?: string | undefined;
  readonly category?: string | undefined;
  readonly className?: string;
}

/**
 * 그림 분석 결과 페이지에서 사용되는 그림 이미지 컴포넌트
 * React Best Practices 적용:
 * - memo로 불필요한 리렌더링 방지
 * - useCallback으로 이벤트 핸들러 최적화
 * - 접근성 고려 (alt 텍스트, aria-label)
 * - 로딩 상태 및 에러 처리
 */
export const DrawingImage = memo<DrawingImageProps>(
  ({ imageUrl, category, className = '' }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // 이미지 preload (React Best Practice)
    useEffect(() => {
      if (!imageUrl) return undefined;

      // 브라우저가 지원하는 경우 preload 사용
      if ('HTMLLinkElement' in window && document.head) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = imageUrl;
        document.head.appendChild(link);

        // 컴포넌트 언마운트 시 정리
        return () => {
          if (document.head.contains(link)) {
            document.head.removeChild(link);
          }
        };
      }

      return undefined;
    }, [imageUrl]);

    // 이미지 로드 완료 핸들러 (useCallback으로 최적화)
    const handleImageLoad = useCallback(() => {
      setIsLoading(false);
      setHasError(false);
    }, []);

    // 이미지 로드 에러 핸들러 (useCallback으로 최적화)
    const handleImageError = useCallback(() => {
      setIsLoading(false);
      setHasError(true);
    }, []);

    // 카테고리별 한글 이름 매핑
    const getCategoryName = useCallback((cat?: string): string => {
      switch (cat) {
        case 'HOME':
          return '집 그림';
        case 'TREE':
          return '나무 그림';
        case 'PERSON1':
          return '사람 그림 1';
        case 'PERSON2':
          return '사람 그림 2';
        default:
          return '그림';
      }
    }, []);

    // 이미지 URL이 없는 경우
    if (!imageUrl) {
      return (
        <Card className={`mx-auto max-w-2xl ${className}`}>
          <CardContent className='p-6'>
            <div className='flex items-center justify-center h-64 bg-muted rounded-lg'>
              <div className='text-center text-muted-foreground'>
                <div className='text-sm'>그림을 불러올 수 없습니다</div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className={`mx-auto max-w-2xl ${className}`}>
        <CardContent className='p-6'>
          <div className='space-y-4'>
            {/* 그림 제목 */}
            <div className='text-center'>
              <h2 className='text-lg font-semibold text-foreground'>
                {getCategoryName(category)}
              </h2>
            </div>

            {/* 이미지 컨테이너 */}
            <div className='relative rounded-lg overflow-hidden bg-background border'>
              {/* 로딩 스켈레톤 */}
              {isLoading && (
                <div className='absolute inset-0 z-10'>
                  <Skeleton className='w-full h-64' />
                </div>
              )}

              {/* 에러 상태 */}
              {hasError && (
                <div className='flex items-center justify-center h-64 bg-muted'>
                  <div className='text-center text-muted-foreground'>
                    <div className='text-sm'>이미지를 불러올 수 없습니다</div>
                  </div>
                </div>
              )}

              {/* 실제 이미지 */}
              {!hasError && (
                <img
                  src={imageUrl}
                  alt={`${getCategoryName(category)} - HTP 검사 그림`}
                  className={`w-full h-auto max-h-96 object-contain transition-opacity duration-200 ${
                    isLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  loading='eager' // 중요한 이미지이므로 즉시 로드
                  decoding='async' // 비동기 디코딩으로 메인 스레드 블로킹 방지
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

DrawingImage.displayName = 'DrawingImage';
