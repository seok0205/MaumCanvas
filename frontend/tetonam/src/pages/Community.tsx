import { Clock, MessageCircle, PlusCircle, Search, User } from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { AppSidebar } from '@/components/layout/AppSidebar';
import { CommonHeader } from '@/components/layout/CommonHeader';
import { Badge } from '@/components/ui/data-display/badge';
import { Alert, AlertDescription } from '@/components/ui/feedback/alert';
import { LoadingSpinner } from '@/components/ui/feedback/loading-spinner';
import { Input } from '@/components/ui/forms/input';
import { Button } from '@/components/ui/interactive/button';
import { Card, CardContent, CardHeader } from '@/components/ui/layout/card';
import {
  MobileSidebarToggle,
  SidebarProvider,
} from '@/components/ui/navigation/sidebar';
import { useCommunityPosts } from '@/hooks/useCommunityPosts';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAuthStore } from '@/stores/useAuthStore';
import type { PostPageItem } from '@/types/community';
import { CATEGORY_LABELS } from '@/types/community';
import { cn } from '@/utils/cn';
import { formatRelativeTime } from '@/utils/communityUtils';

interface CommunityPageProps {
  // 향후 확장을 위한 props
}

export const CommunityPage = ({}: CommunityPageProps) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'nickname' | 'title'>(
    'nickname'
  );
  const debouncedSearch = useDebouncedValue(searchQuery.trim(), { delay: 300 });

  // 서버 검색(닉네임) 파라미터 구성
  const effectiveNickname =
    searchType === 'nickname' && debouncedSearch.length > 0
      ? debouncedSearch
      : undefined;

  const {
    data: posts,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useCommunityPosts({ nickname: effectiveNickname });

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current) return;
    if (!hasNextPage) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver(
      entries => {
        const first = entries[0];
        if (first?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: null, rootMargin: '0px 0px 240px 0px', threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleCreatePost = useCallback(() => {
    navigate('/community/create');
  }, [navigate]);
  const handlePostClick = useCallback(
    (id: number) => navigate(`/community/${id}`),
    [navigate]
  );

  const layoutShell = (content: React.ReactNode) => (
    <SidebarProvider>
      <div className='flex min-h-screen w-full bg-gradient-to-b from-orange-50 via-orange-25 to-slate-50'>
        <AppSidebar />
        <div className='flex-1 flex flex-col'>
          <CommonHeader
            title='커뮤니티'
            user={(user as any) || { roles: [] }}
          />
          <div className='container mx-auto px-4 py-8 flex flex-col gap-6'>
            {content}
          </div>
        </div>
        <MobileSidebarToggle />
      </div>
    </SidebarProvider>
  );

  if (isLoading) {
    return layoutShell(
      <div className='flex items-center justify-center h-64'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  if (isError) {
    return layoutShell(
      <Alert variant='destructive'>
        <AlertDescription>
          게시글을 불러오는 중 오류가 발생했습니다. {(error as any)?.message}
        </AlertDescription>
      </Alert>
    );
  }

  return layoutShell(
    <>
      <Card className='mb-4 border border-orange-100/50 shadow-xl bg-orange-50/90 backdrop-blur-sm'>
        <CardHeader className='pb-4'>
          <div className='flex flex-col gap-4'>
            <div className='flex-1'>
              <div className='flex items-center gap-2 mb-2'>
                <Search className='w-4 h-4 text-slate-600' />
                <span className='text-sm font-medium text-slate-700'>검색</span>
              </div>
              <div className='flex gap-2'>
                <select
                  value={searchType}
                  onChange={e =>
                    setSearchType(e.target.value as 'nickname' | 'title')
                  }
                  className='w-28 rounded-md border border-slate-200 bg-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40 shadow-sm'
                  aria-label='검색 유형'
                >
                  <option value='nickname'>닉네임</option>
                  <option value='title'>제목</option>
                </select>
                <Input
                  placeholder={
                    searchType === 'nickname'
                      ? '닉네임으로 검색'
                      : '제목으로 검색'
                  }
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='border-slate-200 focus:border-orange-400 focus:ring-orange-400/20 flex-1 shadow-sm bg-white'
                  aria-label='검색어'
                />
              </div>
              {searchType === 'title' && (
                <p className='mt-1 text-[11px] text-slate-500'>
                  제목 검색은 클라이언트 필터링입니다.
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* 검색창과 게시글 목록 사이 영역 - 글 작성 버튼 */}
      {user && (
        <div className='mb-4 flex justify-end py-3 px-4 bg-white/40 backdrop-blur-sm border-l-4 border-orange-300 rounded-r-lg'>
          <Button
            onClick={handleCreatePost}
            className='bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white font-medium px-6 py-2.5 rounded-lg shadow-lg transition-all hover:shadow-xl hover:scale-105'
          >
            <PlusCircle className='w-4 h-4 mr-2' />
            글 작성
          </Button>
        </div>
      )}
      <PostList
        rawPosts={posts?.posts || []}
        searchType={searchType}
        searchValue={debouncedSearch}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        sentinelRef={sentinelRef}
        onLoadMore={fetchNextPage}
        onClickPost={handlePostClick}
        userLoggedIn={!!user}
        onCreatePost={handleCreatePost}
      />
    </>
  );
};

interface PostListProps {
  rawPosts: PostPageItem[];
  searchType: 'nickname' | 'title';
  searchValue: string;
  isFetchingNextPage: boolean;
  hasNextPage?: boolean;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  onLoadMore: () => void; // reserved
  onClickPost: (id: number) => void;
  userLoggedIn: boolean;
  onCreatePost: () => void;
}

const PostList = React.memo(
  ({
    rawPosts,
    searchType,
    searchValue,
    isFetchingNextPage,
    hasNextPage,
    sentinelRef,
    onClickPost,
    userLoggedIn,
    onCreatePost,
  }: PostListProps) => {
    const filtered = useMemo(() => {
      if (searchType === 'title' && searchValue) {
        const lower = searchValue.toLowerCase();
        return rawPosts.filter(p => p.title.toLowerCase().includes(lower));
      }
      return rawPosts;
    }, [rawPosts, searchType, searchValue]);

    if (filtered.length === 0) {
      return (
        <div className='flex-1'>
          <Card className='border border-slate-200 shadow-lg bg-slate-50/80 backdrop-blur-sm'>
            <CardContent className='p-12 text-center'>
              <div className='space-y-4'>
                <div className='w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto shadow-inner'>
                  <MessageCircle className='w-8 h-8 text-orange-400' />
                </div>
                <div>
                  <h3 className='text-lg font-medium text-slate-800 mb-2'>
                    결과가 없습니다
                  </h3>
                  <p className='text-slate-600 mb-6'>
                    검색 조건을 변경해 보세요.
                  </p>
                  {userLoggedIn && (
                    <Button
                      onClick={onCreatePost}
                      className='bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105'
                    >
                      <PlusCircle className='w-4 h-4 mr-2' />새 글 작성
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className='space-y-4 flex-1'>
        {filtered.map(post => (
          <Card
            key={post.id}
            className='border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/95 backdrop-blur-sm cursor-pointer hover:scale-[1.02] hover:border-orange-200'
            onClick={() => onClickPost(post.id)}
          >
            <CardContent className='p-6'>
              <div className='space-y-4'>
                <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-2'>
                      <Badge
                        variant='secondary'
                        className={cn(
                          'px-3 py-1 text-xs font-medium rounded-full',
                          post.category === 'FAMILY' &&
                            'bg-rose-100 text-rose-700',
                          post.category === 'FRIENDSHIP' &&
                            'bg-blue-100 text-blue-700',
                          post.category === 'STUDY' &&
                            'bg-green-100 text-green-700',
                          post.category === 'SECRET' &&
                            'bg-purple-100 text-purple-700',
                          post.category === 'GENERAL' &&
                            'bg-orange-100 text-orange-700'
                        )}
                      >
                        {CATEGORY_LABELS[post.category]}
                      </Badge>
                    </div>
                    <h3 className='text-lg font-semibold text-slate-800 mb-2 line-clamp-1'>
                      {post.title}
                    </h3>
                  </div>
                </div>
                <div className='flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500'>
                  <div className='flex items-center'>
                    <User className='w-4 h-4 mr-1' />
                    <span>{post.nickname}</span>
                  </div>
                  {post.createdAt && (
                    <div className='flex items-center gap-1'>
                      <Clock className='w-3 h-3' />
                      <span className='tabular-nums'>
                        {formatRelativeTime(post.createdAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        <div
          ref={sentinelRef}
          className='h-12 flex items-center justify-center'
        >
          {isFetchingNextPage && (
            <div className='flex items-center text-sm text-slate-500 gap-2'>
              <LoadingSpinner size='sm' /> 다음 글 불러오는 중...
            </div>
          )}
          {!isFetchingNextPage && !hasNextPage && filtered.length > 0 && (
            <span className='text-xs text-slate-400'>
              모든 게시글을 다 보셨습니다 🎉
            </span>
          )}
        </div>
      </div>
    );
  }
);
PostList.displayName = 'PostList';
