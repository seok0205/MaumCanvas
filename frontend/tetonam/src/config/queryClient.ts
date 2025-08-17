/**
 * TanStack Query 클라이언트 설정
 * 간단하고 실용적인 설정으로 구성
 */

import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * 실용적인 QueryClient 인스턴스 생성
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 캐시 설정
      staleTime: 5 * 60 * 1000, // 5분 - 데이터가 fresh로 간주되는 시간
      gcTime: 10 * 60 * 1000, // 10분 - 가비지 컬렉션 시간

      // 재시도 설정 - TanStack Query 기본값 활용
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),

      // 리패칭 설정
      refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 재요청 비활성화
      refetchOnReconnect: true, // 네트워크 재연결 시 자동 재요청 활성화
      refetchOnMount: true, // 컴포넌트 마운트 시 재요청 활성화

      // 에러 처리
      throwOnError: false, // Error Boundary로 에러를 던지지 않음
    },
    mutations: {
      // 뮤테이션은 기본적으로 재시도하지 않음
      retry: false,

      // 에러 처리
      throwOnError: false,

      // 에러 발생 시 토스트 표시
      onError: (error: any) => {
        const message = error?.response?.data?.message || '오류가 발생했습니다';
        toast.error(message, {
          duration: 4000,
        });
      },
    },
  },
});
