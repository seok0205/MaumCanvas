import { communityService } from '@/services/communityService';
import type { Community, CommunityCategory } from '@/types/community';
import { useInfiniteQuery } from '@tanstack/react-query';

interface UseCommunityPostsParams {
  category?: CommunityCategory;
  sort?: 'latest' | 'popular';
  size?: number;
}

interface PostsPage {
  posts: Community[];
  lastId?: number;
  hasNext: boolean;
}

export const useCommunityPosts = ({
  category,
  sort = 'latest',
  size = 10,
}: UseCommunityPostsParams = {}) => {
  return useInfiniteQuery({
    queryKey: ['community', 'posts', { category, sort, size }],
    queryFn: async ({ pageParam = undefined, signal }) => {
      const queryParams: any = {
        sort,
        lastId: pageParam,
        size,
      };

      // category가 있을 때만 추가
      if (category) {
        queryParams.category = category;
      }

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
