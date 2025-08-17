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
    staleTime: 1000 * 60 * 5, // 5분 - 커뮤니티 게시글은 자주 변경되므로 적절한 staleTime 설정
    gcTime: 1000 * 60 * 10, // 10분 - 메모리 효율성을 위한 가비지 컬렉션 시간
    refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 재페칭 비활성화 (성능 최적화)
    retry: 3, // 실패 시 3번까지 재시도
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // 지수 백오프
  });
};
