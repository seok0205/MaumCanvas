import { communityService } from '@/services/communityService';
import type { PostUpdateRequest, PostWriteRequest } from '@/types/community';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// 게시글 작성
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PostWriteRequest) => communityService.createPost(data),
    onSuccess: () => {
      // 게시글 목록 무효화
      queryClient.invalidateQueries({
        queryKey: ['community', 'posts'],
        exact: false,
      });
      toast.success('게시글이 작성되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error?.message || '게시글 작성에 실패했습니다.');
    },
  });
};

// 게시글 수정
export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PostUpdateRequest }) =>
      communityService.updatePost(id, data),
    onSuccess: (_, { id }) => {
      // 특정 게시글과 목록 무효화
      queryClient.invalidateQueries({
        queryKey: ['community', 'post', id],
      });
      queryClient.invalidateQueries({
        queryKey: ['community', 'posts'],
        exact: false,
      });
      toast.success('게시글이 수정되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error?.message || '게시글 수정에 실패했습니다.');
    },
  });
};

// 게시글 삭제
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => communityService.deletePost(id),
    onSuccess: (_, id) => {
      // 특정 게시글과 목록 무효화
      queryClient.removeQueries({
        queryKey: ['community', 'post', id],
      });
      queryClient.invalidateQueries({
        queryKey: ['community', 'posts'],
        exact: false,
      });
      toast.success('게시글이 삭제되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error?.message || '게시글 삭제에 실패했습니다.');
    },
  });
};
