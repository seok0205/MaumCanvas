import { cn } from '@/utils/cn';
import { memo } from 'react';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

/**
 * 환영 메시지용 스켈레톤 컴포넌트
 * LCP 최적화를 위한 고정 높이 및 레이아웃 안정화
 */
const WelcomeMessageSkeleton = memo(() => (
  <div
    className='
      rounded-2xl p-8
      bg-white
      border border-border/30 shadow-soft
      motion-safe:animate-pulse
    '
    role='presentation'
    aria-label='환영 메시지 로딩 중'
  >
    {/* 제목 스켈레톤 - 고정 높이로 Layout Shift 방지 */}
    <div className='mb-3 h-9 space-y-0'>
      <Skeleton className='h-9 w-64 rounded-lg' aria-hidden='true' />
    </div>

    {/* 부제목 스켈레톤 */}
    <div className='space-y-2'>
      <Skeleton className='h-5 w-80 rounded' aria-hidden='true' />
    </div>
  </div>
));

WelcomeMessageSkeleton.displayName = 'WelcomeMessageSkeleton';

export { Skeleton, WelcomeMessageSkeleton };
