import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';

interface UseApiMutationOptions<
  TData,
  TVariables,
  TError = Error,
  TContext = unknown,
> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  // TanStack Query 표준 라이프사이클 콜백 (context 사용 가능)
  onMutate?: (
    variables: TVariables
  ) => Promise<TContext | void> | TContext | void;
  onSuccess?: (
    data: TData,
    variables: TVariables,
    context: TContext
  ) => unknown | Promise<unknown>;
  onError?: (
    error: TError,
    variables: TVariables,
    context: TContext | undefined
  ) => unknown | Promise<unknown>;
  onSettled?: (
    data: TData | undefined,
    error: TError | null,
    variables: TVariables,
    context: TContext | undefined
  ) => unknown | Promise<unknown>;
  // 재시도 설정 (기본: 0 = 비활성화)
  retry?: boolean | number | ((failureCount: number, error: TError) => boolean);
  retryDelay?: number | ((attempt: number, error: TError) => number);
  throwOnError?: boolean | ((error: TError) => boolean);
  mutationKey?: unknown[];
  gcTime?: number; // Infinity는 값이므로 타입에서는 number로 제한
  networkMode?: 'online' | 'always' | 'offlineFirst';
  meta?: Record<string, unknown>;
  scopeId?: string; // scope: { id } 간단화
}

export const useApiMutation = <
  TData,
  TVariables,
  TError = Error,
  TContext = unknown,
>(
  options: UseApiMutationOptions<TData, TVariables, TError, TContext>
) => {
  const baseOptions: any = {
    mutationFn: options.mutationFn,
    retry: options.retry ?? 0,
  };
  if (options.mutationKey)
    baseOptions.mutationKey = options.mutationKey as readonly unknown[];
  if (options.onMutate)
    baseOptions.onMutate = (vars: TVariables) => options.onMutate!(vars);
  if (options.onSuccess) baseOptions.onSuccess = options.onSuccess;
  if (options.onError) baseOptions.onError = options.onError;
  if (options.onSettled) baseOptions.onSettled = options.onSettled as any;
  if (options.retryDelay) baseOptions.retryDelay = options.retryDelay;
  if (options.throwOnError !== undefined)
    baseOptions.throwOnError = options.throwOnError as any;
  if (options.gcTime !== undefined) baseOptions.gcTime = options.gcTime;
  if (options.networkMode) baseOptions.networkMode = options.networkMode;
  if (options.scopeId) baseOptions.scope = { id: options.scopeId };
  if (options.meta) baseOptions.meta = options.meta;

  const mutation = useMutation<TData, TError, TVariables, TContext>(
    baseOptions
  );

  const execute = useCallback(
    async (variables: TVariables) => mutation.mutateAsync(variables),
    [mutation]
  );

  return {
    execute,
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    data: mutation.data as TData | undefined,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error as TError | null,
    status: mutation.status,
    reset: mutation.reset,
    variables: mutation.variables as TVariables | undefined,
    failureCount: mutation.failureCount,
    failureReason: mutation.failureReason as TError | null,
    submittedAt: mutation.submittedAt,
  };
};
