import { useParams, useSearchParams } from 'react-router-dom';

import { DrawingAnalysisContent } from '@/components/analysis/DrawingAnalysisContent';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { CommonHeader } from '@/components/layout/CommonHeader';
import { DrawingImage } from '@/components/ui/drawing/DrawingImage';
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

          {/* 그림 표시 영역 - CommonHeader 아래, 분석 결과 위에 위치 */}
          <div className='px-4 sm:px-6 pt-4 sm:pt-6'>
            <DrawingImage
              imageUrl={imageUrl ?? undefined}
              category={category ?? undefined}
              className='mb-4 sm:mb-6'
            />
          </div>

          <main className='px-4 sm:px-6 pb-4 sm:pb-6'>
            <DrawingAnalysisContent
              drawingId={drawingId || null}
              compact={false}
              showImage={false}
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