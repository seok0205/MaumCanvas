import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { imageService } from '@/services/imageService';
import { useAuthStore } from '@/stores/useAuthStore';
import type { ApiErrorType } from '@/types/api';

// TypeScript 인터페이스 정의
interface UseDrawingAnalysisOptions {
  drawingId: string | null;
  autoFetch?: boolean;
}

// 폴링 타입 정의
type PollingType = 'none' | 'after-prompt';

interface UseDrawingAnalysisReturn {
  // 상태
  aiText: string;
  ragText: string | null;
  ragHtml: string;
  ragError: ApiErrorType | null;
  prompt: string;
  loadingAI: boolean;
  loadingRAG: boolean;
  submitting: boolean;
  isPollingAfterPrompt: boolean;

  // 액션
  setPrompt: (prompt: string) => void;
  refetch: () => Promise<void>;
  submitPrompt: () => Promise<void>;

  // 유틸리티
  isCounselor: boolean;
}

// 쿼리 키 팩토리
const queryKeys = {
  drawingAnalysis: (drawingId: string) => ['drawing-analysis', drawingId] as const,
  aiDetection: (drawingId: string) => ['ai-detection', drawingId] as const,
  ragResult: (drawingId: string) => ['rag-result', drawingId] as const,
};

/**
 * 그림 분석 관련 비즈니스 로직을 담당하는 커스텀 훅 (TanStack Query 최적화 버전)
 *
 * @description AI 분석 결과, RAG 결과 페칭, 마크다운 처리, 프롬프트 제출 등
 * 그림 분석과 관련된 모든 비즈니스 로직을 캡슐화합니다.
 * TanStack Query를 사용하여 자동 캐싱, 백그라운드 업데이트, 에러 처리를 최적화했습니다.
 *
 * @param options 훅 설정 옵션
 * @returns 그림 분석 관련 상태와 액션들
 *
 * @example
 * ```tsx
 * const {
 *   aiText,
 *   ragHtml,
 *   loadingAI,
 *   submitPrompt,
 *   isCounselor
 * } = useDrawingAnalysis({
 *   drawingId: '123',
 *   autoFetch: true
 * });
 * ```
 */
