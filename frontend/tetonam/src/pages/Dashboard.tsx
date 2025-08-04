import { CounselorDashboard } from '@/components/dashboard/CounselorDashboard';
import { UserDashboard } from '@/components/dashboard/UserDashboard';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Alert, AlertDescription } from '@/components/ui/feedback/alert';
import { Button } from '@/components/ui/interactive/button';
import {
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/navigation/sidebar';
import { getUserRoleLabel } from '@/constants/userRoles';
import { useAuthActions } from '@/hooks/useAuthActions';
import { useAuthStore } from '@/stores/useAuthStore';
import { getPrimaryRole } from '@/utils/userRoleMapping';
import { AlertCircle, Heart, LogOut, User, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 타입 정의
interface DashboardHeaderProps {
  user: {
    name: string | null;
    roles: string[];
  };
}

const DashboardHeader = ({ user }: DashboardHeaderProps) => {
  const { logout } = useAuthActions();
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState<string | null>(null);

  // 에러 배너 자동 사라짐
  useEffect(() => {
    if (logoutError) {
      const timer = setTimeout(() => {
        setLogoutError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [logoutError]);

  // roles 배열에서 주요 역할 결정
  const primaryRole = getPrimaryRole(user.roles);

  // 로그아웃 핸들러 메모이제이션
  const handleLogout = useCallback(async () => {
    try {
      setLogoutError(null); // 기존 에러 초기화
      await logout();
    } catch (error) {
      console.error('로그아웃 실패:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : '로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.';
      setLogoutError(errorMessage);
    }
  }, [logout]);

  // 재시도 핸들러
  const handleRetry = useCallback(() => {
    handleLogout();
  }, [handleLogout]);

  // 에러 배너 닫기
  const handleCloseError = useCallback(() => {
    setLogoutError(null);
  }, []);

  // 마이페이지로 이동
  const handleMyPageClick = useCallback(() => {
    navigate('/mypage');
  }, [navigate]);

  return (
    <>
      {/* 헤더 */}
      <header className='border-b border-border/50 bg-card/80 shadow-card backdrop-blur-sm rounded-2xl mx-4 mt-4'>
        <div className='flex items-center justify-between px-4 py-4'>
          <div className='flex items-center space-x-4'>
            <SidebarTrigger className='mr-2' />
            <div className='flex items-center space-x-2'>
              <Heart className='h-5 w-5 text-primary' />
              <span className='font-bold text-lg text-foreground'>
                마음 캔버스
              </span>
            </div>
          </div>

          <div className='flex items-center space-x-2 md:space-x-4'>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleMyPageClick}
              className='flex items-center space-x-2 text-foreground hover:text-foreground hover:bg-accent'
              aria-label={`사용자 정보: ${user.name || '알 수 없는 사용자'}, 역할: ${getUserRoleLabel(primaryRole)}`}
            >
              <User
                className='h-5 w-5 text-muted-foreground'
                aria-hidden='true'
              />
              <span className='max-w-24 truncate font-medium md:max-w-none'>
                {user.name || '알 수 없는 사용자'}
              </span>
              <span className='hidden text-muted-foreground sm:inline'>
                ({getUserRoleLabel(primaryRole)})
              </span>
            </Button>

            <Button
              variant='ghost'
              size='sm'
              onClick={handleLogout}
              className='text-muted-foreground hover:text-foreground'
              aria-label='로그아웃'
            >
              <LogOut className='mr-2 h-4 w-4' aria-hidden='true' />
              <span className='hidden sm:inline'>로그아웃</span>
            </Button>
          </div>
        </div>
      </header>

      {/* 에러 알림 배너 */}
      {logoutError && (
        <Alert variant='destructive' className='mx-4 mt-4 mb-0'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription className='flex items-center justify-between'>
            <span>{logoutError}</span>
            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleRetry}
                className='h-6 px-2 text-xs'
              >
                재시도
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleCloseError}
                className='h-6 w-6 p-0'
              >
                <X className='h-3 w-3' />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

// 로딩 컴포넌트
const LoadingSpinner = () => (
  <div className='flex items-center justify-center min-h-screen bg-gradient-warm'>
    <div className='text-center'>
      <div className='mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary'></div>
      <p className='text-muted-foreground'>로딩 중...</p>
    </div>
  </div>
);

// 관리자 대시보드 컴포넌트
const AdminDashboard = () => (
  <div className='p-6'>
    <h1 className='mb-4 text-xl font-semibold text-foreground'>
      관리자 대시보드
    </h1>
    <p className='text-muted-foreground'>
      관리자 대시보드는 추후 구현 예정입니다.
    </p>
  </div>
);

// 알 수 없는 역할 컴포넌트
const UnknownRoleDashboard = () => (
  <div className='p-6'>
    <p className='text-muted-foreground'>알 수 없는 사용자 역할입니다.</p>
  </div>
);

export const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // 로딩 상태 처리
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // 인증되지 않은 상태 처리
  if (!isAuthenticated || !user) {
    return <LoadingSpinner />;
  }

  // roles 배열에서 주요 역할 결정
  const primaryRole = getPrimaryRole(user.roles);

  // 대시보드 콘텐츠 렌더링
  const renderDashboardContent = useCallback(() => {
    switch (primaryRole) {
      case 'USER':
        return <UserDashboard user={user} />;
      case 'COUNSELOR':
        return <CounselorDashboard user={user} />;
      case 'ADMIN':
        return <AdminDashboard />;
      default:
        return <UnknownRoleDashboard />;
    }
  }, [primaryRole, user]);

  return (
    <SidebarProvider>
      <div className='flex w-full min-h-screen bg-gradient-warm'>
        <AppSidebar />

        <div className='flex flex-1 flex-col'>
          <DashboardHeader user={user} />

          {/* 메인 콘텐츠 */}
          <main className='flex-1 overflow-auto'>
            {renderDashboardContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
