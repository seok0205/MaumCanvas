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
    queryFn: () => communityService.getComments(postId),
    enabled: !!postId && enabled,
    staleTime: 1000 * 30,
  });

export const useCreateComment = (postId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CommentWriteRequest) =>
      communityService.createComment(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['community', 'comments', postId],
      });
      toast.success('댓글이 작성되었습니다.');
    },
    onError: (err: any) => toast.error(err?.message || '댓글 작성 실패'),
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
      toast.success('댓글이 삭제되었습니다.');
    },
    onError: (err: any) => toast.error(err?.message || '댓글 삭제 실패'),
  });
};

export type EditableComment = CommentListResponse & { isEditing?: boolean };
