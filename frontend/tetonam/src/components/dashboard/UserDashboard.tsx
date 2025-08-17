// 외부 라이브러리
import { memo, useMemo } from 'react';

// 내부 모듈
import { useSidebar } from '@/components/ui/navigation/sidebar';
import { DAILY_TIPS, DASHBOARD_CONSTANTS } from '@/constants/dashboard';
import { useDashboardData } from '@/hooks/useDashboardData';
import type { User } from '@/types/user';
import { getPrimaryRole } from '@/utils/userRoleMapping';
import { DailyTips } from './DailyTips';
import { QuickStartSection } from './QuickStartSection';
import { ReservationGuideCard } from './ReservationGuideCard';
import { SelfDiagnosisCard } from './SelfDiagnosisCard';
import { UpcomingCounselingCard } from './UpcomingCounselingCard';
import { WelcomeSection } from './WelcomeSection';

interface UserDashboardProps {
  user: User;
}

export const UserDashboard = memo<UserDashboardProps>(({ user }) => {
  const { state } = useSidebar();

  // 🔥 NEW: 대시보드 전체 데이터 병렬 로딩
  const { data, isLoading } = useDashboardData();

  // useMemo로 계산 최적화
  const primaryRole = useMemo(() => getPrimaryRole(user.roles), [user.roles]);

  // 사이드바 상태에 따른 패딩 클래스 메모이제이션
  const paddingClass = useMemo(
    () => (state === 'expanded' ? 'p-8' : 'p-6'),
    [state]
  );

  // 퀵 액션과 사용자 역할 메모이제이션
  const { quickActions, userRoleForComponents } = useMemo(
    () => ({
      quickActions: DASHBOARD_CONSTANTS.QUICK_ACTIONS.USER,
      userRoleForComponents: (primaryRole === 'COUNSELOR'
        ? 'COUNSELOR'
        : 'USER') as 'COUNSELOR' | 'USER',
    }),
    [primaryRole]
  );

  // Daily Tips 메모이제이션
  const dailyTips = useMemo(() => DAILY_TIPS.USER, []);

  return (
    <div className={`${paddingClass} space-y-6`}>
      {/* 환영 메시지 - 병렬 로딩된 데이터 사용 */}
      <WelcomeSection
        userRole={primaryRole}
        {...(data.userInfo?.name && { userName: data.userInfo.name })}
        {...(isLoading && !data.userInfo && { isLoading: true })}
      />

      {/* 퀵 시작 섹션 */}
      <QuickStartSection
        actions={quickActions}
        userRole={userRoleForComponents}
      />

      {/* 상담 관리 섹션 - 병렬 로딩된 데이터 사용 */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch'>
        {/* 다가오는 상담 - 병렬 로딩 데이터 props 전달 */}
        <UpcomingCounselingCard
          counselingData={data.counseling}
          isLoading={isLoading}
          isFetching={data.counseling === null && isLoading}
        />

        {/* 예약 안내사항 */}
        <ReservationGuideCard />
      </div>

      {/* 자가 진단 결과 섹션 - 병렬 로딩된 데이터 사용 */}
      <SelfDiagnosisCard
        questionnaireData={data.questionnaire}
        isLoading={isLoading}
        isFetching={data.questionnaire === null && isLoading}
      />

      {/* 오늘의 팁 */}
      <DailyTips tips={dailyTips} userRole={userRoleForComponents} />
    </div>
  );
});

UserDashboard.displayName = 'UserDashboard';
