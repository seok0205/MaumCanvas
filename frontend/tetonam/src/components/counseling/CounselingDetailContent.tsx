import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DrawingAnalysisContent } from '@/components/analysis/DrawingAnalysisContent';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/layout/card';
import { Separator } from '@/components/ui/layout/separator';
import { Skeleton } from '@/components/ui/layout/skeleton';
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
  onImageAnalysisRequest?: (imageId: number, imageUrl: string, category: string) => void;
}>(({ images, compact, onImageClick, inVideoCall = false, onImageAnalysisRequest }) => {
  const handleImageClick = useCallback((imageId: number, imageUrl: string, category: string) => {
    if (inVideoCall && onImageAnalysisRequest) {
      // 화상상담 중일 때는 분석 결과를 상담 상세 영역에 표시
      onImageAnalysisRequest(imageId, imageUrl, category);
    } else {
      // 일반 페이지에서는 기존 방식으로 페이지 이동
      onImageClick(imageId, imageUrl, category);
    }
  }, [inVideoCall, onImageAnalysisRequest, onImageClick]);
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
    
    // 화상상담 중 선택된 그림 분석 상태
    const [selectedImageAnalysis, setSelectedImageAnalysis] = useState<{
      imageId: number;
      imageUrl: string;
      category: string;
    } | null>(null);

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

    // 🎯 화상상담 중 그림 분석 요청 핸들러
    const handleImageAnalysisRequest = useCallback(
      (imageId: number, imageUrl: string, category: string) => {
        setSelectedImageAnalysis({ imageId, imageUrl, category });
      },
      []
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
      
      if (Array.isArray(detail.time)) {
        // 배열 형태의 시간 데이터를 사용자 친화적으로 포맷
        if (detail.time.length >= 2) {
          const date = detail.time[0];
          const time = detail.time[1];
          
          // 날짜와 시간을 조합해서 Date 객체 생성 시도
          try {
            const dateTimeString = `${date} ${time}`;
            const dateObj = new Date(dateTimeString);
            
            if (!isNaN(dateObj.getTime())) {
              return dateObj.toLocaleString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'short',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              });
            }
          } catch {
            // Date 생성 실패 시 원래 형식으로 표시
          }
          
          return `${date} ${time}`;
        }
        return detail.time.join(' ');
      }
      
      // 문자열 형태의 시간 데이터 처리
      if (typeof detail.time === 'string') {
        // ISO 날짜 형식이면 포맷팅
        if (detail.time.includes('T') || detail.time.includes('-')) {
          try {
            const dateObj = new Date(detail.time);
            if (!isNaN(dateObj.getTime())) {
              return dateObj.toLocaleString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'short',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              });
            }
          } catch {
            return detail.time;
          }
        }
      }
      
      return detail.time;
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
          <Separator className="my-4" />
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
              onImageAnalysisRequest={handleImageAnalysisRequest}
            />
          </div>

          {/* 화상상담 중 선택된 그림 분석 결과 */}
          {inVideoCall && selectedImageAnalysis && (
            <>
              <Separator className="my-4" />
              <div className='pt-4'>
                <div className={`mb-2 font-medium text-${compact ? 'xs' : 'sm'}`}>
                  그림 분석 결과 - {selectedImageAnalysis.category}
                </div>
                <DrawingAnalysisContent
                  drawingId={selectedImageAnalysis.imageId.toString()}
                  imageUrl={selectedImageAnalysis.imageUrl}
                  category={selectedImageAnalysis.category}
                  compact={compact}
                  showImage={false} // 이미 위에서 그림을 보여줬으므로 중복 표시 안함
                  autoFetch={true}
                  inVideoCall={inVideoCall}
                />
              </div>
            </>
          )}

          {/* 상담사가 아닐 때만 설문 결과 영역 표시 */}
          {!isCounselor && (
            <>
              <Separator className="my-4" />
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
            </>
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
      handleImageAnalysisRequest,
      isCounselor,
      questionnaires,
      inVideoCall,
      selectedImageAnalysis,
    ]);

    // 🎯 렌더링 (조건부 래핑)
    if (compact) {
      return (
        <Card className={`h-full flex flex-col ${className}`}>
          <CardHeader className="flex-shrink-0 pb-3">
            <CardTitle className="text-lg">상담 상세정보</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="flex-1 overflow-y-auto pt-4 pb-4">
            {content}
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>상담 상세정보</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">{content}</CardContent>
      </Card>
    );
  }
);

CounselingDetailContent.displayName = 'CounselingDetailContent';
