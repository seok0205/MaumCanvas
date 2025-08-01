import type { UserRole } from '@/constants/userTypes';

interface WelcomeSectionProps {
  userName: string;
  userRole: UserRole;
}

export const WelcomeSection = ({ userName, userRole }: WelcomeSectionProps) => {
  const getWelcomeMessage = (name: string, role: UserRole) => {
    const messages = {
      COUNSELOR: `안녕하세요, ${name} 상담사님! 👩‍⚕️`,
      USER: `안녕하세요, ${name}님! 👋`,
      ADMIN: `안녕하세요, ${name} 관리자님! 👨‍💼`,
    };
    return messages[role] || `안녕하세요, ${name}님!`;
  };

  const getSubtitle = (role: UserRole) => {
    const subtitles = {
      COUNSELOR: '오늘도 따뜻한 마음으로 학생들과 함께해주세요.',
      USER: '오늘도 따뜻한 마음으로 함께하는 상담을 시작해보세요.',
      ADMIN: '오늘도 효율적인 관리 시스템을 운영해주세요.',
    };
    return subtitles[role] || '오늘도 좋은 하루 되세요.';
  };

  return (
    <div
      className='
        rounded-lg p-6
        bg-gradient-to-r from-primary/10 to-secondary/10
      '
      role='banner'
      aria-label='환영 메시지'
    >
      <h1 className='text-2xl font-bold text-foreground mb-2'>
        {getWelcomeMessage(userName, userRole)}
      </h1>
      <p className='text-muted-foreground'>{getSubtitle(userRole)}</p>
    </div>
  );
};
