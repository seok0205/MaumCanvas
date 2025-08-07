import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { AppSidebar } from '@/components/layout/AppSidebar';
import { CommonHeader } from '@/components/layout/CommonHeader';
import { DrawingDiagnosisCard } from '@/components/ui/drawing/DrawingDiagnosisCard';
import { PenIcon } from '@/components/ui/icons/PenIcon';
import { UploadIcon } from '@/components/ui/icons/UploadIcon';
import { ImageUploadModal } from '@/components/ui/modals/ImageUploadModal';
import {
  MobileSidebarToggle,
  SidebarProvider,
} from '@/components/ui/navigation/sidebar';
import { useAuthStore } from '@/stores/useAuthStore';

export const DrawingDiagnosis = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleStartDrawing = useCallback(() => {
    // TODO: 그림 그리기 페이지로 이동
    navigate('/diagnosis/drawing/canvas');
  }, [navigate]);

  const handleUploadDrawing = useCallback(() => {
    setIsUploadModalOpen(true);
  }, []);

  const handleUploadSuccess = useCallback((result: string) => {
    toast.success('그림이 성공적으로 업로드되었습니다!', {
      description: 'AI 분석이 시작됩니다. 잠시만 기다려주세요.',
    });
    console.log('Upload result:', result);
    // TODO: 결과 페이지로 이동하거나 추가 작업 수행
    // navigate('/diagnosis/results');
  }, []);

  const handleCloseUploadModal = useCallback(() => {
    setIsUploadModalOpen(false);
  }, []);

  if (!user) {
    return <div>로딩 중...</div>;
  }

  return (
    <SidebarProvider>
      <div className='flex w-full min-h-screen bg-orange-50/30'>
        <AppSidebar />

        <div className='flex flex-1 flex-col'>
          <CommonHeader user={user} />

          {/* 메인 콘텐츠 */}
          <main className='flex-1 overflow-auto'>
            <div className='p-6 max-w-6xl mx-auto'>
              {/* 헤더 섹션 */}
              <div className='mb-12'>
                <div className='bg-orange-50 border border-orange-200 rounded-2xl p-8 mb-8'>
                  <h1 className='text-3xl font-bold text-gray-900 mb-4'>
                    그림 진단 안내
                  </h1>
                  <p className='text-gray-700 text-lg leading-relaxed'>
                    그림을 통한 마음 탐색으로 미술치료의 기법 원리를 바탕으로
                    합니다. 직접 그리거나 기존 그림 업로드 중에 편한 방법을
                    선택해 주세요. 두 방법 모두 동일한 품질의 분석 결과를
                    제공합니다.
                  </p>
                </div>
              </div>

              {/* 카드 그리드 섹션 */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                {/* 그림 그리기 카드 */}
                <DrawingDiagnosisCard
                  icon={<PenIcon className='text-yellow-600' size={32} />}
                  iconBgColor='bg-yellow-100'
                  title='그림 그리기'
                  description='브라우저에서 직접 그림을 그려보세요. 간단한 도구를 사용해 자유롭게 표현할 수 있습니다.'
                  features={[
                    '다양한 색상과 브러시 제공',
                    '실시간 그리기 과정 분석',
                    '수정 및 다시 그리기 가능',
                    '모바일 터치 지원',
                  ]}
                  buttonText='그림 그리기 시작'
                  buttonVariant='primary'
                  buttonColor='bg-yellow-500'
                  onAction={handleStartDrawing}
                />

                {/* 그림 업로드 카드 */}
                <DrawingDiagnosisCard
                  icon={<UploadIcon className='text-pink-600' size={32} />}
                  iconBgColor='bg-pink-100'
                  title='그림 업로드'
                  description='이미 그려진 그림이나 스케치를 업로드해서 진단받을 수 있습니다.'
                  features={[
                    'JPG, PNG, GIF 등 다양한 형식 지원',
                    '기존 작품 활용 가능',
                    '빠른 업로드 및 분석',
                    '고화질 이미지 지원',
                  ]}
                  buttonText='그림 업로드하기'
                  buttonVariant='outline'
                  buttonColor='border-pink-500 text-pink-600'
                  onAction={handleUploadDrawing}
                />
              </div>
            </div>
          </main>
        </div>

        {/* 모바일 사이드바 토글 버튼 */}
        <MobileSidebarToggle />

        {/* 그림 업로드 모달 */}
        <ImageUploadModal
          isOpen={isUploadModalOpen}
          onClose={handleCloseUploadModal}
          onSuccess={handleUploadSuccess}
        />
      </div>
    </SidebarProvider>
  );
};
