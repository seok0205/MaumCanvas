import type { QuickAction } from '@/types/dashboard';
import { BookOpen, Calendar, Heart, MessageSquare, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QuickStartCard } from './QuickStartCard';
import { useCounselingJoin } from '@/hooks/useCounselingJoin';

interface QuickStartSectionProps {
  actions: readonly QuickAction[];
  userRole: 'COUNSELOR' | 'USER';
}

// 컴포넌트 외부로 이동하여 캐싱 처리 제거
const getIcon = (title: string) => {
  const iconMap = {
    '내 일정 관리하기': Calendar,
    '학생 상담 시작하기': Users,
    커뮤니티: MessageSquare,
    '상담 예약하기': Heart,
    '내 마음 진단하기': BookOpen,
  };
  return iconMap[title as keyof typeof iconMap] || Users;
};

const getIconStyles = (index: number) => {
  const styles = [
    { bg: 'bg-mint/20', color: 'text-mint-dark' },
    { bg: 'bg-yellow/20', color: 'text-yellow-dark' },
    { bg: 'bg-light-blue/20', color: 'text-light-blue-dark' },
    { bg: 'bg-lilac/20', color: 'text-lilac-dark' },
    { bg: 'bg-peach/20', color: 'text-peach-dark' },
  ] as const;
  return styles[index % styles.length]!;
};

export const QuickStartSection = ({
  actions,
  userRole,
}: QuickStartSectionProps) => {
  const navigate = useNavigate();
  
  // 🔥 NEW: 상담 입장 로직 훅 사용
  const { joinUpcomingCounseling, hasUpcomingCounseling } = useCounselingJoin();

  const handleAction = (action: QuickAction) => {
    switch (action.title) {
      case '내 마음 진단하기':
        navigate('/diagnosis');
        break;
      case '상담 예약하기':
        navigate('/counseling-reservation');
        break;
      case '커뮤니티':
        navigate('/community');
        break;
      case '내 일정 관리하기':
        navigate('/counseling-management');
        break;
      case '학생 상담 시작하기':
        // 🔥 NEW: "다가오는 상담"의 "입장하기"와 동일한 로직 적용
        if (hasUpcomingCounseling) {
          joinUpcomingCounseling();
        } else {
          // 다가오는 상담이 없으면 상담 예약 페이지로 안내
          console.warn('다가오는 상담이 없습니다. 상담 예약 페이지로 이동합니다.');
          navigate('/counseling-reservation');
        }
        break;
      default:
        // 기본 동작 없음
        break;
    }
  };

  return (
    <div>
      <h2 className='text-2xl font-semibold text-foreground mb-6'>
        {userRole === 'COUNSELOR' ? '바로가기' : '바로가기'}
      </h2>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch'>
        {actions.map((action, index) => {
          const Icon = getIcon(action.title);
          const { bg, color } = getIconStyles(index);

          return (
            <QuickStartCard
              key={action.title}
              title={action.title}
              description={action.description}
              icon={Icon}
              actionText={action.actionText}
              variant={action.variant}
              onAction={() => handleAction(action)}
              bgColor={bg}
              iconColor={color}
            />
          );
        })}
      </div>
    </div>
  );
};
