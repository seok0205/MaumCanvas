import { useIsFetching } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface GlobalLoadingIndicatorProps {
  className?: string;
}

/**
 * 전역 로딩 인디케이터 - TanStack Query의 useIsFetching을 사용하여
 * 앱 전체에서 진행 중인 모든 쿼리의 페칭 상태를 표시합니다.
 */
export const GlobalLoadingIndicator = ({ className }: GlobalLoadingIndicatorProps) => {
  const isFetching = useIsFetching();

  if (!isFetching) return null;

  return (
    <div className={cn(
      'fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm border border-orange-200 rounded-lg px-3 py-2 shadow-lg',
      'flex items-center gap-2 text-sm text-orange-600 animate-fade-in',
      className
    )}>
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="font-medium">
        백그라운드 업데이트 중...
      </span>
    </div>
  );
};
