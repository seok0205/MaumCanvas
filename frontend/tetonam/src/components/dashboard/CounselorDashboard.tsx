// 외부 라이브러리

// 내부 모듈
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
  const primaryRole = getPrimaryRole(user.roles);

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
    <div className='p-6 space-y-6'>
      {/* 환영 메시지 */}
      <WelcomeSection userName={user.name} userRole={primaryRole} />

      {/* 퀵 시작 섹션 */}
      <QuickStartSection
        actions={DASHBOARD_CONSTANTS.QUICK_ACTIONS.COUNSELOR}
        userRole='COUNSELOR' // 임시로 기존 값 사용
      />

      {/* 내 활동 섹션 */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* 다가오는 상담 */}
        <AppointmentCard
          appointments={MOCK_APPOINTMENTS.COUNSELOR}
          userRole='COUNSELOR' // 임시로 기존 값 사용
        />

        {/* 자기 진단 결과 */}
        <StatisticsCard stats={MOCK_STATS.COUNSELOR} />
      </div>

      {/* 커뮤니티 활동 및 오늘의 팁 */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* 커뮤니티 활동 */}
        <CommunityActivity activities={communityActivities} />
        {/* 오늘의 팁 */}
        <DailyTips tips={DAILY_TIPS.COUNSELOR} userRole='COUNSELOR' />{' '}
        {/* 임시로 기존 값 사용 */}
      </div>
    </div>
  );
};
