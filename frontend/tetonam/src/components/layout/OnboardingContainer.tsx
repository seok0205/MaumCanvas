import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ONBOARDING_DATA } from '@/constants/onboarding';
import { useAuthStore } from '@/stores/useAuthStore';
import { OnboardingSlide } from './OnboardingSlide';

interface OnboardingContainerProps {
  className?: string;
}

export function OnboardingContainer({ className }: OnboardingContainerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { setCompletedOnboarding } = useAuthStore();
  const navigate = useNavigate();

  const handleComplete = useCallback(() => {
    setCompletedOnboarding(true);
    navigate('/user-role-selection');
  }, [setCompletedOnboarding, navigate]);

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

  const handleSkip = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

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
      onSkip={handleSkip}
      isLastSlide={currentSlide === ONBOARDING_DATA.length - 1}
      {...(className && { className })}
    />
  );
}
