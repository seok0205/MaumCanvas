import type { UserRole } from '@/constants/userRoles';
import { useUserHomeInfo } from '@/hooks/useUserHomeInfo';

interface WelcomeSectionProps {
  userRole: UserRole;
}

export const WelcomeSection = ({ userRole }: WelcomeSectionProps) => {
  // API에서 사용자 이름 조회
  const { userName, isLoading: isUserInfoLoading } = useUserHomeInfo();

  const getWelcomeMessage = (name: string, role: UserRole) => {
    const messages = {
      COUNSELOR: `안녕하세요, ${name} 상담사님!`,
      USER: `안녕하세요, ${name}님!`,
      ADMIN: `안녕하세요, ${name} 관리자님!`,
    };
    return messages[role] || `안녕하세요, ${name}님!`;
  };

  const getSubtitle = (role: UserRole) => {
    const subtitles = {
      COUNSELOR: '오늘도 따뜻한 마음으로 학생들과 함께해주세요. 💚',
      USER: '오늘도 따뜻한 마음으로 함께하는 상담을 시작해보세요. 💙',
      ADMIN: '오늘도 효율적인 관리 시스템을 운영해주세요. 💜',
    };
    return subtitles[role] || '오늘도 좋은 하루 되세요. 🌈';
  };

  // 로딩 중이거나 사용자 이름이 없을 때 처리
  const displayName = isUserInfoLoading ? '로딩 중...' : userName || '사용자';

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
        {getWelcomeMessage(displayName, userRole)}
      </h1>
      <p className='text-muted-foreground text-lg leading-relaxed'>
        {getSubtitle(userRole)}
      </p>
    </div>
  );
};
