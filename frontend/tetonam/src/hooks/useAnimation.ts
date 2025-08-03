import { useEffect, useState } from 'react';

interface UseAnimationOptions {
  delay?: number;
  duration?: number;
  disabled?: boolean;
}

export const useAnimation = (options: UseAnimationOptions = {}) => {
  const { delay = 0, duration = 300, disabled = false } = options;
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (disabled) {
      setHasAnimated(true);
      return;
    }

    const timer = setTimeout(() => {
      if (!hasAnimated) {
        setIsAnimating(true);
        setHasAnimated(true);

        // 애니메이션 완료 후 상태 정리
        const animationTimer = setTimeout(() => {
          setIsAnimating(false);
        }, duration);

        return () => clearTimeout(animationTimer);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, duration, disabled, hasAnimated]);

  const triggerAnimation = () => {
    if (!disabled && !hasAnimated) {
      setIsAnimating(true);
      setHasAnimated(true);

      setTimeout(() => {
        setIsAnimating(false);
      }, duration);
    }
  };

  return {
    hasAnimated,
    isAnimating,
    triggerAnimation,
    shouldAnimate: !disabled && !hasAnimated,
  };
};

// GPU 가속을 위한 유틸리티 훅
export const useGPUAcceleration = () => {
  const gpuClass = 'transform-gpu will-change-transform';

  return {
    gpuClass,
    gpuStyle: {
      transform: 'translateZ(0)',
      willChange: 'transform',
    },
  };
};

// 접근성 설정을 위한 훅
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};
