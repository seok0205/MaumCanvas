import { WelcomeMessageSkeleton } from '@/components/ui/layout/skeleton';
import type { UserRole } from '@/constants/userRoles';
import { useDashboardData } from '@/hooks/useDashboardData';
import { memo, useMemo } from 'react';

interface WelcomeSectionProps {
  userRole: UserRole;
  userName?: string; // 병렬 로딩된 데이터를 받기 위한 optional prop
  isLoading?: boolean; // 개별 로딩 상태
}

export const WelcomeSection = memo<WelcomeSectionProps>(({ 
  userRole, 
  userName: propUserName, 
  isLoading: propIsLoading 
}) => {
  // 🔥 병렬 로딩: props로 받은 데이터 우선 사용, 없으면 개별 hook 사용
  const { data, isLoading } = useDashboardData();
  const userName = propUserName ?? data.userInfo?.name;
  const isUserInfoLoading = propIsLoading ?? (isLoading && !data.userInfo);

  // 메시지들을 useMemo로 메모이제이션하여 불필요한 재계산 방지
  const welcomeMessage = useMemo(() => {
    const name = userName || '사용자';
    const messages = {
      COUNSELOR: `안녕하세요, ${name} 상담사님!`,
      USER: `안녕하세요, ${name}님!`,
      ADMIN: `안녕하세요, ${name} 관리자님!`,
    };
    return messages[userRole] || `안녕하세요, ${name}님!`;
  }, [userName, userRole]);

  const subtitle = useMemo(() => {
    const subtitles = {
      COUNSELOR: '오늘도 따뜻한 마음으로 학생들과 함께해주세요. 💚',
      USER: '오늘도 따뜻한 마음으로 함께하는 상담을 시작해보세요. 💙',
      ADMIN: '오늘도 효율적인 관리 시스템을 운영해주세요. 💜',
    };
    return subtitles[userRole] || '오늘도 좋은 하루 되세요. 🌈';
  }, [userRole]);

  // 로딩 중일 때 스켈레톤 UI 표시 - LCP 최적화
  if (isUserInfoLoading) {
    return <WelcomeMessageSkeleton />;
  }

  return (
    <div
      className='
        rounded-2xl p-8
        bg-white
        border border-border/30 shadow-soft
      '
      role='banner'
      aria-label='환영 메시지'
    >
      <h1 className='text-3xl font-bold text-foreground mb-3 leading-tight'>
        {welcomeMessage}
      </h1>
      <p className='text-muted-foreground text-lg leading-relaxed'>
        {subtitle}
      </p>
    </div>
  );
});

WelcomeSection.displayName = 'WelcomeSection';
