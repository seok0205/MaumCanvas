import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppSidebar } from '@/components/layout/AppSidebar';
import { CommonHeader } from '@/components/layout/CommonHeader';
import { Button } from '@/components/ui/interactive/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/layout/card';
import { Skeleton } from '@/components/ui/layout/skeleton';
import {
  MobileSidebarToggle,
  SidebarProvider,
} from '@/components/ui/navigation/sidebar';
import { useCounselorCounselingList } from '@/hooks/useCounselingList';
import { useAuthStore } from '@/stores/useAuthStore';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const RowSkeleton = () => (
  <div className='p-4 bg-card border rounded-lg md:grid md:grid-cols-4 md:gap-4 md:items-center md:p-3 md:bg-transparent md:border-0 md:rounded-none space-y-2 md:space-y-0'>
    <div className='flex items-center gap-2 md:block'>
      <span className='text-xs text-muted-foreground md:hidden'>학생:</span>
      <Skeleton className='h-4 w-24' />
    </div>
    <div className='flex items-center gap-2 md:block'>
      <span className='text-xs text-muted-foreground md:hidden'>시간:</span>
      <Skeleton className='h-4 w-32' />
    </div>
    <div className='flex items-center gap-2 md:block'>
      <span className='text-xs text-muted-foreground md:hidden'>유형:</span>
      <Skeleton className='h-4 w-24' />
    </div>
    <div className='flex items-center gap-2 md:block'>
      <span className='text-xs text-muted-foreground md:hidden'>상태:</span>
      <Skeleton className='h-4 w-20' />
    </div>
  </div>
);

const formatDateTime = (iso: string) => {
  try {
    const d = new Date(iso);
    return `${format(d, 'yyyy.MM.dd (E)', { locale: ko })} ${format(d, 'HH:mm')}`;
  } catch {
    return iso;
  }
};

export const CounselingManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, isLoading: loading, error } = useCounselorCounselingList();

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className='space-y-3'>
          {Array.from({ length: 6 }).map((_, idx) => (
            <RowSkeleton key={idx} />
          ))}
        </div>
      );
    }
    if (error) {
      return (
        <div className='text-center py-10 text-muted-foreground'>{error}</div>
      );
    }
    if (!items || items.length === 0) {
      return (
        <div className='text-center py-10 text-muted-foreground'>
          상담 내역이 없습니다
        </div>
      );
    }
    return (
      <div className='space-y-3 md:space-y-0 md:divide-y md:divide-border/60'>
        {items.map(item => (
          <div
            key={item.id}
            className='p-4 bg-card border rounded-lg md:grid md:grid-cols-4 md:gap-4 md:items-center md:p-3 md:bg-transparent md:border-0 md:rounded-none space-y-3 md:space-y-0'
          >
            <div className='flex items-center gap-2 md:block'>
              <span className='text-xs text-muted-foreground md:hidden font-medium'>
                학생:
              </span>
              <div className='text-sm text-foreground font-medium md:font-normal'>
                {item.counselor}
              </div>
            </div>
            <div className='flex items-center gap-2 md:block'>
                <span className='text-xs text-muted-foreground md:hidden font-medium'>
                일시:
                </span>
              <div className='text-sm text-muted-foreground'>
                {formatDateTime(item.time)}
              </div>
            </div>
            <div className='flex items-center gap-2 md:block'>
              <span className='text-xs text-muted-foreground md:hidden font-medium'>
                유형:
              </span>
              <div className='text-sm'>{item.type}</div>
            </div>
            <div className='flex items-center justify-between md:block'>
              <div className='flex items-center gap-2'>
                <span className='text-xs text-muted-foreground md:hidden font-medium'>
                  상태:
                </span>
                <div className='text-xs px-3 py-1 rounded-full bg-accent/50 text-foreground/80 inline-block'>
                  {item.status}
                </div>
              </div>
              <Button
                size='sm'
                onClick={() => navigate(`/counseling/${item.id}`)}
                className='ml-auto md:ml-0 md:mt-2'
              >
                상세 보기
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }, [items, loading, error, navigate]);

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className='flex w-full min-h-screen bg-gradient-warm'>
        <AppSidebar />

        <div className='flex-1 flex flex-col'>
          <CommonHeader user={user} title='상담 관리' />

          <main className='p-6'>
            <Card>
              <CardHeader>
                <CardTitle>전체 상담 내역</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Desktop Header - Hidden on mobile */}
                <div className='hidden md:grid md:grid-cols-4 gap-4 text-xs font-medium text-muted-foreground pb-2'>
                  <div>학생</div>
                  <div>시간</div>
                  <div>유형</div>
                  <div>상태</div>
                </div>
                {content}
              </CardContent>
            </Card>
          </main>
        </div>

        <MobileSidebarToggle />
      </div>
    </SidebarProvider>
  );
};
