import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

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
import { imageService } from '@/services/imageService';
import { useAuthStore } from '@/stores/useAuthStore';

export const DrawingDetail = () => {
  const { drawingId } = useParams();
  const { user } = useAuthStore();

  const [aiText, setAiText] = useState<string>('');
  const [ragText, setRagText] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loadingAI, setLoadingAI] = useState(true);
  const [loadingRAG, setLoadingRAG] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const pollTimer = useRef<number | null>(null);

  const fetchParallel = useCallback(async (id: string) => {
    const ac = new AbortController();
    try {
      setLoadingAI(true);
      setLoadingRAG(true);
      const [ai, rag] = await Promise.all([
        imageService.getAiDetectionText(id, ac.signal),
        imageService.getRagResult(id, ac.signal),
      ]);
      setAiText(ai);
      setRagText(rag);
    } finally {
      setLoadingAI(false);
      setLoadingRAG(false);
    }
  }, []);

  useEffect(() => {
    if (!drawingId) return;
    fetchParallel(drawingId);
    return () => {
      if (pollTimer.current) window.clearInterval(pollTimer.current);
    };
  }, [drawingId, fetchParallel]);

  const handleSubmit = useCallback(async () => {
    if (!drawingId || !prompt.trim()) return;
    setSubmitting(true);
    setRagText(null);
    setLoadingRAG(true);
    try {
      await imageService.submitRagPrompt(drawingId, prompt.trim());
      // 15초 후 첫 확인
      window.setTimeout(async () => {
        const first = await imageService.getRagResult(drawingId);
        if (first) {
          setRagText(first);
          setLoadingRAG(false);
          setSubmitting(false);
          return;
        }
        // 3초마다 폴링
        pollTimer.current = window.setInterval(async () => {
          const res = await imageService.getRagResult(drawingId);
          if (res) {
            setRagText(res);
            setLoadingRAG(false);
            setSubmitting(false);
            if (pollTimer.current) window.clearInterval(pollTimer.current);
          }
        }, 3000) as unknown as number;
      }, 15000);
    } finally {
      // 제출 버튼 비활성화 상태는 로딩이 끝날 때까지 유지
    }
  }, [drawingId, prompt]);

  if (!user) return null;

  const isCounselor = user.roles?.includes('COUNSELOR');

  return (
    <SidebarProvider>
      <div className='flex w-full min-h-screen bg-gradient-warm'>
        <AppSidebar />
        <div className='flex-1 flex flex-col'>
          <CommonHeader user={user} title='그림 상세' showBackButton />
          <main className='p-6 space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>객체 탐지 결과</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAI ? (
                  <Skeleton className='h-24 w-full' />
                ) : (
                  <pre className='whitespace-pre-wrap text-sm'>
                    {aiText || '내용이 없습니다'}
                  </pre>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>RAG 분석 결과</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {loadingRAG ? (
                  <div className='text-sm text-muted-foreground'>
                    분석 중...
                  </div>
                ) : ragText ? (
                  <pre className='whitespace-pre-wrap text-sm'>{ragText}</pre>
                ) : (
                  <div className='text-sm text-muted-foreground'>
                    {isCounselor
                      ? '프롬프트를 입력하시면 답변 드립니다.'
                      : '아직 결과가 없습니다.'}
                  </div>
                )}

                {isCounselor && (
                  <div className='flex items-center space-x-2'>
                    <input
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      placeholder='프롬프트를 입력하세요'
                      className='flex-1 h-10 px-3 rounded-md border border-border bg-background'
                    />
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting || !prompt.trim()}
                    >
                      제출
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
        <MobileSidebarToggle />
      </div>
    </SidebarProvider>
  );
};

export default DrawingDetail;
