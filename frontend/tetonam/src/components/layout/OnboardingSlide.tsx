import { ChevronLeft, ChevronRight } from 'lucide-react';
import { memo, useState } from 'react';

import { Button } from '@/components/ui/interactive/button';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

interface OnboardingSlideProps {
  title: string;
  description: string;
  imageSrc: string;
  currentSlide: number;
  totalSlides: number;
  onNext: () => void;
  onPrev: () => void;
  isLastSlide: boolean;
  isImagePreloaded?: boolean;
  className?: string;
}

export const OnboardingSlide = memo(function OnboardingSlide({
  title,
  description,
  imageSrc,
  currentSlide,
  totalSlides,
  onNext,
  onPrev,
  isLastSlide,
  isImagePreloaded = false,
  className,
}: OnboardingSlideProps) {
  const [, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        onNext();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        onPrev();
        break;
    }
  };

  // 모든 슬라이드에 일관된 레이아웃 적용 (Best Practice)
  const layoutDirection = 'flex-col md:flex-row';

  return (
    <div
      className={`min-h-screen bg-gradient-warm flex flex-col items-center justify-center p-6 ${className || ''}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role='main'
      aria-label='온보딩 슬라이드'
    >
      <div className='w-full max-w-2xl md:max-w-6xl lg:max-w-7xl mx-auto'>
        {/* 메인 콘텐츠 - 일관된 레이아웃 적용 */}
        <div
          className={`flex ${layoutDirection} items-center gap-8 md:gap-12 animate-fade-in`}
        >
          {/* 이미지 컨테이너 - 더 큰 크기로 조정 */}
          <div className='w-full max-w-lg h-96 md:w-[32rem] md:h-[32rem] lg:w-[36rem] lg:h-[36rem] mx-auto md:mx-0 flex-shrink-0 animate-float flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-3xl p-6'>
            <OptimizedImage
              src={imageSrc}
              alt={title}
              isPreloaded={isImagePreloaded}
              priority={true}
              className='w-full h-full object-cover rounded-2xl'
              fallbackClassName='w-full h-full bg-muted rounded-2xl'
              skeletonClassName='rounded-2xl'
              onError={handleImageError}
            />
          </div>

          {/* 텍스트 콘텐츠 - 고정 높이로 일관성 확보 */}
          <div className='flex-1 flex flex-col justify-center min-h-[20rem] md:min-h-[24rem] space-y-6 text-center md:text-left px-4 md:px-0'>
            <h1 className='text-2xl md:text-4xl lg:text-5xl font-bold text-foreground break-keep leading-tight tracking-wide'>
              {title}
            </h1>
            <div className='flex items-center justify-center md:justify-start min-h-[6rem]'>
              <p className='text-muted-foreground text-base md:text-xl lg:text-2xl leading-relaxed tracking-wide font-medium max-w-2xl break-keep'>
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* 네비게이션 영역 - 컨테이너 높이 일관성 확보 */}
        <div className='flex flex-col space-y-4 mt-8 md:mt-12 max-w-md mx-auto'>
          {/* 상단: 이전, 진행 표시기, 다음 버튼 */}
          <div className='flex justify-between items-center h-12'>
            {/* 이전 버튼 */}
            <Button
              variant='ghost'
              onClick={onPrev}
              disabled={currentSlide === 0}
              className='flex items-center gap-2 disabled:opacity-50 h-10'
              aria-label='이전 슬라이드로 이동'
            >
              <ChevronLeft className='w-4 h-4' />
              이전
            </Button>

            {/* 진행 표시기 */}
            <div
              className='flex justify-center space-x-2'
              role='tablist'
              aria-label='슬라이드 진행 상황'
            >
              {Array.from({ length: totalSlides }).map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-border'
                  }`}
                  role='tab'
                  aria-selected={index === currentSlide}
                  aria-label={`${index + 1}번째 슬라이드`}
                />
              ))}
            </div>

            {/* 다음 버튼 */}
            <Button
              onClick={onNext}
              className='flex items-center gap-2 bg-primary hover:bg-primary-dark text-primary-foreground px-6 py-2 rounded-full shadow-soft h-10'
              aria-label={isLastSlide ? '온보딩 완료' : '다음 슬라이드로 이동'}
            >
              {isLastSlide ? '시작하기' : '다음'}
              {!isLastSlide && <ChevronRight className='w-4 h-4' />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
