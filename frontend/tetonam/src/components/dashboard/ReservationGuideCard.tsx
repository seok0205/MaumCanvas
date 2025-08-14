import { Info } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/layout/card';
import { cn } from '@/utils/cn';

interface ReservationGuideCardProps {
  /**
   * 카드 스타일 variant
   * - 'reservation': 상담 예약 페이지용 (큰 그림자, 흰색 배경)
   * - 'dashboard': 대시보드용 (일관된 디자인 시스템 스타일)
   */
  variant?: 'reservation' | 'dashboard';
}

/**
 * 상담 예약 안내사항 카드 컴포넌트
 *
 * 재사용 가능한 컴포넌트로 설계되어 상담 예약 페이지와 대시보드에서 모두 사용 가능합니다.
 * variant prop을 통해 각 페이지에 맞는 시각적 효과를 적용할 수 있습니다.
 * 텍스트 줄바꿈에 의한 크기 차이를 방지하기 위해 Flexbox 레이아웃을 적용했습니다.
 */
export const ReservationGuideCard = ({
  variant = 'dashboard',
}: ReservationGuideCardProps) => {
  // variant별 스타일 정의
  const getCardStyles = () => {
    if (variant === 'reservation') {
      return {
        className: 'h-full flex flex-col bg-white border-0 drop-shadow-2xl',
        style: { boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)' },
      };
    }

    // dashboard variant (기본값)
    return {
      className: cn(
        'h-full flex flex-col',
        'p-6 shadow-card border border-border/50',
        'bg-card/80 backdrop-blur-sm',
        'micro-interaction'
      ),
      style: undefined,
    };
  };

  const cardStyles = getCardStyles();

  return (
    <Card className={cardStyles.className} style={cardStyles.style}>
      <CardHeader
        className={cn(
          'flex-shrink-0',
          variant === 'dashboard' ? 'p-0 pb-4' : ''
        )}
      >
        <CardTitle className='flex items-center gap-2 text-lg'>
          <Info className='h-5 w-5 text-blue-600' />
          예약 안내사항
        </CardTitle>
      </CardHeader>
      <CardContent
        className={cn(
          'flex-1 flex flex-col justify-center',
          variant === 'dashboard' ? 'p-0' : ''
        )}
      >
        <ul className='space-y-3 text-sm text-gray-700 dark:text-gray-300'>
          <li className='flex items-start gap-2'>
            <span className='text-blue-600 mt-0.5 flex-shrink-0'>•</span>
            <span>모든 상담 내용은 비밀이 보장됩니다</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-blue-600 mt-0.5 flex-shrink-0'>•</span>
            <span>상담 시간은 1시간입니다.</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-blue-600 mt-0.5 flex-shrink-0'>•</span>
            <span>화상상담 입장은 예약 시간 30분 전부터 가능합니다.</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-blue-600 mt-0.5 flex-shrink-0'>•</span>
            <span>
              예약시간 이후에는 입장이 불가하오니 원활한 상담 진행을 위해 예약
              시간 10분 전까지 입장 부탁드립니다.
            </span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};
