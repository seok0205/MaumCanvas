import { communityService } from '@/services/communityService';
import type { PostPageItem } from '@/types/community';
import { useInfiniteQuery } from '@tanstack/react-query';

interface UseCommunityPostsParams {
  size?: number;
  nickname?: string | undefined;
}

interface PostsPage {
  posts: PostPageItem[];
  page: number;
  hasNext: boolean;
}

export const useCommunityPosts = ({
  size = 10,
  nickname,
}: UseCommunityPostsParams = {}) => {
  return useInfiniteQuery<
    PostsPage,
    unknown,
    { pages: PostsPage[]; posts: PostPageItem[]; hasNextPage: boolean }
  >({
    queryKey: ['community', 'posts', { size, nickname }],
    queryFn: async ({ pageParam = 0 as number, signal }) => {
      const baseQuery: any = { lastId: pageParam as number, size };
      if (nickname && nickname.trim().length > 0) {
        baseQuery.nickname = nickname.trim();
      }
      const posts = await communityService.getPosts(baseQuery, signal);
      const hasNext = Array.isArray(posts) && posts.length === size;
      return { posts: posts || [], page: pageParam as number, hasNext };
    },
    getNextPageParam: lastPage =>
      lastPage.hasNext ? lastPage.page + 1 : undefined,
    initialPageParam: 0 as number,
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
