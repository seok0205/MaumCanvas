// 외부 라이브러리

// 내부 모듈
import { useSidebar } from '@/components/ui/navigation/sidebar';
import {
  DAILY_TIPS,
  DASHBOARD_CONSTANTS,
} from '@/constants/dashboard';
import type { User } from '@/types/user';
import { getPrimaryRole } from '@/utils/userRoleMapping';
// 학생 대시보드와 동일한 API 기반 구성 재사용
import { UpcomingCounselingCard } from './UpcomingCounselingCard';
// NOTE: 상담사 전용 개별 Hook 활성화
import { useCounselorUpcomingCounseling } from '@/hooks/useCounselorUpcomingCounseling';
import { useUserHomeInfo } from '@/hooks/useUserHomeInfo';
import { CommunityGuidelinesCard } from './CommunityGuidelinesCard';
import { DailyTips } from './DailyTips';
import { QuickStartSection } from './QuickStartSection';
import { StatisticsCard } from './StatisticsCard';
import { WelcomeSection } from './WelcomeSection';

interface CounselorDashboardProps {
  user: User;
}

export const CounselorDashboard = ({ user }: CounselorDashboardProps) => {
  const { state } = useSidebar();
  const primaryRole = getPrimaryRole(user.roles);

  // 🔥 NEW: 사용자 정보 조회 (WelcomeSection에 전달하기 위함)
  const { userName, isLoading: isUserInfoLoading } = useUserHomeInfo();

  // 상담사 전용 다가오는 상담 데이터 조회 - TanStack Query Best Practice 적용
  const {
    upcoming: counselorUpcoming,
    isLoading: isCounselorUpcomingLoading,
    error: counselorUpcomingError,
    refetch: refetchCounselorUpcoming,
  } = useCounselorUpcomingCounseling();

  // 사이드바가 expanded 상태일 때 더 많은 패딩 적용
  const paddingClass = state === 'expanded' ? 'p-8' : 'p-6';

  return (
    <div className={`${paddingClass} space-y-8`}>
      {/* 환영 메시지 - 사용자 정보 props 전달 */}
      <div>
        <WelcomeSection 
          userRole={primaryRole} 
          {...(userName && { userName })}
          isLoading={isUserInfoLoading}
        />
      </div>

      {/* 퀵 시작 섹션 */}
      <QuickStartSection
        actions={DASHBOARD_CONSTANTS.QUICK_ACTIONS.COUNSELOR}
        userRole={primaryRole === 'COUNSELOR' ? 'COUNSELOR' : 'USER'}
      />

      {/* 내 활동 섹션 */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* 다가오는 상담: 상담사 전용 Hook으로 교체하여 올바른 데이터 표시 */}
        <div>
          <UpcomingCounselingCard
            counselingData={counselorUpcoming}
            isLoading={isCounselorUpcomingLoading}
            isFetching={false} // 현재 Hook에서 별도 isFetching 제공하지 않음
            error={counselorUpcomingError}
            onRefresh={refetchCounselorUpcoming}
          />
        </div>

        {/* 자기 진단 결과 */}
        <div>
          <StatisticsCard />
        </div>
      </div>

      {/* 커뮤니티 가이드라인 및 오늘의 팁 */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* 전문가 행동강령 */}
        <div>
          <CommunityGuidelinesCard />
        </div>
        {/* 오늘의 팁 */}
        <div>
          <DailyTips
            tips={DAILY_TIPS.COUNSELOR}
            userRole={primaryRole === 'COUNSELOR' ? 'COUNSELOR' : 'USER'}
          />
        </div>
      </div>
    </div>
  );
};
