import { Brush, Palette, Smile } from 'lucide-react';
import { cn } from '@/utils/cn';

// 애니메이션 스타일 정의
const animationStyles = {
  canvas:
    'relative mx-auto bg-white rounded-2xl border-4 border-mint/30 shadow-soft transform rotate-2 animate-pulse-gentle',
  canvasInner:
    'absolute inset-3 bg-gradient-to-br from-mint/20 via-yellow/20 to-light-blue/20 rounded-xl',
  colorDot: 'absolute rounded-full opacity-80 animate-ping',
  palette: 'absolute transform rotate-12 animate-float',
  brush: 'absolute transform -rotate-45 animate-bounce-gentle',
  smile: 'absolute transform -translate-x-1/2 animate-pulse-gentle',
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
const LoadingDots = ({ className }: { className?: string }) => (
  <div className={cn('flex justify-center space-x-2', className)}>
    <div className={animationStyles.loadingDot}></div>
    <div className={`${animationStyles.loadingDot} animation-delay-100`}></div>
    <div className={`${animationStyles.loadingDot} animation-delay-200`}></div>
  </div>
);

interface LoadingAnimationProps {
  title?: string;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  showTitle?: boolean;
  showMessage?: boolean;
  showLoadingDots?: boolean;
  className?: string;
}

/**
 * 브랜드 일관성 있는 로딩 애니메이션 컴포넌트
 * 캔버스, 팔레트, 붓 등의 창의적인 애니메이션을 제공합니다.
 */
export const LoadingAnimation = ({
  title = '마음 캔버스 ✨',
  message = '창의적인 마음의 여행을 준비하고 있어요... 🌈',
  size = 'lg',
  showTitle = true,
  showMessage = true,
  showLoadingDots = true,
  className = '',
}: LoadingAnimationProps) => {
  // 크기별 스타일 정의
  const sizeStyles = {
    sm: {
      canvas: 'w-24 h-20 mb-4',
      title: 'text-lg mb-3',
      message: 'text-sm',
      icons: 'w-6 h-6',
      iconPositions: {
        palette: '-right-6 top-3',
        brush: '-left-6 top-4',
        smile: '-top-2 left-1/2',
      },
    },
    md: {
      canvas: 'w-32 h-24 mb-5',
      title: 'text-2xl mb-4',
      message: 'text-base',
      icons: 'w-8 h-8',
      iconPositions: {
        palette: '-right-8 top-4',
        brush: '-left-8 top-5',
        smile: '-top-2 left-1/2',
      },
    },
    lg: {
      canvas: 'w-40 h-32 mb-6',
      title: 'text-4xl mb-6',
      message: 'text-lg',
      icons: 'w-10 h-10',
      iconPositions: {
        palette: '-right-10 top-6',
        brush: '-left-10 top-8',
        smile: '-top-3 left-1/2',
      },
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <div className={cn('text-center animate-fade-in', className)}>
      {/* 애니메이션 캔버스 */}
      <div className='relative'>
        {/* 캔버스 */}
        <div className={cn(animationStyles.canvas, currentSize.canvas)}>
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
        <div className={cn(animationStyles.palette, currentSize.iconPositions.palette)}>
          <Palette className={cn(currentSize.icons, 'text-mint drop-shadow-md')} />
        </div>

        {/* 붓 */}
        <div className={cn(animationStyles.brush, currentSize.iconPositions.brush)}>
          <Brush className={cn(currentSize.icons, 'text-yellow drop-shadow-md')} />
        </div>

        {/* 웃는 얼굴 */}
        <div className={cn(animationStyles.smile, currentSize.iconPositions.smile)}>
          <Smile className={cn(currentSize.icons, 'text-light-blue drop-shadow-md')} />
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

      {/* 제목 */}
      {showTitle && (
        <h1 className={cn(
          'font-bold text-foreground animate-pulse-gentle',
          currentSize.title
        )}>
          {title}
        </h1>
      )}

      {/* 메시지 */}
      {showMessage && (
        <p className={cn(
          'text-muted-foreground animate-pulse-gentle animation-delay-300 leading-relaxed',
          currentSize.message
        )}>
          {message}
        </p>
      )}

      {/* 로딩 도트 */}
      {showLoadingDots && <LoadingDots className="mt-8" />}
    </div>
  );
};
