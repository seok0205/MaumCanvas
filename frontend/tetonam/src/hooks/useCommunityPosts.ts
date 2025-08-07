import { communityService } from '@/services/communityService';
import type { Community } from '@/types/community';
import { useInfiniteQuery } from '@tanstack/react-query';

interface UseCommunityPostsParams {
  size?: number;
}

interface PostsPage {
  posts: Community[];
  lastId?: number;
  hasNext: boolean;
}

export const useCommunityPosts = ({
  size = 10,
}: UseCommunityPostsParams = {}) => {
  return useInfiniteQuery({
    queryKey: ['community', 'posts', { size }],
    queryFn: async ({ pageParam = undefined, signal }) => {
      const queryParams: any = {
        lastId: pageParam,
        size,
      };

      const posts = await communityService.getPosts(queryParams, signal);

      const lastId =
        posts && posts.length > 0 ? posts[posts.length - 1]?.id : undefined;
      const hasNext = posts ? posts.length === size : false;

      return {
        posts: posts || [],
        lastId,
        hasNext,
      } as PostsPage;
    },
    getNextPageParam: lastPage =>
      lastPage.hasNext ? lastPage.lastId : undefined,
    initialPageParam: undefined as number | undefined,
    select: data => {
      // 모든 페이지의 게시글들을 평평하게 만들어 반환
      const allPosts = data.pages.flatMap(page => page.posts);
      const lastPage = data.pages[data.pages.length - 1];

      return {
        ...data,
        posts: allPosts,
        hasNextPage: lastPage?.hasNext ?? false,
      };
    },
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
  });
};
