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

    // TanStack Query Mutation Scope를 사용하여 동일한 postId에 대한 댓글 작성을 순차적으로 처리
    scope: {
      id: `comment-create-${postId}`,
    },

    // Optimistic Update for comment creation
    onMutate: async (data) => {
      // 중복 요청 방지: 진행 중인 댓글 쿼리들을 취소
      await queryClient.cancelQueries({
        queryKey: ['community', 'comments', postId],
      });

      // 이전 댓글 목록 저장 (롤백용)
      const previousComments = queryClient.getQueryData<CommentListResponse[]>([
        'community',
        'comments',
        postId,
      ]);

      // 안전한 임시 ID 생성 (Date.now() + 랜덤값으로 충돌 방지)
      const tempId = Date.now() + Math.random() * 1000;
      const optimisticComment: CommentListResponse = {
        id: tempId,
        content: data.content,
        nickname: '작성중...', // 임시 닉네임
        createdDate: new Date().toISOString(),
      };

      // Optimistic Update: 새 댓글을 목록에 추가
      queryClient.setQueryData<CommentListResponse[]>(
        ['community', 'comments', postId],
        (old) => {
          if (!old) return [optimisticComment];
          return [...old, optimisticComment];
        }
      );

      return { previousComments, tempId };
    },

    onSuccess: (newComment, _variables, context) => {
      // 방어적 프로그래밍: author 정보가 없는 경우 처리
      console.log('🔍 댓글 생성 응답:', newComment);

      if (!newComment || !newComment.author) {
        console.error('❌ 댓글 생성 응답에 author 정보가 없습니다:', newComment);
        // author 정보가 없어도 기본값으로 처리
        const fallbackComment: CommentListResponse = {
          id: newComment?.id || Date.now(),
          content: newComment?.content || _variables.content,
          nickname: '사용자', // fallback 닉네임
          createdDate: new Date().toISOString(),
        };

        queryClient.setQueryData<CommentListResponse[]>(
          ['community', 'comments', postId],
          (old) => {
            if (!old) return [fallbackComment];
            return old.map((comment) =>
              comment.id === context?.tempId ? fallbackComment : comment
            );
          }
        );
        return;
      }

      // Comment 타입을 CommentListResponse 타입으로 변환
      const convertedComment: CommentListResponse = {
        id: newComment.id,
        content: newComment.content,
        nickname: newComment.author?.nickname || '사용자', // 안전한 접근
        createdDate: newComment.createdAt,
      };

      // 서버에서 받은 실제 댓글로 교체
      queryClient.setQueryData<CommentListResponse[]>(
        ['community', 'comments', postId],
        (old) => {
          if (!old) return [convertedComment];
          // 임시 댓글을 실제 댓글로 교체
          return old.map((comment) =>
            comment.id === context?.tempId ? convertedComment : comment
          );
        }
      );

      // 게시글 무효화 제거: 댓글 작성만으로는 게시글 정보가 변경되지 않음
      // 댓글 수 등이 실시간 업데이트가 필요하다면 별도 처리
      toast.success('댓글이 작성되었습니다.');
    },

    onError: (err: any, _variables, context) => {
      console.error('❌ 댓글 작성 API 에러:', err);

      // 실패 시 이전 상태로 롤백
      if (context?.previousComments) {
        queryClient.setQueryData(
          ['community', 'comments', postId],
          context.previousComments
        );
      }

      // 에러 메시지 표시 (네트워크 에러와 일반 에러 구분)
      const errorMessage = err?.name === 'AbortError'
        ? '요청이 취소되었습니다.'
        : err?.message || '댓글 작성에 실패했습니다.';

      toast.error(errorMessage);
    },

    onSettled: () => {
      // onSuccess에서 이미 적절히 처리했으므로 추가 무효화 불필요
      // 에러 시에는 onError에서 rollback 처리됨
    },

    // 중복 방지를 위한 retry 설정: 댓글 작성은 재시도하지 않음
    retry: false,

    // 네트워크 모드 설정: 오프라인에서도 optimistic update 동작
    networkMode: 'offlineFirst',
  });
};

