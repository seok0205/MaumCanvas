import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

import { DrawingImage } from '@/components/ui/drawing/DrawingImage';
import { Button } from '@/components/ui/interactive/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/layout/card';
import { Skeleton } from '@/components/ui/layout/skeleton';
import { imageService } from '@/services/imageService';
import { useAuthStore } from '@/stores/useAuthStore';
import type { ApiErrorType } from '@/types/api';
import { useImageModal } from '@/contexts/ImageModalContext';

// 📘 TypeScript 인터페이스 정의
interface DrawingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  drawingId: number;
  imageUrl: string;
  category: string;
}

// 🎯 그림 분석 결과 모달 컴포넌트 (React Best Practice 적용)
export const DrawingDetailModal = memo<DrawingDetailModalProps>(({
  isOpen,
  onClose,
  drawingId,
  imageUrl,
  category,
}) => {
  const { user } = useAuthStore();
  const { inVideoCall } = useImageModal();

  const [aiText, setAiText] = useState<string>('');
  const [ragText, setRagText] = useState<string | null>(null);
  const [ragError, setRagError] = useState<ApiErrorType | null>(null);
  const [ragHtml, setRagHtml] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [loadingAI, setLoadingAI] = useState(true);
  const [loadingRAG, setLoadingRAG] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const pollTimer = useRef<number | null>(null);

  // 데이터 페칭 (useCallback으로 최적화)
  const fetchParallel = useCallback(
    async (id: string) => {
      const ac = new AbortController();
      const isCounselor = user?.roles?.includes('COUNSELOR');

      try {
        setLoadingRAG(true);
        setRagError(null);

        // 병렬 요청으로 성능 최적화
        const [aiResult, ragResult] = await Promise.all([
          imageService.getAiDetectionText(id, ac.signal),
          isCounselor
            ? imageService.getRagResult(id, ac.signal)
            : Promise.resolve({ data: null }),
        ]);

        setAiText(aiResult);

        if (isCounselor && ragResult.data) {
          // RAG 결과는 HTML 형태로 반환되므로 텍스트와 HTML을 분리
          setRagText(ragResult.data);
          setRagHtml(ragResult.data);
        }
      } catch (error: any) {
        console.error('❌ [DrawingDetailModal] 데이터 로딩 실패:', error);

        if (error?.type === 'RAG_NOT_READY' || error?.error === 'NOT_FOUND') {
          setRagError(error.error || 'NOT_FOUND');
          pollTimer.current = window.setTimeout(() => {
            if (isOpen) {
              fetchParallel(id);
            }
          }, 3000);
        }
      } finally {
        setLoadingAI(false);
        setLoadingRAG(false);
      }
    },
    [user, isOpen]
  );

  // RAG 프롬프트 제출 (useCallback으로 최적화)
  const handleSubmitPrompt = useCallback(async () => {
    if (!prompt.trim() || !drawingId) return;

    try {
      setSubmitting(true);
      await imageService.submitRagPrompt(drawingId.toString(), prompt);
      setPrompt('');
      await fetchParallel(drawingId.toString());
    } catch (error) {
      console.error('❌ [DrawingDetailModal] RAG 프롬프트 제출 실패:', error);
    } finally {
      setSubmitting(false);
    }
  }, [prompt, drawingId, fetchParallel]);

  // 모달 열릴 때 데이터 로딩
  useEffect(() => {
    if (isOpen && drawingId) {
      fetchParallel(drawingId.toString());
    }

    // 모달 닫힐 때 폴링 타이머 정리
    return () => {
      if (pollTimer.current) {
        clearTimeout(pollTimer.current);
        pollTimer.current = null;
      }
    };
  }, [isOpen, drawingId, fetchParallel]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // 모달 열릴 때 body 스크롤 방지
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isCounselor = user?.roles?.includes('COUNSELOR');

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
      <div className='relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background border border-border rounded-lg shadow-xl'>
        {/* 모달 헤더 */}
        <div className='sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-background'>
          <h2 className='text-lg font-semibold text-foreground'>
            그림 분석 결과 - {category}
          </h2>
          <Button
            size='sm'
            variant='ghost'
            onClick={onClose}
            className='w-8 h-8 p-0'
            aria-label='모달 닫기'
          >
            <X className='w-4 h-4' />
          </Button>
        </div>

        {/* 모달 내용 */}
        <div className='p-6 space-y-6'>
          {/* 이미지 표시 */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>그림</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex justify-center'>
                <DrawingImage
                  imageUrl={imageUrl}
                  category={category}
                  className='max-w-md max-h-96 object-contain rounded-lg'
                />
              </div>
            </CardContent>
          </Card>

          {/* AI 객체 탐지 결과 */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>AI 객체 탐지 결과</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAI ? (
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-4 w-1/2' />
                  <Skeleton className='h-4 w-2/3' />
                </div>
              ) : (
                <pre className='whitespace-pre-wrap text-sm text-muted-foreground bg-muted p-4 rounded-md'>
                  {aiText || '객체 탐지 결과가 없습니다.'}
                </pre>
              )}
            </CardContent>
          </Card>

          {/* 상담사용 RAG 분석 */}
          {isCounselor && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>심리 분석 결과</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingRAG ? (
                    <div className='space-y-2'>
                      <Skeleton className='h-4 w-full' />
                      <Skeleton className='h-4 w-3/4' />
                      <Skeleton className='h-4 w-1/2' />
                    </div>
                  ) : ragError ? (
                    <div className='text-center p-6 text-muted-foreground'>
                      <p className='mb-2'>분석을 준비 중입니다...</p>
                      <p className='text-sm'>
                        잠시 후 다시 시도해주세요.
                      </p>
                    </div>
                  ) : ragText ? (
                    <div className='space-y-4'>
                      <div
                        className='prose prose-sm max-w-none text-muted-foreground'
                        dangerouslySetInnerHTML={{ __html: ragHtml }}
                      />
                    </div>
                  ) : (
                    <div className='text-center p-6 text-muted-foreground'>
                      <p>심리 분석 결과가 아직 없습니다.</p>
                      <p className='text-sm mt-2'>
                        아래에서 분석을 요청할 수 있습니다.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* RAG 프롬프트 입력 */}
              {!inVideoCall && (
                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>추가 분석 요청</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder='그림에 대해 궁금한 점을 입력하세요...'
                        className='w-full h-24 p-3 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary'
                        disabled={submitting}
                      />
                      <Button
                        onClick={handleSubmitPrompt}
                        disabled={!prompt.trim() || submitting}
                        className='w-full'
                      >
                        {submitting ? '분석 중...' : '분석 요청'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
});

DrawingDetailModal.displayName = 'DrawingDetailModal';

// ImageModalContext와 연동된 모달 컴포넌트
export const ImageModalRenderer = memo(() => {
  const { isOpen, modalData, closeModal } = useImageModal();

  if (!isOpen || !modalData) return null;

  return (
    <DrawingDetailModal
      isOpen={isOpen}
      onClose={closeModal}
      drawingId={modalData.imageId}
      imageUrl={modalData.imageUrl}
      category={modalData.category}
    />
  );
});

ImageModalRenderer.displayName = 'ImageModalRenderer';
