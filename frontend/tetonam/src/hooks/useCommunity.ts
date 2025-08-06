import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';

import {
  COMMUNITY_ERROR_MESSAGES,
  COMMUNITY_QUERY_KEYS,
  COMMUNITY_SUCCESS_MESSAGES,
} from '@/constants/community';
import { communityService } from '@/services/communityService';
import { AuthenticationError } from '@/types/auth';
import type {
  CommentWriteRequest,
  PostListQuery,
  PostUpdateRequest,
  PostWriteRequest,
} from '@/types/community';

// === 게시글 관련 훅 ===

/**
 * 게시글 목록 조회 훅
 */
export const usePosts = (
  query: PostListQuery = {},
  enabled: boolean = true
) => {
  const queryKey = useMemo(
    () => COMMUNITY_QUERY_KEYS.postsList(query),
    [query]
  );

  return useQuery({
    queryKey,
    queryFn: ({ signal }) => communityService.getPosts(query, signal),
    enabled,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    retry: (failureCount, error) => {
      // 네트워크 에러가 아니면 재시도하지 않음
      if (error instanceof AuthenticationError) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * 게시글 단건 조회 훅
 */
export const usePost = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: COMMUNITY_QUERY_KEYS.post(id),
    queryFn: ({ signal }) => communityService.getPostById(id, signal),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    retry: (failureCount, error) => {
      if (
        error instanceof AuthenticationError &&
        error.code === 'POST_NOT_FOUND'
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

/**
 * 게시글 작성 훅
 */
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PostWriteRequest) => communityService.createPost(data),
    onSuccess: newPost => {
      // 게시글 목록 쿼리들을 무효화
      queryClient.invalidateQueries({
        queryKey: COMMUNITY_QUERY_KEYS.posts(),
      });

      // 새로 작성된 게시글을 캐시에 추가
      queryClient.setQueryData(COMMUNITY_QUERY_KEYS.post(newPost.id), newPost);

      toast.success(COMMUNITY_SUCCESS_MESSAGES.POST_CREATED);
    },
    onError: (error: Error) => {
      const message =
        error instanceof AuthenticationError
          ? error.message
          : COMMUNITY_ERROR_MESSAGES.POST_CREATE_FAILED;
      toast.error(message);
    },
    retry: false,
  });
};

/**
 * 게시글 수정 훅
 */
export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PostUpdateRequest }) =>
      communityService.updatePost(id, data),
    onSuccess: updatedPost => {
      // 해당 게시글의 캐시 업데이트
      queryClient.setQueryData(
        COMMUNITY_QUERY_KEYS.post(updatedPost.id),
        updatedPost
      );

      // 게시글 목록 쿼리들을 무효화 (업데이트된 내용 반영)
      queryClient.invalidateQueries({
        queryKey: COMMUNITY_QUERY_KEYS.posts(),
      });

      toast.success(COMMUNITY_SUCCESS_MESSAGES.POST_UPDATED);
    },
    onError: (error: Error) => {
      const message =
        error instanceof AuthenticationError
          ? error.message
          : COMMUNITY_ERROR_MESSAGES.POST_UPDATE_FAILED;
      toast.error(message);
    },
    retry: false,
  });
};

/**
 * 게시글 삭제 훅
 */
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => communityService.deletePost(id),
    onSuccess: (_, deletedId) => {
      // 해당 게시글의 캐시 제거
      queryClient.removeQueries({
        queryKey: COMMUNITY_QUERY_KEYS.post(deletedId),
      });

      // 게시글 목록 쿼리들을 무효화
      queryClient.invalidateQueries({
        queryKey: COMMUNITY_QUERY_KEYS.posts(),
      });

      // 해당 게시글의 댓글 캐시도 제거
      queryClient.removeQueries({
        queryKey: COMMUNITY_QUERY_KEYS.comments(deletedId),
      });

      toast.success(COMMUNITY_SUCCESS_MESSAGES.POST_DELETED);
    },
    onError: (error: Error) => {
      const message =
        error instanceof AuthenticationError
          ? error.message
          : COMMUNITY_ERROR_MESSAGES.POST_DELETE_FAILED;
      toast.error(message);
    },
    retry: false,
  });
};

// === 댓글 관련 훅 ===

/**
 * 댓글 목록 조회 훅
 */
