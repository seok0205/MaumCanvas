import { CounselorDashboard } from '@/components/dashboard/CounselorDashboard';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Button } from '@/components/ui/interactive/button';
import {
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/navigation/sidebar';
import { getUserTypeLabel } from '@/constants/userTypes';
import { useAuthStore } from '@/stores/useAuthStore';
import { LogOut, Settings, User } from 'lucide-react';

export const Dashboard = () => {
  const { user, logout } = useAuthStore();

  if (!user) {
    return (
      <div className='min-h-screen bg-gradient-warm flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>로딩 중...</p>
        </div>
      </div>
    );
  }

  // 단순한 조건부 렌더링 - useMemo 불필요
  const renderDashboardContent = () => {
    switch (user.userType) {
      case 'student':
        return <StudentDashboard user={user} />;
      case 'counselor':
        return <CounselorDashboard user={user} />;
      case 'admin':
        return (
          <div className='p-6'>
            <h1 className='text-xl font-semibold text-foreground mb-4'>
              관리자 대시보드
            </h1>
            <p className='text-muted-foreground'>
              관리자 대시보드는 추후 구현 예정입니다.
            </p>
          </div>
        );
      default:
        return (
          <div className='p-6'>
            <p className='text-muted-foreground'>
              알 수 없는 사용자 타입입니다.
            </p>
          </div>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className='min-h-screen flex w-full bg-gradient-warm'>
        <AppSidebar />

        <div className='flex-1 flex flex-col'>
          {/* 헤더 */}
          <header className='bg-card/80 backdrop-blur-sm border-b border-border/50 shadow-card'>
            <div className='flex items-center justify-between py-4 px-4'>
              <div className='flex items-center'>
                <SidebarTrigger className='mr-2' />
                <div className='flex items-center space-x-2 text-foreground'>
                  <User className='w-5 h-5 text-muted-foreground' />
                  <span className='font-medium'>{user.name}</span>
                  <span className='text-muted-foreground'>
                    ({getUserTypeLabel(user.userType)})
                  </span>
                </div>
              </div>

              <div className='flex items-center space-x-4'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-muted-foreground hover:text-foreground'
                >
                  <Settings className='w-4 h-4 mr-2' />
                  설정
                </Button>

                <Button
                  variant='ghost'
                  size='sm'
                  onClick={logout}
                  className='text-muted-foreground hover:text-foreground'
                >
                  <LogOut className='w-4 h-4 mr-2' />
                  로그아웃
                </Button>
              </div>
            </div>
          </header>

          {/* 메인 콘텐츠 */}
          <main className='flex-1 overflow-auto'>
            {renderDashboardContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
