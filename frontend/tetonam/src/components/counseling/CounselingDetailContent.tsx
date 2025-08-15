import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/layout/card';
import { Skeleton } from '@/components/ui/layout/skeleton';
import { useImageModal } from '@/contexts/ImageModalContext';
import { counselingService } from '@/services/counselingService';
import { imageService } from '@/services/imageService';
import { getAllQuestionnaireResults } from '@/services/questionnaireService';

// 📘 TypeScript 인터페이스 정의 (타입 안전성)
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

interface QuestionnaireResult {
  category: string;
  score: string | number;
}

interface CounselingDetailContentProps {
  appointmentId: string;
  isCounselor: boolean;
  compact?: boolean; // VideoCall에서 사용할 때 컴팩트 모드
  className?: string; // 추가 스타일링을 위한 className
  inVideoCall?: boolean; // 화상상담 중인지 여부
}

// 최적화된 이미지 그리드 컴포넌트 (React.memo 적용)
const ImageGrid = memo<{
  images: CounselingImageItem[] | null;
  compact: boolean;
  onImageClick: (imageId: number, imageUrl: string, category: string) => void;
  inVideoCall?: boolean;
}>(({ images, compact, onImageClick, inVideoCall = false }) => {
  const { openModal } = useImageModal();

  const handleImageClick = useCallback((imageId: number, imageUrl: string, category: string) => {
    if (inVideoCall) {
      // 화상상담 중일 때는 모달로 열기
      openModal({ imageId, imageUrl, category });
    } else {
      // 일반 페이지에서는 기존 방식으로 페이지 이동
      onImageClick(imageId, imageUrl, category);
    }
  }, [inVideoCall, openModal, onImageClick]);
  if (!images || images.length === 0) {
    return (
      <div className={`text-${compact ? 'xs' : 'sm'} text-muted-foreground`}>
        그림이 없습니다
      </div>
    );
  }

  return (
    <div
      className={`grid gap-${compact ? '2' : '4'} ${
        compact ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'
      }`}
    >
      {images.map((img) => (
        <button
          key={img.id}
          type='button'
          className='group overflow-hidden rounded-xl border border-border/50 transition hover:shadow-hover'
          onClick={() => handleImageClick(img.id, img.imageUrl, img.category)}
          aria-label={`${img.category} 그림 보기`}
        >
          <img
            src={img.imageUrl}
            alt={img.category}
            className='aspect-square h-full w-full object-cover transition group-hover:scale-[1.02]'
            loading='lazy' // 성능 최적화: 지연 로딩
          />
          <div
            className={`p-${compact ? '1' : '2'} text-center text-${
              compact ? '2xs' : 'xs'
            } text-muted-foreground`}
          >
            {img.category}
          </div>
        </button>
      ))}
    </div>
  );
});

ImageGrid.displayName = 'ImageGrid';

// 최적화된 설문 결과 그리드 컴포넌트 (React.memo 적용)
const QuestionnaireGrid = memo<{
  questionnaires: QuestionnaireResult[] | null;
  compact: boolean;
}>(({ questionnaires, compact }) => {
  if (!questionnaires || questionnaires.length === 0) {
    return (
      <div className={`text-${compact ? 'xs' : 'sm'} text-muted-foreground`}>
        설문 결과가 없습니다
      </div>
    );
  }

  return (
    <div
      className={`grid gap-${compact ? '2' : '3'} ${
        compact ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-4'
      }`}
    >
      {questionnaires.map((q, idx) => (
        <div
          key={`${q.category}-${idx}`}
          className={`rounded-lg border border-border/50 p-${
            compact ? '2' : '3'
          } text-${compact ? 'xs' : 'sm'}`}
        >
          <div className='text-muted-foreground'>{q.category}</div>
          <div className='font-medium text-foreground'>{q.score}</div>
        </div>
      ))}
    </div>
  );
});

QuestionnaireGrid.displayName = 'QuestionnaireGrid';