export const useDrawingAnalysis = ({
  drawingId,
  autoFetch = true,
}: UseDrawingAnalysisOptions): UseDrawingAnalysisReturn => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // 상태 관리
  const [ragHtml, setRagHtml] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pollingType, setPollingType] = useState<PollingType>('none');
  const [isPollingAfterPrompt, setIsPollingAfterPrompt] = useState(false);
  const [isPollingReady, setIsPollingReady] = useState(false);

  // Refs for cleanup
  const pollTimer = useRef<number | null>(null);

  // 상담사 여부 확인 (메모이제이션)
  const isCounselor = user?.roles?.includes('COUNSELOR') ?? false;

  // AI 감지 결과 쿼리 (상담사만 사용)
  const {
    data: aiText = '',
    isLoading: loadingAI,
  } = useQuery({
    queryKey: queryKeys.aiDetection(drawingId || ''),
    queryFn: async () => {
      if (!drawingId) throw new Error('Drawing ID is required');
      return imageService.getAiDetectionText(drawingId);
    },
    enabled: !!(drawingId && autoFetch && isCounselor),
    staleTime: 10 * 60 * 1000, // 10분간 fresh 유지
    gcTime: 30 * 60 * 1000, // 30분간 캐시 유지
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  // RAG 결과 쿼리 (역할 기반 폴링 설정)
  const {
    data: ragResult,
    isLoading: loadingRAG,
    refetch: refetchRag,
  } = useQuery({
    queryKey: queryKeys.ragResult(drawingId || ''),
    queryFn: async () => {
      if (!drawingId) throw new Error('Drawing ID is required');
      return imageService.getRagResult(drawingId);
    },
    enabled: !!(drawingId && autoFetch && (
      pollingType !== 'after-prompt' || isPollingReady
    )), // 프롬프트 제출 후에는 isPollingReady가 true일 때만 쿼리 활성화
    staleTime: isCounselor ? 0 : 5 * 60 * 1000, // 상담사: 즉시 stale, 학생: 5분간 fresh
    gcTime: 30 * 60 * 1000, // 30분간 캐시 유지
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    // 역할 기반 폴링 설정
    refetchInterval: (query) => {
      // 학생은 폴링 비활성화
      if (!isCounselor) return false;
      
      // 프롬프트 제출 후 폴링 모드가 아니면 비활성화
      if (pollingType !== 'after-prompt') return false;
      
      // RAG 결과가 성공적이면 폴링 중지
      const data = query.state.data as Awaited<ReturnType<typeof imageService.getRagResult>> | undefined;
      if (data && !data.error) {
        return false;
      }
      
      // 에러가 있으면 3초 간격으로 폴링
      return 3000;
    },
    refetchIntervalInBackground: true, // 백그라운드에서도 폴링 유지
  });

  // RAG 결과에서 데이터와 에러 추출
  const ragText = ragResult?.data || null;
  const ragError = ragResult?.error || null;

  // 텍스트 전처리 함수 (useCallback으로 최적화)
  const preprocessText = useCallback((text: string): string => {
    if (!text) return '';

    return text
      .trim() // 앞뒤 공백 제거
      .replace(/^"(.*)"$/s, '$1') // 전체를 감싸는 쌍따옴표 제거
      .replace(/\\n/g, '\n') // 이스케이프된 줄바꿈을 실제 줄바꿈으로 변환
      .replace(/\\"/g, '"') // 이스케이프된 쌍따옴표 복원
      .replace(/[\u200B\u200C\u200D\u200E\u200F\uFEFF]/g, '') // Zero-width space 제거
      .replace(/\u00A0/g, ' ') // Non-breaking space를 일반 공백으로 변환
      .replace(/\r\n/g, '\n') // Windows CRLF를 LF로 통일
      .replace(/\r/g, '\n'); // 남은 CR을 LF로 변환
  }, []);

  // 마크다운을 HTML로 변환 (useCallback으로 최적화)
  const convertMarkdownToHtml = useCallback(async (markdown: string): Promise<string> => {
    if (!markdown) return '';

    try {
      const [m, d] = await Promise.all([
        import('marked'),
        import('dompurify'),
      ]);

      // 텍스트 전처리
      const preprocessedText = preprocessText(markdown);

      // marked.js 설정 (Best Practices 적용)
      const markedOptions = {
        gfm: true, // GitHub Flavored Markdown 활성화
        breaks: true, // 줄바꿈을 <br>로 변환
        silent: false, // 오류 시 콘솔에 출력 (디버깅용)
        sanitize: false, // DOMPurify를 별도로 사용하므로 비활성화
        smartypants: true, // 스마트 인용부호 변환
        smartLists: true, // 스마트 리스트 처리
        pedantic: false, // 원본 markdown.pl과의 호환성 비활성화 (현대적 사용)
      };

      // 마크다운을 HTML로 변환
      const raw = m.marked.parse(preprocessedText, markedOptions) as string;

      // DOMPurify 설정 (보안 강화 및 Best Practices)
      const purifyOptions = {
        ALLOWED_TAGS: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br',
          'strong', 'em', 'u', 's', 'del', 'mark',
          'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
          'a', 'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
          'hr', 'div', 'span',
        ],
        ALLOWED_ATTR: [
          'href', 'src', 'alt', 'title', 'class', 'id',
          'target', 'rel', 'style', 'width', 'height',
          'colspan', 'rowspan',
        ],
        ALLOW_DATA_ATTR: false,
        ALLOW_ARIA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false,
        SANITIZE_DOM: true,
        WHOLE_DOCUMENT: false,
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false,
        RETURN_TRUSTED_TYPE: false,
      };

      return d.default.sanitize(raw, purifyOptions);
    } catch (error) {
      console.error('❌ [useDrawingAnalysis] 마크다운 처리 중 오류:', error);
      // 마크다운 처리 실패 시 전처리된 텍스트를 그대로 반환
      return preprocessText(markdown).replace(/\n/g, '<br>');
    }
  }, [preprocessText]);

  // 프롬프트 제출 함수 (useCallback으로 최적화)
  const submitPrompt = useCallback(async (): Promise<void> => {
    if (!prompt.trim() || !drawingId || submitting) return;

    try {
      setSubmitting(true);
      await imageService.submitRagPrompt(drawingId, prompt);
      setPrompt('');

      // 프롬프트 제출 후 폴링 설정 (상담사만)
      if (isCounselor) {
        setPollingType('after-prompt');
        setIsPollingAfterPrompt(true);
        setIsPollingReady(false); // 초기에는 폴링 비활성화
        
        // 15초 후 폴링 시작을 위한 타이머 설정
        pollTimer.current = window.setTimeout(() => {
          setIsPollingReady(true); // 15초 후에 폴링 활성화
        }, 15000);
      }
    } catch (error) {
      console.error('❌ [useDrawingAnalysis] RAG 프롬프트 제출 실패:', error);
      throw error; // 호출자에게 에러 전파
    } finally {
      setSubmitting(false);
    }
  }, [prompt, drawingId, submitting, isCounselor, queryClient]);

  // 수동 리페치 함수
  const refetch = useCallback(async (): Promise<void> => {
    if (!drawingId) return;

    // 기존 폴링 중지
    if (pollTimer.current) {
      clearTimeout(pollTimer.current);
      pollTimer.current = null;
    }
    setPollingType('none');
    setIsPollingAfterPrompt(false);
    setIsPollingReady(false);

    // TanStack Query를 사용한 수동 리페치
    try {
      // RAG 결과 리페치
      await refetchRag();
      
      // 상담사인 경우 AI 결과도 같이 리페치
      if (isCounselor) {
        await queryClient.refetchQueries({ 
          queryKey: queryKeys.aiDetection(drawingId),
          exact: true 
        });
      }
    } catch (error) {
      console.error('❌ [useDrawingAnalysis] 수동 리페치 실패:', error);
      throw error;
    }
  }, [drawingId, isCounselor, refetchRag, queryClient]);

  // RAG 텍스트가 변경될 때 HTML 변환
  useEffect(() => {
    let cancelled = false;

    const convertToHtml = async () => {
      if (!ragText) {
        setRagHtml('');
        return;
      }

      const html = await convertMarkdownToHtml(ragText);
      if (!cancelled) {
        setRagHtml(html);
      }
    };

    convertToHtml();

    return () => {
      cancelled = true;
    };
  }, [ragText, convertMarkdownToHtml]);

  // 폴링 성공 시 상태 초기화
  useEffect(() => {
    if (ragResult && !ragResult.error && pollingType === 'after-prompt') {
      setPollingType('none');
      setIsPollingAfterPrompt(false);
      setIsPollingReady(false);
      
      if (pollTimer.current) {
        clearTimeout(pollTimer.current);
        pollTimer.current = null;
      }
    }
  }, [ragResult, pollingType]);

  // 컴포넌트 언마운트 시 클린업
  useEffect(() => {
    return () => {
      if (pollTimer.current) {
        clearTimeout(pollTimer.current);
      }
    };
  }, []);

  return {
    // 상태
    aiText,
    ragText,
    ragHtml,
    ragError,
    prompt,
    loadingAI,
    loadingRAG,
    submitting,
    isPollingAfterPrompt,

    // 액션
    setPrompt,
    refetch,
    submitPrompt,

    // 유틸리티
    isCounselor,
  };
};
