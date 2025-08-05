import { AppSidebar } from '@/components/layout/AppSidebar';
import { CommonHeader } from '@/components/layout/CommonHeader';
import { DisclaimerBox } from '@/components/ui/feedback/DisclaimerBox';
import { DiagnosisGrid } from '@/components/ui/layout/DiagnosisGrid';
import { SidebarProvider } from '@/components/ui/navigation/sidebar';
import {
  DIAGNOSIS_CATEGORIES,
  DIAGNOSIS_PAGE_TITLE,
} from '@/constants/diagnosis';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const Diagnosis = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleStartDiagnosis = useCallback(
    (categoryId: string) => {
      const category = DIAGNOSIS_CATEGORIES.find(cat => cat.id === categoryId);
      if (category) {
        navigate(category.path);
      }
    },
    [navigate]
  );

  if (!user) {
    return <div>로딩 중...</div>;
  }

  return (
    <SidebarProvider>
      <div className='flex w-full min-h-screen bg-orange-50/30'>
        <AppSidebar />

        <div className='flex flex-1 flex-col'>
          <CommonHeader user={user} />

          {/* 페이지 제목 */}
          <div className='px-6 py-4'>
            <h1 className='text-3xl font-bold text-foreground'>
              {DIAGNOSIS_PAGE_TITLE}
            </h1>
            <p className='text-muted-foreground mt-2'>
              자신의 마음 상태를 점검하고 이해하는 데 도움을 받아보세요.
            </p>
          </div>

          {/* 메인 콘텐츠 */}
          <main className='flex-1 overflow-auto'>
            <div className='p-6 max-w-7xl mx-auto'>
              {/* 면책조항 */}
              <div className='mb-8'>
                <DisclaimerBox />
              </div>

              {/* 진단 카드 그리드 */}
              <section aria-labelledby='diagnosis-categories-title'>
                <h2 id='diagnosis-categories-title' className='sr-only'>
                  진단 카테고리
                </h2>
                <DiagnosisGrid
                  categories={DIAGNOSIS_CATEGORIES}
                  onStartDiagnosis={handleStartDiagnosis}
                />
              </section>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
