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
  <div className='grid grid-cols-5 gap-4 items-center py-3'>
    <Skeleton className='h-4 w-24' />
    <Skeleton className='h-4 w-32' />
    <Skeleton className='h-4 w-24' />
    <Skeleton className='h-4 w-20' />
    <Skeleton className='h-8 w-20' />
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
        <div className='space-y-2'>
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
      <div className='divide-y divide-border/60'>
        {items.map(item => (
          <div
            key={item.id}
            className='grid grid-cols-5 gap-4 items-center py-3'
          >
            <div className='text-sm text-foreground'>{item.counselor}</div>
            <div className='text-sm text-muted-foreground'>
              {formatDateTime(item.time)}
            </div>
            <div className='text-sm'>{item.type}</div>
            <div className='text-xs px-2 py-1 rounded-full bg-accent/50 text-foreground/80'>
              {item.status}
            </div>
            <div className='text-right'>
              <Button
                size='sm'
                onClick={() => navigate(`/counseling/${item.id}`)}
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
                <div className='grid grid-cols-5 gap-4 text-xs font-medium text-muted-foreground pb-2'>
                  <div>학생</div>
                  <div>시간</div>
                  <div>유형</div>
                  <div>상태</div>
                  <div className='text-right'>액션</div>
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
