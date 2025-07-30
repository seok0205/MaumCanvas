import { useRedirectLogic } from '@/hooks/useRedirectLogic';
import { Brush, Palette, Smile } from 'lucide-react';

// 애니메이션 스타일 추상화
const animationStyles = {
  canvas:
    'relative w-32 h-24 mx-auto mb-4 bg-white rounded-lg border-4 border-primary/20 shadow-lg transform rotate-2 animate-pulse',
  canvasInner:
    'absolute inset-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded',
  colorDot: 'absolute rounded-full opacity-70 animate-ping',
  palette: 'absolute -right-8 top-4 transform rotate-12 animate-float',
  brush: 'absolute -left-8 top-6 transform -rotate-45 animate-bounce',
  smile: 'absolute -top-2 left-1/2 transform -translate-x-1/2 animate-pulse',
  loadingDot: 'w-2 h-2 bg-primary rounded-full animate-bounce',
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
  <div className='flex justify-center mt-6 space-x-1'>
    <div className={animationStyles.loadingDot}></div>
    <div className={`${animationStyles.loadingDot} animation-delay-100`}></div>
    <div className={`${animationStyles.loadingDot} animation-delay-200`}></div>
  </div>
);

export const Index = () => {
  useRedirectLogic();

  // 리다이렉트하는 동안 로딩 화면 표시
  return (
    <div className='min-h-screen bg-gradient-warm flex items-center justify-center overflow-hidden'>
      <div className='text-center animate-fade-in'>
        {/* 애니메이션 캔버스와 학생 */}
        <div className='relative mb-8'>
          {/* 캔버스 */}
          <div className={animationStyles.canvas}>
            <div className={animationStyles.canvasInner}>
              {/* 그림 요소들 */}
              <ColorDot
                top='0.5rem'
                left='0.5rem'
                size='w-3 h-3'
                color='bg-red-400'
                delay='100ms'
              />
              <ColorDot
                top='1rem'
                right='0.75rem'
                size='w-2 h-2'
                color='bg-blue-400'
                delay='300ms'
              />
              <ColorDot
                bottom='0.75rem'
                left='1rem'
                size='w-4 h-1'
                color='bg-green-400'
                delay='500ms'
              />
            </div>
          </div>

          {/* 팔레트 */}
          <div className={animationStyles.palette}>
            <Palette className='w-8 h-8 text-primary drop-shadow-md' />
          </div>

          {/* 붓 */}
          <div className={animationStyles.brush}>
            <Brush className='w-6 h-6 text-secondary drop-shadow-md' />
          </div>

          {/* 웃는 얼굴 */}
          <div className={animationStyles.smile}>
            <Smile className='w-6 h-6 text-yellow-500 drop-shadow-md' />
          </div>

          {/* 색상 점들 - 흩어지는 효과 */}
          <div className='absolute inset-0 pointer-events-none'>
            <ColorDot
              top='2rem'
              left='4rem'
              size='w-1 h-1'
              color='bg-red-400'
              delay='200ms'
            />
            <ColorDot
              top='3rem'
              right='3rem'
              size='w-1 h-1'
              color='bg-blue-400'
              delay='400ms'
            />
            <ColorDot
              bottom='2rem'
              left='5rem'
              size='w-1 h-1'
              color='bg-green-400'
              delay='600ms'
            />
            <ColorDot
              bottom='3rem'
              right='4rem'
              size='w-1 h-1'
              color='bg-purple-400'
              delay='800ms'
            />
          </div>
        </div>

        <h1 className='text-3xl font-bold text-foreground mb-4 animate-pulse'>
          마음 캔버스
        </h1>
        <p className='text-muted-foreground animate-pulse animation-delay-300'>
          창의적인 마음의 여행을 준비하고 있어요...
        </p>

        <LoadingDots />
      </div>
    </div>
  );
};
