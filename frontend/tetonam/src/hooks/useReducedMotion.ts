import { useEffect, useState } from 'react';

/**
 * 훅: 사용자의 prefers-reduced-motion 설정을 감지합니다.
 * 모션 감소 플래그 boolean 값을 반환합니다.
 */
export const useReducedMotion = () => {
  const [reduceMotion, setReduceMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', handler);
    return () => {
      mq.removeEventListener('change', handler);
    };
  }, []);

  return reduceMotion;
};
