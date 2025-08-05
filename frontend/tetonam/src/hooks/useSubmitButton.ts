import { useCallback, useRef } from 'react';
import { useApiMutation } from './useApiMutation';

interface UseSubmitButtonOptions<TData, TVariables> {
  mutationFn: (variables: TVariables, signal?: AbortSignal) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
}

export const useSubmitButton = <TData, TVariables>(
  options: UseSubmitButtonOptions<TData, TVariables>
) => {
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useApiMutation({
    mutationFn: async (variables: TVariables) => {
      // 이전 요청이 있다면 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // 새로운 AbortController 생성
      abortControllerRef.current = new AbortController();

      try {
        return await options.mutationFn(
          variables,
          abortControllerRef.current.signal
        );
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('요청이 취소되었습니다.');
        }
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      options.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      options.onError?.(error, variables);
    },
  });

  const handleSubmit = useCallback(
    async (variables: TVariables) => {
      try {
        return await mutation.execute(variables);
      } catch (error) {
        // 에러는 상위 컴포넌트에서 처리
        throw error;
      }
    },
    [mutation]
  );

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    handleSubmit,
    isLoading: mutation.isLoading,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
    cancel,
  };
};
