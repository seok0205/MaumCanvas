import { Button } from '@/components/ui/interactive/button';
import { UserTypeCard } from '@/components/ui/UserTypeCard';
import { useAuthStore } from '@/stores/useAuthStore';
import type { UserType } from '@/types/user';
import { GraduationCap, Heart } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 상수 데이터 분리
const USER_TYPES = [
  {
    type: 'user' as const,
    title: '학생으로 시작하기',
    description: '상담을 받고 싶은 청소년',
    icon: GraduationCap,
  },
  {
    type: 'counselor' as const,
    title: '상담사로 시작하기',
    description: '전문 그림 상담사',
    icon: Heart,
  },
] as const;

// 스타일 추상화
const styles = {
  container:
    'min-h-screen bg-gradient-warm flex flex-col items-center justify-center p-6',
  content: 'w-full max-w-4xl mx-auto',
  header: 'text-center mb-12 animate-fade-in',
  titleContainer: 'flex items-center justify-center mb-6',
  title: 'text-3xl font-bold text-foreground',
  subtitle: 'text-muted-foreground text-lg',
  sectionTitle: 'text-2xl font-semibold text-foreground mb-4',
  grid: 'grid grid-cols-1 md:grid-cols-2 gap-6 mb-8',
  buttonContainer: 'text-center space-y-4',
  primaryButton:
    'bg-primary hover:bg-primary-dark text-primary-foreground px-8 py-3 rounded-full shadow-soft disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium min-w-[200px]',
  linkText: 'text-muted-foreground',
  linkButton: 'text-primary hover:text-primary-dark p-0 h-auto font-normal',
} as const;

export const UserTypeSelection = () => {
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const { setSelectedUserType } = useAuthStore();
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedType) {
      setSelectedUserType(selectedType);
      navigate('/register');
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <Heart className='w-8 h-8 text-primary mr-3' />
            <h1 className={styles.title}>마음 캔버스</h1>
          </div>
          <p className={styles.subtitle}>
            당신의 마음을 이야기하는 따뜻한 공간
          </p>
        </div>

        <div className='text-center mb-8'>
          <h2 className={styles.sectionTitle}>어떤 방식으로 이용하시겠어요?</h2>
        </div>

        <div className={styles.grid}>
          {USER_TYPES.map(userType => (
            <UserTypeCard
              key={userType.type}
              userType={userType.type}
              title={userType.title}
              description={userType.description}
              icon={userType.icon}
              onSelect={setSelectedType}
              isSelected={selectedType === userType.type}
            />
          ))}
        </div>

        <div className={styles.buttonContainer}>
          <Button
            onClick={handleContinue}
            disabled={!selectedType}
            className={styles.primaryButton}
          >
            회원가입하기
          </Button>

          <p className={styles.linkText}>
            이미 계정이 있으신가요?{' '}
            <Button
              variant='link'
              onClick={handleLogin}
              className={styles.linkButton}
            >
              로그인하기
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};
