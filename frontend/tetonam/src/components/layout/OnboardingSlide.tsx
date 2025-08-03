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

  return (
    <div
      className={`min-h-screen bg-gradient-warm flex flex-col items-center justify-center p-6 ${className || ''}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role='main'
      aria-label='온보딩 슬라이드'
    >
      <div className='w-full max-w-2xl md:max-w-4xl lg:max-w-6xl mx-auto'>
        {/* 메인 콘텐츠 */}
        <div className='text-center space-y-8 animate-fade-in'>
          {/* 이미지 */}
          <div className='w-80 h-80 mx-auto mb-8 animate-float flex items-center justify-center'>
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
          <div className='space-y-4'>
            <h1 className='text-2xl md:text-3xl font-bold text-foreground'>
              {title}
            </h1>
            <div className='min-h-[3.5rem] flex items-center justify-center'>
              <p className='text-muted-foreground text-base md:text-lg leading-relaxed'>
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* 네비게이션 영역 */}
        <div className='flex flex-col space-y-4 mt-12 max-w-md mx-auto'>
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
