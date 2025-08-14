import { ChevronLeft, ChevronRight } from 'lucide-react';
import { memo, useState } from 'react';

import { Button } from '@/components/ui/interactive/button';

interface OnboardingSlideProps {
  title: string;
  description: string;
  imageSrc: string;
  currentSlide: number;
  totalSlides: number;
  onNext: () => void;
  onPrev: () => void;
  isLastSlide: boolean;
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
  className,
}: OnboardingSlideProps) {
  const [imageError, setImageError] = useState(false);

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

  // 슬라이드별 레이아웃 방향 결정
  const getLayoutDirection = () => {
    if (currentSlide === 1) {
      return 'flex-col md:flex-row-reverse'; // 두번째 슬라이드: 이미지 오른쪽, 텍스트 왼쪽
    }
    return 'flex-col md:flex-row'; // 첫번째, 세번째 슬라이드: 이미지 왼쪽, 텍스트 오른쪽
  };

  return (
    <div
      className={`min-h-screen bg-gradient-warm flex flex-col items-center justify-center p-6 ${className || ''}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role='main'
      aria-label='온보딩 슬라이드'
    >
      <div className='w-full max-w-2xl md:max-w-6xl lg:max-w-7xl mx-auto'>
        {/* 메인 콘텐츠 */}
        <div
          className={`flex ${getLayoutDirection()} items-center gap-8 md:gap-16 animate-fade-in`}
        >
          {/* 이미지 */}
          <div className='w-80 h-80 md:w-[32rem] md:h-[32rem] lg:w-[36rem] lg:h-[36rem] mx-auto md:mx-0 flex-shrink-0 animate-float flex items-center justify-center'>
            {!imageError ? (
              <img
                src={imageSrc}
                alt={title}
                className='max-w-full max-h-full object-contain rounded-2xl'
                onError={handleImageError}
                loading='lazy'
              />
            ) : (
              <div className='w-full h-full bg-muted rounded-2xl flex items-center justify-center'>
                <p className='text-muted-foreground text-sm'>
                  이미지를 불러올 수 없습니다
                </p>
              </div>
            )}
          </div>

          {/* 텍스트 콘텐츠 */}
          <div className='flex-1 space-y-4 text-center md:text-left'>
            <h1 className='text-xl md:text-3xl lg:text-4xl font-bold text-foreground break-keep leading-tight tracking-wide'>
              {title}
            </h1>
            <div className='min-h-[3.5rem] flex items-center justify-center md:justify-start'>
              <p className='text-muted-foreground text-sm md:text-lg lg:text-xl leading-relaxed tracking-wide font-medium max-w-2xl break-keep'>
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* 네비게이션 영역 */}
        <div className='flex flex-col space-y-4 mt-16 max-w-md mx-auto'>
          {/* 상단: 이전, 진행 표시기, 다음 버튼 */}
          <div className='flex justify-between items-center'>
            {/* 이전 버튼 */}
            <Button
              variant='ghost'
              onClick={onPrev}
              disabled={currentSlide === 0}
              className='flex items-center gap-2 disabled:opacity-50'
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
              className='flex items-center gap-2 bg-primary hover:bg-primary-dark text-primary-foreground px-6 py-2 rounded-full shadow-soft'
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
