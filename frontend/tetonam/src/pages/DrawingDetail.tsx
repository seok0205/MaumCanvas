import { useParams, useSearchParams } from 'react-router-dom';

import { DrawingAnalysisContent } from '@/components/analysis/DrawingAnalysisContent';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { CommonHeader } from '@/components/layout/CommonHeader';
import {
  MobileSidebarToggle,
  SidebarProvider,
} from '@/components/ui/navigation/sidebar';
import { useAuthStore } from '@/stores/useAuthStore';

export const DrawingDetail = () => {
  const { drawingId } = useParams<{ drawingId: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();

  // URL 파라미터에서 이미지 정보 추출
  const imageUrl = searchParams.get('imageUrl');
  const category = searchParams.get('category');

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className='flex w-full min-h-screen bg-gradient-warm'>
        <AppSidebar />
        <div className='flex-1 flex flex-col'>
          <CommonHeader user={user} title='그림 분석 결과' showBackButton />

          <main className='px-4 sm:px-6 py-4 sm:py-6'>
            <DrawingAnalysisContent
              drawingId={drawingId || null}
              {...(imageUrl && { imageUrl })}
              {...(category && { category })}
              compact={false}
              showImage={true}
              autoFetch={true}
              enablePolling={true}
            />
          </main>
        </div>
        <MobileSidebarToggle />
      </div>
    </SidebarProvider>
  );
};