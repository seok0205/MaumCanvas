import { Eye, MessageCircle, Plus, Search, User } from 'lucide-react';
import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
import { useAuthStore } from '@/stores/useAuthStore';
import type { PostPageItem } from '@/types/community';
import { cn } from '@/utils/cn';

interface CommunityPageProps {
  // 향후 확장을 위한 props
}

export const CommunityPage = ({}: CommunityPageProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();

  const initialNickname = searchParams.get('nickname') ?? '';
  const [searchQuery, setSearchQuery] = useState(initialNickname);
  const [searchType, setSearchType] = useState<'nickname' | 'title'>(
    (searchParams.get('type') as 'nickname' | 'title') || 'nickname'
  );
  const syncingFromUrlRef = useRef(false);
  const deferredSearch = useDeferredValue(searchQuery.trim());

  useEffect(() => {
    const urlNickname = searchParams.get('nickname') ?? '';
    const urlType =
      (searchParams.get('type') as 'nickname' | 'title') || 'nickname';
    let changed = false;
    if (urlNickname !== searchQuery) {
      syncingFromUrlRef.current = true;
      setSearchQuery(urlNickname);
      changed = true;
    }
    if (urlType !== searchType) {
      syncingFromUrlRef.current = true;
      setSearchType(urlType);
      changed = true;
    }
    if (changed) {
      setTimeout(() => {
        syncingFromUrlRef.current = false;
      }, 0);
    }
  }, [searchParams, searchQuery, searchType]);

  useEffect(() => {
    if (syncingFromUrlRef.current) return;
    const currentNickname = searchParams.get('nickname') ?? '';
    const currentType = searchParams.get('type') ?? 'nickname';
    const nextNickname = deferredSearch;
    const needNicknameUpdate = currentNickname !== nextNickname;
    const needTypeUpdate = currentType !== searchType;
    if (!needNicknameUpdate && !needTypeUpdate) return;
    const next = new URLSearchParams(searchParams);
    if (nextNickname) next.set('nickname', nextNickname);
    else next.delete('nickname');
    next.set('type', searchType);
    setSearchParams(next, { replace: false });
  }, [deferredSearch, searchType, searchParams, setSearchParams]);

  const effectiveNickname =
    searchType === 'nickname' ? deferredSearch || undefined : undefined;

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
      <div className='flex min-h-screen w-full bg-gradient-to-b from-orange-50 via-white to-white'>
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
      <Card className='mb-4 border-0 shadow-lg bg-white/80 backdrop-blur-sm'>
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
                  className='w-28 rounded-md border border-slate-200 bg-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40'
                  aria-label='검색 유형'
                >
                  <option value='nickname'>닉네임</option>
                  <option value='title'>제목</option>
                </select>
                <Input
                  placeholder={
                    searchType === 'nickname'
                      ? '닉네임 검색 (뒤로가기 지원)'
                      : '제목 검색 (클라이언트 필터)'
                  }
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='border-slate-200 focus:border-orange-400 focus:ring-orange-400/20 flex-1'
                />
              </div>
              {searchType === 'title' && (
                <p className='mt-1 text-[11px] text-slate-500'>
                  제목 검색은 서버 미지원으로 클라이언트 필터링 중입니다.
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
      <PostList
        rawPosts={posts?.posts || []}
        searchType={searchType}
        searchValue={deferredSearch}
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
          <Card className='border-0 shadow-md bg-white/80 backdrop-blur-sm'>
            <CardContent className='p-12 text-center'>
              <div className='space-y-4'>
                <div className='w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto'>
                  <MessageCircle className='w-8 h-8 text-slate-400' />
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
                      className='bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white font-medium px-6 py-3 rounded-xl'
                    >
                      <Plus className='w-4 h-4 mr-2' />새 글 작성
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
            className='border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm cursor-pointer hover:scale-[1.02]'
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
                        {post.category}
                      </Badge>
                    </div>
                    <h3 className='text-lg font-semibold text-slate-800 mb-2 line-clamp-1'>
                      {post.title}
                    </h3>
                  </div>
                </div>
                <div className='flex items-center justify-between pt-3 border-t border-slate-100'>
                  <div className='flex items-center gap-4 text-sm text-slate-500'>
                    <div className='flex items-center gap-1'>
                      <User className='w-4 h-4' />
                      <span>{post.nickname}</span>
                    </div>
                  </div>
                  <div className='flex items-center gap-4 text-sm text-slate-500'>
                    <div className='flex items-center gap-1'>
                      <Eye className='w-4 h-4 opacity-40' />
                      <span className='text-slate-400'>-</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <MessageCircle className='w-4 h-4' />
                      <span>0</span>
                    </div>
                  </div>
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
