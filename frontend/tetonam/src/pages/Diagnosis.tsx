import { AppSidebar } from '@/components/layout/AppSidebar';
import { DisclaimerBox } from '@/components/ui/feedback/DisclaimerBox';
import { DiagnosisGrid } from '@/components/ui/layout/DiagnosisGrid';
import {
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/navigation/sidebar';
import {
  DIAGNOSIS_CATEGORIES,
  DIAGNOSIS_PAGE_TITLE,
} from '@/constants/diagnosis';
import { useAuthStore } from '@/stores/useAuthStore';
import { Heart } from 'lucide-react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const Diagnosis = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleStartDiagnosis = useCallback(
    (categoryId: string) => {
      const category = DIAGNOSIS_CATEGORIES.find(cat => cat.id === categoryId);
      if (category) {
        navigate(category.path);
      }
    },
    [navigate]
  );

  return (
    <SidebarProvider>
      <div className='flex h-screen bg-background'>
        <AppSidebar />

        <main className='flex-1 overflow-auto'>
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
            </div>
          </header>

          {/* 메인 콘텐츠 */}
          <div className='p-6 max-w-7xl mx-auto'>
            <div className='mb-8'>
              <h1 className='text-3xl font-bold text-foreground mb-2'>
                {DIAGNOSIS_PAGE_TITLE}
              </h1>
              <p className='text-muted-foreground'>
                자신의 마음 상태를 점검하고 이해하는 데 도움을 받아보세요.
              </p>
            </div>

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
    </SidebarProvider>
  );
};