export const useComments = (communityId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: COMMUNITY_QUERY_KEYS.comments(communityId),
    queryFn: ({ signal }) => communityService.getComments(communityId, signal),
    enabled: enabled && !!communityId,
    staleTime: 2 * 60 * 1000, // 2분 (댓글은 게시글보다 짧게)
    gcTime: 5 * 60 * 1000, // 5분
    retry: (failureCount, error) => {
      if (error instanceof AuthenticationError) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

/**
 * 댓글 작성 훅
 */
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      communityId,
      data,
    }: {
      communityId: number;
      data: CommentWriteRequest;
    }) => communityService.createComment(communityId, data),
    onSuccess: (_, { communityId }) => {
      // 댓글 목록을 무효화하여 새로고침
      queryClient.invalidateQueries({
        queryKey: COMMUNITY_QUERY_KEYS.comments(communityId),
      });

      toast.success(COMMUNITY_SUCCESS_MESSAGES.COMMENT_CREATED);
    },
    onError: (error: Error) => {
      const message =
        error instanceof AuthenticationError
          ? error.message
          : COMMUNITY_ERROR_MESSAGES.COMMENT_CREATE_FAILED;
      toast.error(message);
    },
    retry: false,
  });
};

/**
 * 댓글 수정 훅
 */
export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      communityId,
      commentId,
      data,
    }: {
      communityId: number;
      commentId: number;
      data: CommentWriteRequest;
    }) => communityService.updateComment(communityId, commentId, data),
    onSuccess: (_, { communityId }) => {
      // 댓글 목록을 무효화하여 새로고침
      queryClient.invalidateQueries({
        queryKey: COMMUNITY_QUERY_KEYS.comments(communityId),
      });

      toast.success(COMMUNITY_SUCCESS_MESSAGES.COMMENT_UPDATED);
    },
    onError: (error: Error) => {
      const message =
        error instanceof AuthenticationError
          ? error.message
          : COMMUNITY_ERROR_MESSAGES.COMMENT_UPDATE_FAILED;
      toast.error(message);
    },
    retry: false,
  });
};

/**
 * 댓글 삭제 훅
 */
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      communityId,
      commentId,
    }: {
      communityId: number;
      commentId: number;
    }) => communityService.deleteComment(communityId, commentId),
    onSuccess: (_, { communityId }) => {
      // 댓글 목록을 무효화하여 새로고침
      queryClient.invalidateQueries({
        queryKey: COMMUNITY_QUERY_KEYS.comments(communityId),
      });

      toast.success(COMMUNITY_SUCCESS_MESSAGES.COMMENT_DELETED);
    },
    onError: (error: Error) => {
      const message =
        error instanceof AuthenticationError
          ? error.message
          : COMMUNITY_ERROR_MESSAGES.COMMENT_DELETE_FAILED;
      toast.error(message);
    },
    retry: false,
  });
};

// === 복합 훅 ===

/**
 * 게시글과 댓글을 함께 조회하는 훅
 */
export const usePostWithComments = (id: number, enabled: boolean = true) => {
  const postQuery = usePost(id, enabled);
  const commentsQuery = useComments(id, enabled && !!postQuery.data);

  return useMemo(
    () => ({
      post: postQuery.data,
      comments: commentsQuery.data || [],
      isLoading: postQuery.isLoading || commentsQuery.isLoading,
      isError: postQuery.isError || commentsQuery.isError,
      error: postQuery.error || commentsQuery.error,
      refetch: useCallback(() => {
        postQuery.refetch();
        commentsQuery.refetch();
      }, [postQuery, commentsQuery]),
    }),
    [postQuery, commentsQuery]
  );
};

/**
 * 게시글 목록 무한 스크롤 훅 (향후 확장용)
 */
export const useInfinitePostsPrep = (
  baseQuery: Omit<PostListQuery, 'lastId'>
) => {
  // 현재는 단순 목록 조회만 반환하지만,
  // 나중에 useInfiniteQuery로 확장 가능
  return usePosts(baseQuery);
};

// === 유틸리티 훅 ===

/**
 * 커뮤니티 관련 모든 캐시를 새로고침하는 훅
 */
export const useRefreshCommunity = () => {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: COMMUNITY_QUERY_KEYS.all,
    });
  }, [queryClient]);
};

/**
 * 특정 게시글 관련 캐시를 새로고침하는 훅
 */
export const useRefreshPost = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (postId: number) => {
      queryClient.invalidateQueries({
        queryKey: COMMUNITY_QUERY_KEYS.post(postId),
      });
      queryClient.invalidateQueries({
        queryKey: COMMUNITY_QUERY_KEYS.comments(postId),
      });
    },
    [queryClient]
  );
};
