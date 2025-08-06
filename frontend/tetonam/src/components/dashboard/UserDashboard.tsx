// 외부 라이브러리

// 내부 모듈
import { useSidebar } from '@/components/ui/navigation/sidebar';
import { DAILY_TIPS, DASHBOARD_CONSTANTS } from '@/constants/dashboard';
import type { User } from '@/types/user';
import { getPrimaryRole } from '@/utils/userRoleMapping';
import { DailyTips } from './DailyTips';
import { QuickStartSection } from './QuickStartSection';
import { SelfDiagnosisCard } from './SelfDiagnosisCard';
import { UpcomingCounselingCard } from './UpcomingCounselingCard';
import { WelcomeSection } from './WelcomeSection';

interface UserDashboardProps {
  user: User;
}

export const UserDashboard = ({ user }: UserDashboardProps) => {
  const { state } = useSidebar();
  const primaryRole = getPrimaryRole(user.roles);

  // 사이드바가 expanded 상태일 때 더 많은 패딩 적용
  const paddingClass = state === 'expanded' ? 'p-8' : 'p-6';

  return (
    <div className={`${paddingClass} space-y-6`}>
      {/* 환영 메시지 */}
      <WelcomeSection userName={user.name} userRole={primaryRole} />
      {/* 퀵 시작 섹션 */}
      <QuickStartSection
        actions={DASHBOARD_CONSTANTS.QUICK_ACTIONS.USER}
        userRole={primaryRole === 'COUNSELOR' ? 'COUNSELOR' : 'USER'}
      />
      {/* 상담 관리 섹션 */}
      <div className='grid grid-cols-1 lg:grid-cols-1 gap-6'>
        {/* 다가오는 상담 */}
        <UpcomingCounselingCard />
      </div>
      {/* 자가 진단 결과 섹션 */}
      <SelfDiagnosisCard />
      {/* 오늘의 팁 */}
      <DailyTips
        tips={DAILY_TIPS.USER}
        userRole={primaryRole === 'COUNSELOR' ? 'COUNSELOR' : 'USER'}
      />
    </div>
  );
};
