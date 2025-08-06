// 외부 라이브러리

// 내부 모듈
import { useSidebar } from '@/components/ui/navigation/sidebar';
import {
  DAILY_TIPS,
  DASHBOARD_CONSTANTS,
  MOCK_APPOINTMENTS,
  MOCK_STATS,
} from '@/constants/dashboard';
import type { CommunityActivity as CommunityActivityType } from '@/types/dashboard';
import type { User } from '@/types/user';
import { getPrimaryRole } from '@/utils/userRoleMapping';
import { AppointmentCard } from './AppointmentCard';
import { CommunityActivity } from './CommunityActivity';
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

  // 사이드바가 expanded 상태일 때 더 많은 패딩 적용
  const paddingClass = state === 'expanded' ? 'p-8' : 'p-6';

  const communityActivities: CommunityActivityType[] = [
    {
      title: '스트레스 관리법',
      description: '학생들을 위한 효과적인 스트레스 관리 방법을 공유했습니다.',
      type: 'contribution',
    },
    {
      title: '진로 상담 노하우',
      description: '진로 고민 학생들을 위한 상담 접근법을 공유했습니다.',
      type: 'contribution',
    },
  ];

  return (
    <div className={`${paddingClass} space-y-8`}>
      {/* 환영 메시지 */}
      <div>
        <WelcomeSection userName={user.name} userRole={primaryRole} />
      </div>

      {/* 퀵 시작 섹션 */}
      <QuickStartSection
        actions={DASHBOARD_CONSTANTS.QUICK_ACTIONS.COUNSELOR}
        userRole={primaryRole === 'COUNSELOR' ? 'COUNSELOR' : 'USER'}
      />

      {/* 내 활동 섹션 */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* 다가오는 상담 */}
        <div>
          <AppointmentCard
            appointments={MOCK_APPOINTMENTS.COUNSELOR}
            userRole={primaryRole === 'COUNSELOR' ? 'COUNSELOR' : 'USER'}
          />
        </div>

        {/* 자기 진단 결과 */}
        <div>
          <StatisticsCard stats={MOCK_STATS.COUNSELOR} />
        </div>
      </div>

      {/* 커뮤니티 활동 및 오늘의 팁 */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* 커뮤니티 활동 */}
        <div>
          <CommunityActivity activities={communityActivities} />
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
