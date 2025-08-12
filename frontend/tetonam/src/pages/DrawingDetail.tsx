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
import type { ApiErrorType } from '@/types/api';

export const DrawingDetail = () => {
  const { drawingId } = useParams();
  const { user } = useAuthStore();

  const [aiText, setAiText] = useState<string>('');
  const [ragText, setRagText] = useState<string | null>(null);
  const [ragError, setRagError] = useState<ApiErrorType | null>(null);
  const [ragHtml, setRagHtml] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [loadingAI, setLoadingAI] = useState(true);
  const [loadingRAG, setLoadingRAG] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const pollTimer = useRef<number | null>(null);

  const fetchParallel = useCallback(
    async (id: string) => {
      const ac = new AbortController();
      const isCounselor = user?.roles?.includes('COUNSELOR');

      try {
        setLoadingRAG(true);
        setRagError(null);

        if (isCounselor) {
          // 상담사: AI 결과와 RAG 결과 모두 요청
          setLoadingAI(true);
          const [ai, ragResult] = await Promise.all([
            imageService.getAiDetectionText(id, ac.signal),
            imageService.getRagResult(id, ac.signal),
          ]);
          setAiText(ai);
          setRagText(ragResult.data);
          if (ragResult.error) {
            setRagError(ragResult.error);
          }
          setLoadingAI(false);
        } else {
          // 학생: RAG 결과만 요청
          const ragResult = await imageService.getRagResult(id, ac.signal);
          setRagText(ragResult.data);
          if (ragResult.error) {
            setRagError(ragResult.error);
          }
        }
      } finally {
        setLoadingRAG(false);
      }
    },
    [user?.roles]
  );

  useEffect(() => {
    if (!drawingId) return;
    fetchParallel(drawingId);
    return () => {
      if (pollTimer.current) window.clearInterval(pollTimer.current);
    };
  }, [drawingId, fetchParallel]);

  // RAG 마크다운을 HTML로 변환하여 안전하게 렌더링
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!ragText) {
        setRagHtml('');
        return;
      }
      const [m, d] = await Promise.all([import('marked'), import('dompurify')]);
      const raw = m.marked.parse(ragText, { async: false });
      const safe = d.default.sanitize(raw);
      if (!cancelled) setRagHtml(safe);
    })();
    return () => {
      cancelled = true;
    };
  }, [ragText]);

  const handleSubmit = useCallback(async () => {
    if (!drawingId || !prompt.trim()) return;
    setSubmitting(true);
    setRagText(null);
    setRagError(null);
    setLoadingRAG(true);
    try {
      await imageService.submitRagPrompt(drawingId, prompt.trim());
      // 15초 후 첫 확인
      window.setTimeout(async () => {
        const firstResult = await imageService.getRagResult(drawingId);
        if (firstResult.data) {
          setRagText(firstResult.data);
          setLoadingRAG(false);
          setSubmitting(false);
          return;
        }
        if (firstResult.error) {
          setRagError(firstResult.error);
        }
        // 3초마다 폴링
        pollTimer.current = window.setInterval(async () => {
          const result = await imageService.getRagResult(drawingId);
          if (result.data) {
            setRagText(result.data);
            setLoadingRAG(false);
            setSubmitting(false);
            if (pollTimer.current) window.clearInterval(pollTimer.current);
          } else if (result.error) {
            setRagError(result.error);
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
          <CommonHeader user={user} title='그림 분석 결과' showBackButton />
          <main className='p-6 space-y-6'>
            {isCounselor && (
              <Card>
                <CardHeader>
                  <CardTitle>객체 탐지 결과</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingAI ? (
                    <Skeleton className='h-24 w-full' />
                  ) : (
                    <div className='whitespace-pre-wrap text-sm font-sans'>
                      {aiText || '내용이 없습니다'}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>RAG 분석 결과</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {loadingRAG ? (
                  <div className='text-sm text-muted-foreground'>
                    분석 중...
                  </div>
                ) : ragError ? (
                  <div className='text-sm text-red-600'>
                    {ragError === 'UNAUTHORIZED'
                      ? '분석 결과를 확인할 권한이 없습니다.'
                      : ragError === 'NOT_FOUND'
                        ? '아직 분석 결과가 없습니다.'
                        : ragError === 'NETWORK'
                          ? '네트워크 오류로 결과를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.'
                          : '알 수 없는 오류가 발생했습니다.'}
                  </div>
                ) : ragText ? (
                  <div
                    className='prose prose-slate max-w-none font-sans leading-relaxed'
                    style={{
                      fontFamily:
                        "'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif",
                      fontSize: '14px',
                      lineHeight: '1.7',
                      color: 'hsl(var(--foreground))',
                    }}
                    dangerouslySetInnerHTML={{ __html: ragHtml }}
                  />
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
