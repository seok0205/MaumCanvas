import { useParams } from 'react-router-dom';

import { AppSidebar } from '@/components/layout/AppSidebar';
import { CommonHeader } from '@/components/layout/CommonHeader';
import { CounselingDetailContent } from '@/components/counseling/CounselingDetailContent';
import {
  MobileSidebarToggle,
  SidebarProvider,
} from '@/components/ui/navigation/sidebar';
import { useAuthStore } from '@/stores/useAuthStore';

export const CounselingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();

  // 사용자가 상담사인지 확인
  const isCounselor = user?.roles?.includes('COUNSELOR') ?? false;

  if (!user) return null;

  if (!id) {
    return (
      <SidebarProvider>
        <div className='flex w-full min-h-screen bg-gradient-warm'>
          <AppSidebar />
          <div className='flex-1 flex flex-col'>
            <CommonHeader user={user} title='상담 상세정보' showBackButton />
            <main className='p-6'>
              <div className='text-center'>
                <h2 className='text-lg font-semibold text-foreground mb-2'>
                  상담 정보를 찾을 수 없습니다
                </h2>
                <p className='text-muted-foreground'>
                  올바른 상담 링크를 통해 접근해주세요.
                </p>
              </div>
            </main>
          </div>
          <MobileSidebarToggle />
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className='flex w-full min-h-screen bg-gradient-warm'>
        <AppSidebar />
        <div className='flex-1 flex flex-col'>
          <CommonHeader user={user} title='상담 상세정보' showBackButton />
          <main className='p-6'>
            <CounselingDetailContent
              appointmentId={id}
              isCounselor={isCounselor}
              compact={false}
            />
          </main>
        </div>
        <MobileSidebarToggle />
      </div>
    </SidebarProvider>
  );
};
