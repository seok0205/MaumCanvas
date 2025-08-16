import { communityService } from '@/services/communityService';
import type {
  CommentListResponse,
  CommentWriteRequest,
} from '@/types/community';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useComments = (postId: number, enabled = true) =>
  useQuery({
    queryKey: ['community', 'comments', postId],
    queryFn: ({ signal }) => communityService.getComments(postId, signal),
    enabled: !!postId && enabled,
    staleTime: 1000 * 60 * 5, // 5분 - 댓글은 자주 변경되므로 적절한 staleTime 설정
    gcTime: 1000 * 60 * 10, // 10분 - 메모리에서 제거되는 시간
    retry: 2, // 실패 시 2번까지 재시도
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

export const useCreateComment = (postId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CommentWriteRequest) =>
      communityService.createComment(postId, data),
    onSuccess: () => {
      // 특정 게시글의 댓글 목록만 무효화
      queryClient.invalidateQueries({
        queryKey: ['community', 'comments', postId],
      });
      // 게시글 상세 정보도 무효화 (댓글 수 업데이트 등)
      queryClient.invalidateQueries({
        queryKey: ['community', 'post', postId],
      });
      toast.success('댓글이 작성되었습니다.');
    },
    onError: (err: any) => toast.error(err?.message || '댓글 작성 실패'),
    retry: 1, // 댓글 작성은 1번만 재시도
  });
};

export const useUpdateComment = (postId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CommentWriteRequest }) =>
      communityService.updateComment(postId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['community', 'comments', postId],
      });
      toast.success('댓글이 수정되었습니다.');
    },
    onError: (err: any) => toast.error(err?.message || '댓글 수정 실패'),
    retry: 1,
  });
};

export const useDeleteComment = (postId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => communityService.deleteComment(postId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['community', 'comments', postId],
      });
      // 게시글 상세 정보도 무효화 (댓글 수 업데이트)
      queryClient.invalidateQueries({
        queryKey: ['community', 'post', postId],
      });
      toast.success('댓글이 삭제되었습니다.');
    },
    onError: (err: any) => toast.error(err?.message || '댓글 삭제 실패'),
    retry: 1,
  });
};

export type EditableComment = CommentListResponse & { isEditing?: boolean };
