import { forwardRef, HTMLAttributes } from 'react';

import { useImageLoadState } from '@/hooks/useImageLoadState';
import { cn } from '@/utils/cn';

interface OptimizedImageProps extends HTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  isPreloaded?: boolean;
  fallbackClassName?: string;
  skeletonClassName?: string;
  priority?: boolean;
}

/**
 * 최적화된 이미지 컴포넌트
 * 프리로딩, 로딩 상태, 에러 처리를 포함한 부드러운 이미지 전환을 제공합니다.
 */
export const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  (
    {
      src,
      alt,
      isPreloaded = false,
      className,
      fallbackClassName,
      skeletonClassName,
      priority = false,
      onError,
      ...props
    },
    ref
  ) => {
    const { isLoaded, hasError, loadingState } = useImageLoadState(
      src,
      isPreloaded
    );

    // 이미지 상태에 따른 CSS 클래스 결정
    const getImageClasses = () => {
      const baseClasses = cn('image-preloader', className);

      switch (loadingState) {
        case 'loading':
          return cn(baseClasses, 'image-preloader--loading');
        case 'loaded':
          return cn(baseClasses, 'image-preloader--loaded');
        case 'error':
          return cn(baseClasses, 'image-preloader--error');
        default:
          return baseClasses;
      }
    };

    if (hasError) {
      return (
        <div
          className={cn(
            'flex items-center justify-center bg-muted rounded-lg',
            fallbackClassName
          )}
          role='img'
          aria-label={`${alt} (이미지 로드 실패)`}
        >
          <span className='text-muted-foreground text-sm'>
            이미지를 불러올 수 없습니다
          </span>
        </div>
      );
    }

    return (
      <div className='relative'>
        {/* 로딩 스켈레톤 */}
        {!isLoaded && (
          <div
            className={cn('absolute inset-0 image-skeleton', skeletonClassName)}
            aria-hidden='true'
          />
        )}

        {/* 실제 이미지 */}
        <img
          ref={ref}
          src={src}
          alt={alt}
          className={getImageClasses()}
          loading={priority ? 'eager' : 'lazy'}
          onError={onError}
          {...props}
        />
      </div>
    );
  }
);

OptimizedImage.displayName = 'OptimizedImage';
