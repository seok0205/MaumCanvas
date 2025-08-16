import { CheckCircle, Clock, Edit3, FileText, Info, MessageCircle, Search, User } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
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
      <Card className='mb-4 border-2 border-orange-200 shadow-2xl bg-white'>
        <CardHeader className='pb-4'>
          <div className='flex flex-col gap-4'>
            <div className='flex-1'>
              <div className='flex items-center gap-2 mb-3'>
                <Search className='w-5 h-5 text-orange-500' />
                <span className='text-base font-semibold text-slate-800'>검색</span>
              </div>
              <div className='flex gap-3'>
                <Select
                  value={searchType}
                  onValueChange={(value: 'nickname' | 'title') => setSearchType(value)}
                >
                  <SelectTrigger className='w-36 h-12 px-4 border-2 border-slate-200 bg-white hover:border-slate-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 rounded-xl shadow-sm transition-colors'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='border-2 border-slate-200 bg-white shadow-xl rounded-lg overflow-hidden'>
                    <SelectItem
                      value='nickname'
                      className='hover:bg-orange-50 focus:bg-orange-50 cursor-pointer py-2.5 px-4 transition-colors'
                    >
                      <div className='flex items-center gap-2'>
                        <User className='w-4 h-4 text-slate-600' />
                        <span className='font-medium'>닉네임</span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      value='title'
                      className='hover:bg-orange-50 focus:bg-orange-50 cursor-pointer py-2.5 px-4 transition-colors'
                    >
                      <div className='flex items-center gap-2'>
                        <FileText className='w-4 h-4 text-slate-600' />
                        <span className='font-medium'>제목</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder={
                    searchType === 'nickname'
                      ? '닉네임으로 검색해보세요...'
                      : '제목으로 검색해보세요...'
                  }
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='border-2 border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 flex-1 shadow-sm bg-white rounded-xl text-sm font-medium hover:border-slate-300 transition-colors'
                  aria-label='검색어'
                />
              </div>
              {searchType === 'title' && (
                <p className='mt-2 text-xs text-slate-500 flex items-center gap-1'>
                  <Info className='w-3 h-3' />
                  제목 검색은 클라이언트에서 실시간으로 필터링됩니다.
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 글 작성 버튼 */}
      {user && (
        <div className='mb-4 flex justify-end'>
          <Button
            onClick={handleCreatePost}
            className='bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white font-medium px-6 py-2.5 rounded-lg shadow-lg transition-all hover:shadow-xl hover:scale-105'
          >
            <Edit3 className='w-4 h-4 mr-2' />글 작성
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
          <Card className='border-2 border-slate-200 shadow-2xl bg-white'>
            <CardContent className='p-12 text-center'>
              <div className='space-y-4'>
                <div className='w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto shadow-lg border-2 border-orange-200'>
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
                      <Edit3 className='w-4 h-4 mr-2' />새 글 작성
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
            className='border-2 border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white cursor-pointer hover:scale-[1.02] hover:border-orange-300 hover:bg-slate-50'
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
                <div className='flex items-center justify-between pt-3 border-t-2 border-slate-150 text-xs text-slate-500'>
                  <div className='flex items-center'>
                    <User className='w-4 h-4 mr-1' />
                    <span>{post.nickname}</span>
                  </div>
                  {post.createdDate && (
                    <div className='flex items-center gap-1'>
                      <Clock className='w-3 h-3' />
                      <span className='tabular-nums'>
                        {formatRelativeTime(post.createdDate)}
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
            <div className='text-xs text-slate-400 flex items-center gap-1 justify-center'>
              <CheckCircle className='w-3 h-3' />
              <span>모든 게시글을 다 보셨습니다</span>
            </div>
          )}
        </div>
      </div>
    );
  }
);
PostList.displayName = 'PostList';
