import { CounselorDashboard } from '@/components/dashboard/CounselorDashboard';
import { UserDashboard } from '@/components/dashboard/UserDashboard';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { CommonHeader } from '@/components/layout/CommonHeader';
import {
  MobileSidebarToggle,
  SidebarProvider,
} from '@/components/ui/navigation/sidebar';
import { useAuthStore } from '@/stores/useAuthStore';
import { getPrimaryRole } from '@/utils/userRoleMapping';
import { useCallback } from 'react';

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

  // roles 배열에서 주요 역할 결정 (user가 없을 때의 안전한 기본값 처리)
  const primaryRole = user ? getPrimaryRole(user.roles) : 'USER';

  // 대시보드 콘텐츠 렌더링 (Hook은 최상단에서 호출해서 규칙 준수)
  const renderDashboardContent = useCallback(() => {
    if (!isAuthenticated || !user) {
      return <LoadingSpinner />;
    }
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
  }, [isAuthenticated, primaryRole, user]);

  // 로딩 상태 처리
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // 인증되지 않은 상태 처리
  if (!isAuthenticated || !user) {
    return <LoadingSpinner />;
  }

  return (
    <SidebarProvider>
      <div className='flex w-full min-h-screen bg-gradient-warm'>
        <AppSidebar />

        <div className='flex flex-1 flex-col'>
          <CommonHeader user={user} />

          {/* 메인 콘텐츠 */}
          <main className='flex-1 overflow-auto'>
            {renderDashboardContent()}
          </main>
        </div>

        {/* 모바일 사이드바 토글 버튼 - 왼쪽 하단 고정 */}
        <MobileSidebarToggle />
      </div>
    </SidebarProvider>
  );
};