export const useUpdateComment = (postId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CommentWriteRequest }) =>
      communityService.updateComment(postId, id, data),

    // TanStack Query Mutation Scope를 사용하여 동일한 댓글의 중복 수정 방지
    scope: {
      id: `comment-update-${postId}`,
    },

    // Optimistic Update: 즉시 UI 업데이트
    onMutate: async ({ id, data }) => {
      // 중복 요청 방지: 진행 중인 쿼리들을 취소
      await queryClient.cancelQueries({
        queryKey: ['community', 'comments', postId]
      });

      // 이전 데이터 스냅샷 저장 (롤백용)
      const previousComments = queryClient.getQueryData<CommentListResponse[]>([
        'community',
        'comments',
        postId
      ]);

      // Optimistic Update: 캐시를 즉시 업데이트
      queryClient.setQueryData<CommentListResponse[]>(
        ['community', 'comments', postId],
        (old) => {
          if (!old) return old;
          // 불변성을 유지하며 해당 댓글만 업데이트
          return old.map((comment) =>
            comment.id === id
              ? { ...comment, content: data.content }
              : comment
          );
        }
      );

      // 롤백을 위한 컨텍스트 반환
      return { previousComments, commentId: id };
    },

    onSuccess: (updatedComment, { id }) => {
      // 서버 응답으로 최종 업데이트 (서버 데이터가 우선)
      queryClient.setQueryData<CommentListResponse[]>(
        ['community', 'comments', postId],
        (old) => {
          if (!old) return old;
          return old.map((comment) =>
            comment.id === id
              ? {
                  id: updatedComment.id,
                  content: updatedComment.content,
                  nickname: comment.nickname, // 기존 닉네임 유지
                  createdDate: comment.createdDate, // 기존 생성일 유지
                }
              : comment
          );
        }
      );
      toast.success('댓글이 수정되었습니다.');
    },

    // 실패 시 이전 상태로 롤백
    onError: (err: any, _variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          ['community', 'comments', postId],
          context.previousComments
        );
      }
      toast.error(err?.message || '댓글 수정 실패');
    },

    // onSettled에서 invalidateQueries 제거 - optimistic update로 충분
    // 중복 요청을 방지하고 성능을 개선하기 위해 서버 상태 동기화는 제거
    onSettled: () => {
      // 필요시에만 background refetch (현재는 optimistic update로 충분)
      // queryClient.invalidateQueries({
      //   queryKey: ['community', 'comments', postId],
      // });
    },

    // 재시도 없음 - 댓글 수정 실패 시 사용자가 직접 재시도
    retry: false,
  });
};

export const useDeleteComment = (postId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => communityService.deleteComment(postId, id),

    // TanStack Query Mutation Scope를 사용하여 동일한 댓글의 중복 삭제 방지
    scope: {
      id: `comment-delete-${postId}`,
    },

    // Optimistic Update for comment deletion
    onMutate: async (commentId) => {
      // 중복 요청 방지
      await queryClient.cancelQueries({
        queryKey: ['community', 'comments', postId],
      });

      // 이전 댓글 목록 저장
      const previousComments = queryClient.getQueryData<CommentListResponse[]>([
        'community',
        'comments',
        postId,
      ]);

      // Optimistic Update: 댓글을 목록에서 즉시 제거
      queryClient.setQueryData<CommentListResponse[]>(
        ['community', 'comments', postId],
        (old) => {
          if (!old) return old;
          return old.filter((comment) => comment.id !== commentId);
        }
      );

      return { previousComments, commentId };
    },

    onSuccess: () => {
      // 게시글 상세 정보도 무효화 (댓글 수 업데이트)
      queryClient.invalidateQueries({
        queryKey: ['community', 'post', postId],
      });
      toast.success('댓글이 삭제되었습니다.');
    },

    onError: (err: any, _variables, context) => {
      // 실패 시 이전 상태로 롤백
      if (context?.previousComments) {
        queryClient.setQueryData(
          ['community', 'comments', postId],
          context.previousComments
        );
      }
      toast.error(err?.message || '댓글 삭제 실패');
    },

    onSettled: () => {
      // 최종 서버 상태와 동기화
      queryClient.invalidateQueries({
        queryKey: ['community', 'comments', postId],
      });
    },

    retry: 1,
  });
};

export type EditableComment = CommentListResponse & { isEditing?: boolean };
