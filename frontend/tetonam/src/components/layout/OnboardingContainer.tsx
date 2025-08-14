import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ONBOARDING_DATA } from '@/constants/onboarding';
import { OnboardingSlide } from './OnboardingSlide';

interface OnboardingContainerProps {
  className?: string;
}

export function OnboardingContainer({ className }: OnboardingContainerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleComplete = useCallback(() => {
    // 온보딩 완료 상태를 저장하지 않고 바로 로그인 페이지로 이동
    navigate('/login');
  }, [navigate]);

  const handleNext = useCallback(() => {
    if (currentSlide < ONBOARDING_DATA.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentSlide, handleComplete]);

  const handlePrev = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  }, [currentSlide]);

  const currentSlideData = ONBOARDING_DATA[currentSlide]!;

  return (
    <OnboardingSlide
      title={currentSlideData.title}
      description={currentSlideData.description}
      imageSrc={currentSlideData.imageSrc}
      currentSlide={currentSlide}
      totalSlides={ONBOARDING_DATA.length}
      onNext={handleNext}
      onPrev={handlePrev}
      isLastSlide={currentSlide === ONBOARDING_DATA.length - 1}
      {...(className && { className })}
    />
  );
}
