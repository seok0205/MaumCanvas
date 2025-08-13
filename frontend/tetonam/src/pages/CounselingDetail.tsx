import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AppSidebar } from '@/components/layout/AppSidebar';
import { CommonHeader } from '@/components/layout/CommonHeader';
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
import { counselingService } from '@/services/counselingService';
import { imageService } from '@/services/imageService';
import { getAllQuestionnaireResults } from '@/services/questionnaireService';
import { useAuthStore } from '@/stores/useAuthStore';

interface CounselingDetailData {
  name: string;
  school: string;
  email: string;
  phone: string;
  time: string | number[];
  type: string;
  status: string;
}

interface CounselingImageItem {
  id: number;
  category: string;
  imageUrl: string;
}

export const CounselingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [detail, setDetail] = useState<CounselingDetailData | null>(null);
  const [images, setImages] = useState<CounselingImageItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questionnaires, setQuestionnaires] = useState<Array<{
    category: string;
    score: string | number;
  }> | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        // 병렬 로딩: 상세 + 이미지 목록
        const [d, imgs, qs] = await Promise.all([
          counselingService.getCounselingDetail(id, ac.signal),
          imageService.getCounselingImages(id, ac.signal),
          getAllQuestionnaireResults(),
        ]);
        if (!mounted) return;
        setDetail(d as unknown as CounselingDetailData);
        setImages(imgs);
        setQuestionnaires(qs as any);
      } catch (e: any) {
        if (mounted) setError(e?.message || '조회 실패');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
      ac.abort();
    };
  }, [id]);

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className='space-y-2'>
          <Skeleton className='h-5 w-40' />
          <Skeleton className='h-4 w-64' />
          <Skeleton className='h-4 w-64' />
          <Skeleton className='h-4 w-64' />
        </div>
      );
    }
    if (error) {
      return <div className='text-muted-foreground'>{error}</div>;
    }
    if (!detail) return null;
    const time = Array.isArray(detail.time)
      ? detail.time.join('-')
      : detail.time;
    return (
      <div className='space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <div className='text-sm text-muted-foreground'>이름</div>
            <div className='text-foreground'>{detail.name}</div>
          </div>
          <div>
            <div className='text-sm text-muted-foreground'>학교</div>
            <div className='text-foreground'>{detail.school}</div>
          </div>
          <div>
            <div className='text-sm text-muted-foreground'>이메일</div>
            <div className='text-foreground break-all'>{detail.email}</div>
          </div>
          <div>
            <div className='text-sm text-muted-foreground'>전화번호</div>
            <div className='text-foreground'>{detail.phone}</div>
          </div>
          <div>
            <div className='text-sm text-muted-foreground'>상담 시간</div>
            <div className='text-foreground'>{time}</div>
          </div>
          <div>
            <div className='text-sm text-muted-foreground'>상담 유형</div>
            <div className='text-foreground'>{detail.type}</div>
          </div>
        </div>

        <div className='pt-2'>
          <div className='text-sm font-medium mb-2'>그림 목록</div>
          {!images || images.length === 0 ? (
            <div className='text-sm text-muted-foreground'>그림이 없습니다</div>
          ) : (
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              {images.map(img => (
                <button
                  key={img.id}
                  className='group rounded-xl overflow-hidden border border-border/50 hover:shadow-hover transition'
                  onClick={() => navigate(`/counseling/image/${img.id}`)}
                >
                  <img
                    src={img.imageUrl}
                    alt={img.category}
                    className='aspect-square object-cover w-full h-full group-hover:scale-[1.02] transition'
                  />
                  <div className='p-2 text-xs text-center text-muted-foreground'>
                    {img.category}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className='pt-4'>
          <div className='text-sm font-medium mb-2'>최근 설문 결과</div>
          {!questionnaires || questionnaires.length === 0 ? (
            <div className='text-sm text-muted-foreground'>
              설문 결과가 없습니다
            </div>
          ) : (
            <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
              {questionnaires.map((q, idx) => (
                <div
                  key={idx}
                  className='rounded-lg border border-border/50 p-3 text-sm'
                >
                  <div className='text-muted-foreground'>{q.category}</div>
                  <div className='text-foreground font-medium'>{q.score}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }, [detail, images, loading, error, navigate]);

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className='flex w-full min-h-screen bg-gradient-warm'>
        <AppSidebar />
        <div className='flex-1 flex flex-col'>
          <CommonHeader user={user} title='상담 상세' showBackButton />
          <main className='p-6'>
            <Card>
              <CardHeader>
                <CardTitle>상담 상세정보</CardTitle>
              </CardHeader>
              <CardContent>{content}</CardContent>
            </Card>
          </main>
        </div>
        <MobileSidebarToggle />
      </div>
    </SidebarProvider>
  );
};