// 메인 컴포넌트 (React.memo로 최적화)
export const CounselingDetailContent = memo<CounselingDetailContentProps>(
  ({ appointmentId, isCounselor, compact = false, className = '', inVideoCall = false }) => {
    const navigate = useNavigate();

    // 🔄 상태 관리
    const [detail, setDetail] = useState<CounselingDetailData | null>(null);
    const [images, setImages] = useState<CounselingImageItem[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [questionnaires, setQuestionnaires] =
      useState<QuestionnaireResult[] | null>(null);

    // 🎯 useCallback으로 이벤트 핸들러 최적화
    const handleImageClick = useCallback(
      (imageId: number, imageUrl: string, category: string) => {
        navigate(
          `/counseling/image/${imageId}?imageUrl=${encodeURIComponent(
            imageUrl
          )}&category=${encodeURIComponent(category)}`
        );
      },
      [navigate]
    );

    // 데이터 페칭 (useEffect 최적화)
    useEffect(() => {
      if (!appointmentId) return;

      let mounted = true;
      const abortController = new AbortController();

      const fetchData = async () => {
        try {
          setLoading(true);
          setError(null);

          // 병렬 요청으로 성능 최적화 (타입 안전성 확보)
          const [detailData, imagesData] = await Promise.all([
            counselingService.getCounselingDetail(
              appointmentId,
              abortController.signal
            ),
            imageService.getCounselingImages(
              appointmentId,
              abortController.signal
            ),
          ]);

          if (!mounted) return;

          setDetail(detailData as unknown as CounselingDetailData);
          setImages(imagesData);

          // 상담사가 아닐 때만 설문 결과 로딩 (별도 처리)
          if (!isCounselor) {
            try {
              const questionnaireData = await getAllQuestionnaireResults();
              if (mounted) {
                setQuestionnaires(questionnaireData as unknown as QuestionnaireResult[]);
              }
            } catch (questionnaireError) {
              console.warn('설문 결과 로딩 실패:', questionnaireError);
              // 설문 결과 실패는 전체 로딩을 막지 않음
            }
          }
        } catch (err: any) {
          if (mounted && !abortController.signal.aborted) {
            setError(err?.message || '상담 정보 조회에 실패했습니다.');
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

      fetchData();

      return () => {
        mounted = false;
        abortController.abort();
      };
    }, [appointmentId, isCounselor]);

    // 시간 정보 메모이제이션 (useMemo 최적화)
    const formattedTime = useMemo(() => {
      if (!detail?.time) return '';
      return Array.isArray(detail.time) ? detail.time.join('-') : detail.time;
    }, [detail?.time]);

    // 🎯 콘텐츠 렌더링 메모이제이션
    const content = useMemo(() => {
      if (loading) {
        return (
          <div className='space-y-2'>
            <Skeleton className='h-5 w-40' />
            <Skeleton className='h-4 w-64' />
            <Skeleton className='h-4 w-64' />
            <Skeleton className='h-4 w-64' />
            <Skeleton className='h-4 w-64' />
          </div>
        );
      }

      if (error) {
        return (
          <div className='rounded-lg bg-destructive/10 p-4 text-center'>
            <p className='text-sm text-destructive'>{error}</p>
          </div>
        );
      }

      if (!detail) return null;

      return (
        <div className={`space-y-${compact ? '3' : '4'}`}>
          {/* 기본 정보 그리드 */}
          <div
            className={`grid gap-${compact ? '2' : '4'} ${
              compact ? 'grid-cols-1' : 'grid-cols-2'
            }`}
          >
            <div>
              <div
                className={`text-${compact ? 'xs' : 'sm'} text-muted-foreground`}
              >
                이름
              </div>
              <div
                className={`text-foreground ${compact ? 'text-sm' : ''}`}
              >
                {detail.name}
              </div>
            </div>
            <div>
              <div
                className={`text-${compact ? 'xs' : 'sm'} text-muted-foreground`}
              >
                학교
              </div>
              <div
                className={`text-foreground ${compact ? 'text-sm' : ''}`}
              >
                {detail.school}
              </div>
            </div>
            <div>
              <div
                className={`text-${compact ? 'xs' : 'sm'} text-muted-foreground`}
              >
                이메일
              </div>
              <div
                className={`break-all text-foreground ${
                  compact ? 'text-sm' : ''
                }`}
              >
                {detail.email}
              </div>
            </div>
            <div>
              <div
                className={`text-${compact ? 'xs' : 'sm'} text-muted-foreground`}
              >
                전화번호
              </div>
              <div
                className={`text-foreground ${compact ? 'text-sm' : ''}`}
              >
                {detail.phone}
              </div>
            </div>
            <div>
              <div
                className={`text-${compact ? 'xs' : 'sm'} text-muted-foreground`}
              >
                상담 시간
              </div>
              <div
                className={`text-foreground ${compact ? 'text-sm' : ''}`}
              >
                {formattedTime}
              </div>
            </div>
            <div>
              <div
                className={`text-${compact ? 'xs' : 'sm'} text-muted-foreground`}
              >
                상담 유형
              </div>
              <div
                className={`text-foreground ${compact ? 'text-sm' : ''}`}
              >
                {detail.type}
              </div>
            </div>
          </div>

          {/* 그림 목록 */}
          <div className='pt-2'>
            <div
              className={`mb-2 font-medium text-${compact ? 'xs' : 'sm'}`}
            >
              그림 목록
            </div>
            <ImageGrid
              images={images}
              compact={compact}
              onImageClick={handleImageClick}
              inVideoCall={inVideoCall}
            />
          </div>

          {/* 상담사가 아닐 때만 설문 결과 영역 표시 */}
          {!isCounselor && (
            <div className='pt-4'>
              <div
                className={`mb-2 font-medium text-${compact ? 'xs' : 'sm'}`}
              >
                최근 설문 결과
              </div>
              <QuestionnaireGrid
                questionnaires={questionnaires}
                compact={compact}
              />
            </div>
          )}
        </div>
      );
    }, [
      loading,
      error,
      detail,
      compact,
      formattedTime,
      images,
      handleImageClick,
      isCounselor,
      questionnaires,
    ]);

    // 🎯 렌더링 (조건부 래핑)
    if (compact) {
      return (
        <div
          className={`h-full overflow-y-auto bg-white/95 p-4 backdrop-blur-sm ${className}`}
        >
          <div className='mb-4'>
            <h3 className='text-lg font-semibold text-foreground'>
              상담 상세
            </h3>
          </div>
          {content}
        </div>
      );
    }

    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>상담 상세정보</CardTitle>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    );
  }
);

CounselingDetailContent.displayName = 'CounselingDetailContent';
