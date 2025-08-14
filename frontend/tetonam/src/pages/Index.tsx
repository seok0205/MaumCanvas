import { useRedirectLogic } from '@/hooks/useRedirectLogic';
import { Brush, Palette, Smile } from 'lucide-react';

// 애니메이션 스타일 추상화
const animationStyles = {
  canvas:
    'relative w-40 h-32 mx-auto mb-6 bg-white rounded-2xl border-4 border-mint/30 shadow-soft transform rotate-2 animate-pulse-gentle',
  canvasInner:
    'absolute inset-3 bg-gradient-to-br from-mint/20 via-yellow/20 to-light-blue/20 rounded-xl',
  colorDot: 'absolute rounded-full opacity-80 animate-ping',
  palette: 'absolute -right-10 top-6 transform rotate-12 animate-float',
  brush: 'absolute -left-10 top-8 transform -rotate-45 animate-bounce-gentle',
  smile:
    'absolute -top-3 left-1/2 transform -translate-x-1/2 animate-pulse-gentle',
  loadingDot: 'w-3 h-3 bg-mint rounded-full animate-bounce',
} as const;

// 색상 점 컴포넌트
const ColorDot = ({
  top,
  left,
  right,
  bottom,
  size,
  color,
  delay,
}: {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  size: string;
  color: string;
  delay: string;
}) => (
  <div
    className={`${animationStyles.colorDot} ${size} ${color}`}
    style={{
      top,
      left,
      right,
      bottom,
      animationDelay: delay,
    }}
  />
);

// 로딩 도트 컴포넌트
const LoadingDots = () => (
  <div className='flex justify-center mt-8 space-x-2'>
    <div className={animationStyles.loadingDot}></div>
    <div className={`${animationStyles.loadingDot} animation-delay-100`}></div>
    <div className={`${animationStyles.loadingDot} animation-delay-200`}></div>
  </div>
);

export const Index = () => {
  useRedirectLogic();

  // 리다이렉트하는 동안 로딩 화면 표시
  return (
    <div className='min-h-screen bg-gradient-to-br from-mint/10 via-yellow/5 to-light-blue/10 flex items-center justify-center overflow-hidden'>
      <div className='text-center animate-fade-in'>
        {/* 애니메이션 캔버스와 학생 */}
        <div className='relative mb-10'>
          {/* 캔버스 */}
          <div className={animationStyles.canvas}>
            <div className={animationStyles.canvasInner}>
              {/* 그림 요소들 */}
              <ColorDot
                top='0.75rem'
                left='0.75rem'
                size='w-4 h-4'
                color='bg-mint'
                delay='100ms'
              />
              <ColorDot
                top='1.5rem'
                right='1rem'
                size='w-3 h-3'
                color='bg-light-blue'
                delay='300ms'
              />
              <ColorDot
                bottom='1rem'
                left='1.5rem'
                size='w-5 h-2'
                color='bg-yellow'
                delay='500ms'
              />
            </div>
          </div>

          {/* 팔레트 */}
          <div className={animationStyles.palette}>
            <Palette className='w-10 h-10 text-mint drop-shadow-md' />
          </div>

          {/* 붓 */}
          <div className={animationStyles.brush}>
            <Brush className='w-8 h-8 text-yellow drop-shadow-md' />
          </div>

          {/* 웃는 얼굴 */}
          <div className={animationStyles.smile}>
            <Smile className='w-8 h-8 text-light-blue drop-shadow-md' />
          </div>

          {/* 색상 점들 - 흩어지는 효과 */}
          <div className='absolute inset-0 pointer-events-none'>
            <ColorDot
              top='3rem'
              left='5rem'
              size='w-2 h-2'
              color='bg-mint'
              delay='200ms'
            />
            <ColorDot
              top='4rem'
              right='4rem'
              size='w-2 h-2'
              color='bg-light-blue'
              delay='400ms'
            />
            <ColorDot
              bottom='3rem'
              left='6rem'
              size='w-2 h-2'
              color='bg-yellow'
              delay='600ms'
            />
            <ColorDot
              bottom='4rem'
              right='5rem'
              size='w-2 h-2'
              color='bg-lilac'
              delay='800ms'
            />
          </div>
        </div>

        <h1 className='text-4xl font-bold text-foreground mb-6 animate-pulse-gentle'>
          마음 캔버스 ✨
        </h1>
        <p className='text-lg text-muted-foreground animate-pulse-gentle animation-delay-300 leading-relaxed'>
          당신만의 마음 캔버스를 준비하고 있어요... 🌈
        </p>

        <LoadingDots />
      </div>
    </div>
  );
};
