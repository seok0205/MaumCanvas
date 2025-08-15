import { useCallback, useEffect, useRef, useState } from 'react';

import { imageService } from '@/services/imageService';
import { useAuthStore } from '@/stores/useAuthStore';
import type { ApiErrorType } from '@/types/api';

// TypeScript 인터페이스 정의
interface UseDrawingAnalysisOptions {
  drawingId: string | null;
  autoFetch?: boolean;
  enablePolling?: boolean;
}

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

  // 액션
  setPrompt: (prompt: string) => void;
  refetch: () => Promise<void>;
  submitPrompt: () => Promise<void>;

  // 유틸리티
  isCounselor: boolean;
}

/**
 * 그림 분석 관련 비즈니스 로직을 담당하는 커스텀 훅
 *
 * @description AI 분석 결과, RAG 결과 페칭, 마크다운 처리, 프롬프트 제출 등
 * 그림 분석과 관련된 모든 비즈니스 로직을 캡슐화합니다.
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
 *   autoFetch: true,
 *   enablePolling: true
 * });
 * ```
 */
export const useDrawingAnalysis = ({
  drawingId,
  autoFetch = true,
  enablePolling = true,
}: UseDrawingAnalysisOptions): UseDrawingAnalysisReturn => {
  const { user } = useAuthStore();

  // 상태 관리
  const [aiText, setAiText] = useState<string>('');
  const [ragText, setRagText] = useState<string | null>(null);
  const [ragError, setRagError] = useState<ApiErrorType | null>(null);
  const [ragHtml, setRagHtml] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [loadingAI, setLoadingAI] = useState(true);
  const [loadingRAG, setLoadingRAG] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Refs for cleanup
  const pollTimer = useRef<number | null>(null);
  const abortController = useRef<AbortController | null>(null);

  // 상담사 여부 확인 (메모이제이션)
  const isCounselor = user?.roles?.includes('COUNSELOR') ?? false;

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

  // 데이터 페칭 함수 (useCallback으로 최적화)
  const fetchData = useCallback(async (id: string): Promise<void> => {
    // 이전 요청 취소
    if (abortController.current) {
      abortController.current.abort();
    }

    // 새로운 AbortController 생성
    abortController.current = new AbortController();
    const signal = abortController.current.signal;

    try {
      setLoadingRAG(true);
      setRagError(null);

      if (isCounselor) {
        // 상담사: AI 결과와 RAG 결과 모두 요청
        setLoadingAI(true);

        const [aiResult, ragResult] = await Promise.all([
          imageService.getAiDetectionText(id, signal),
          imageService.getRagResult(id, signal),
        ]);

        if (signal.aborted) return;

        setAiText(aiResult);
        setRagText(ragResult.data);

        if (ragResult.error) {
          setRagError(ragResult.error);

          // 폴링 설정 (RAG 결과가 준비되지 않은 경우)
          if (enablePolling && (ragResult.error === 'NOT_FOUND' || ragResult.error === 'RAG_NOT_READY')) {
            pollTimer.current = window.setTimeout(() => {
              fetchData(id);
            }, 3000);
          }
        }

        setLoadingAI(false);
      } else {
        // 학생: RAG 결과만 요청
        const ragResult = await imageService.getRagResult(id, signal);

        if (signal.aborted) return;

        setRagText(ragResult.data);

        if (ragResult.error) {
          setRagError(ragResult.error);

          // 폴링 설정 (RAG 결과가 준비되지 않은 경우)
          if (enablePolling && (ragResult.error === 'NOT_FOUND' || ragResult.error === 'RAG_NOT_READY')) {
            pollTimer.current = window.setTimeout(() => {
              fetchData(id);
            }, 3000);
          }
        }
      }
    } catch (error: any) {
      if (signal.aborted) return;

      console.error('❌ [useDrawingAnalysis] 데이터 페칭 실패:', error);
      setRagError(error?.type || 'UNKNOWN_ERROR');
    } finally {
      if (!signal.aborted) {
        setLoadingRAG(false);
      }
    }
  }, [isCounselor, enablePolling]);

  // 프롬프트 제출 함수 (useCallback으로 최적화)
  const submitPrompt = useCallback(async (): Promise<void> => {
    if (!prompt.trim() || !drawingId || submitting) return;

    try {
      setSubmitting(true);
      await imageService.submitRagPrompt(drawingId, prompt);
      setPrompt('');

      // 프롬프트 제출 후 데이터 다시 페칭
      await fetchData(drawingId);
    } catch (error) {
      console.error('❌ [useDrawingAnalysis] RAG 프롬프트 제출 실패:', error);
      throw error; // 호출자에게 에러 전파
    } finally {
      setSubmitting(false);
    }
  }, [prompt, drawingId, submitting, fetchData]);

  // 수동 리페치 함수
  const refetch = useCallback(async (): Promise<void> => {
    if (!drawingId) return;
    await fetchData(drawingId);
  }, [drawingId, fetchData]);

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

  // 데이터 자동 페칭
  useEffect(() => {
    if (!drawingId || !autoFetch) return;

    fetchData(drawingId);

    // 클린업 함수
    return () => {
      if (pollTimer.current) {
        clearTimeout(pollTimer.current);
        pollTimer.current = null;
      }
      if (abortController.current) {
        abortController.current.abort();
        abortController.current = null;
      }
    };
  }, [drawingId, autoFetch, fetchData]);

  // 컴포넌트 언마운트 시 클린업
  useEffect(() => {
    return () => {
      if (pollTimer.current) {
        clearTimeout(pollTimer.current);
      }
      if (abortController.current) {
        abortController.current.abort();
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

    // 액션
    setPrompt,
    refetch,
    submitPrompt,

    // 유틸리티
    isCounselor,
  };
};
