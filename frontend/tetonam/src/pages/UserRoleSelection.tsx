import { Button } from '@/components/ui/interactive/button';
import { UserRoleCard } from '@/components/ui/UserRoleCard';
import type { UserRole } from '@/constants/userRoles';
import { useAuthStore } from '@/stores/useAuthStore';
import { GraduationCap, Loader2, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 상수 데이터 분리
const USER_TYPES = [
  {
    type: 'USER' as const,
    title: '학생으로 시작하기',
    description: '상담을 받고 싶은 청소년',
    icon: GraduationCap,
  },
  {
    type: 'COUNSELOR' as const,
    title: '상담사로 시작하기',
    description: '전문 그림 상담사',
    icon: UserCheck,
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

export const UserRoleSelection = () => {
  const [selectedType, setSelectedType] = useState<UserRole | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const { setSelectedUserRole } = useAuthStore();
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedType) {
      setIsNavigating(true);
      setSelectedUserRole(selectedType);
      navigate('/register');
    } else {
      // 사용자에게 선택하라는 안내 메시지 표시
      console.warn('사용자 타입을 선택해주세요');
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
            <img
              src='/logo.png'
              alt='마음 캔버스 로고'
              className='w-8 h-8 object-contain mr-3'
            />
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
          {USER_TYPES.map(userRole => (
            <UserRoleCard
              key={userRole.type}
              userRole={userRole.type}
              title={userRole.title}
              description={userRole.description}
              icon={userRole.icon}
              onSelect={setSelectedType}
              isSelected={selectedType === userRole.type}
            />
          ))}
        </div>

        <div className={styles.buttonContainer}>
          <Button
            onClick={handleContinue}
            disabled={!selectedType || isNavigating}
            className={styles.primaryButton}
          >
            {isNavigating ? (
              <div className='flex items-center space-x-2'>
                <Loader2 className='w-5 h-5 animate-spin' />
                <span>이동 중...</span>
              </div>
            ) : (
              '회원가입하기'
            )}
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
