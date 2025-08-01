import type { UserType } from '@/types/dashboard';

interface WelcomeSectionProps {
  userName: string;
  userType: UserType;
}

export const WelcomeSection = ({ userName, userType }: WelcomeSectionProps) => {
  const getWelcomeMessage = (name: string, type: UserType) => {
    const messages = {
      counselor: `안녕하세요, ${name} 상담사님! 👩‍⚕️`,
      user: `안녕하세요, ${name}님! 👋`,
    };
    return messages[type] || `안녕하세요, ${name}님!`;
  };

  const getSubtitle = (type: UserType) => {
    const subtitles = {
      counselor: '오늘도 따뜻한 마음으로 학생들과 함께해주세요.',
      user: '오늘도 따뜻한 마음으로 함께하는 상담을 시작해보세요.',
    };
    return subtitles[type] || '오늘도 좋은 하루 되세요.';
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
        {getWelcomeMessage(userName, userType)}
      </h1>
      <p className='text-muted-foreground'>{getSubtitle(userType)}</p>
    </div>
  );
};
