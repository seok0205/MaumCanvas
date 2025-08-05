import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';

interface UseApiMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (
    data: TData | undefined,
    error: Error | null,
    variables: TVariables
  ) => void;
}

export const useApiMutation = <TData, TVariables>(
  options: UseApiMutationOptions<TData, TVariables>
) => {
  const mutation = useMutation({
    mutationFn: options.mutationFn,
    onSuccess: options.onSuccess,
    onError: options.onError,
    onSettled: options.onSettled,
    // 자동 재시도 비활성화 (사용자가 명시적으로 재시도하도록)
    retry: false,
    // 네트워크 에러 시에만 재시도
    retryOnMount: false,
  });

  const execute = useCallback(
    async (variables: TVariables) => {
      return mutation.mutateAsync(variables);
    },
    [mutation]
  );

  return {
    execute,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};
