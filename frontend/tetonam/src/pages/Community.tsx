import { Eye, MessageCircle, Plus, Search, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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

  // 상태 관리 (검색 기능만 유지)
  // 초기 URL 쿼리 -> 상태 반영 (nickname)
  const initialNickname = searchParams.get('nickname') ?? '';
  const [searchQuery, setSearchQuery] = useState(initialNickname);
  const syncingFromUrlRef = useRef(false);

  // 검색 디바운스 (닉네임)
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // URL -> State 동기화 (뒤로가기/앞으로가기 시)
  useEffect(() => {
    const urlNickname = searchParams.get('nickname') ?? '';
    if (urlNickname !== searchQuery) {
      syncingFromUrlRef.current = true;
      setSearchQuery(urlNickname);
      // 다음 렌더 이후 플래그 해제
      setTimeout(() => {
        syncingFromUrlRef.current = false;
      }, 0);
    }
  }, [searchParams]);

  // State -> URL 동기화 (디바운스된 검색어가 바뀔 때)
  useEffect(() => {
    if (syncingFromUrlRef.current) return; // URL에서 유도된 상태 변경은 다시 URL 갱신 X
    const current = searchParams.get('nickname') ?? '';
    if ((debouncedSearch || '') === current) return; // 변경 없음
    const next = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      next.set('nickname', debouncedSearch);
    } else {
      next.delete('nickname');
    }
    setSearchParams(next, { replace: false });
  }, [debouncedSearch, searchParams, setSearchParams]);

  // 게시글 데이터 fetching (닉네임 검색: backend는 nickname 파라미터만 지원)
  const {
    data: posts,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useCommunityPosts({ nickname: debouncedSearch || undefined });

  // 무한 스크롤 관찰자
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current) return;
    if (!hasNextPage) return; // 더 불러올 페이지 없으면 관찰 중단

    const el = sentinelRef.current;
    const observer = new IntersectionObserver(
      entries => {
        if (!entries || entries.length === 0) return;
        const first = entries[0];
        if (
          first &&
          first.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: '0px 0px 240px 0px', // 미리 당겨 로드
        threshold: 0.1,
      }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 새 글 작성
  const handleCreatePost = () => {
    navigate('/community/create');
  };

  // 게시글 클릭
  const handlePostClick = (postId: number) => {
    navigate(`/community/${postId}`);
  };

  // 더보기 버튼 제거 (무한스크롤 전환)

  if (isLoading) {
    return (
      <div className='min-h-screen bg-warm-gradient'>
        <div className='container mx-auto px-4 py-8'>
          <div className='flex items-center justify-center h-64'>
            <LoadingSpinner size='lg' />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='min-h-screen bg-warm-gradient'>
        <div className='container mx-auto px-4 py-8'>
          <Alert variant='destructive'>
            <AlertDescription>
              게시글을 불러오는 중 오류가 발생했습니다.{' '}
              {(error as any)?.message}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className='flex w-full min-h-screen bg-warm-gradient'>
        <AppSidebar />
        <div className='flex-1 flex flex-col'>
          <CommonHeader user={user || { roles: [] }} title='커뮤니티' />
          <div className='px-6 py-6 max-w-6xl w-full mx-auto flex-1 flex flex-col'>
            <div className='mb-6 flex items-center justify-between'>
              <p className='text-slate-600 text-sm sm:text-base font-medium'>
                마음을 나누고 함께 성장해요
              </p>
              {user && (
                <Button
                  onClick={handleCreatePost}
                  className='bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white font-medium px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300'
                >
                  <Plus className='w-4 h-4 mr-2' />새 글 작성
                </Button>
              )}
            </div>
            {/* 검색 카드 (기존 패턴 유지) */}
            <Card className='mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm'>
              <CardHeader className='pb-4'>
                <div className='flex flex-col gap-4'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Search className='w-4 h-4 text-slate-600' />
                      <span className='text-sm font-medium text-slate-700'>
                        검색
                      </span>
                    </div>
                    <Input
                      placeholder='작성자 닉네임 검색 (뒤로가기 지원)'
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className='border-slate-200 focus:border-orange-400 focus:ring-orange-400/20'
                    />
                  </div>
                </div>
              </CardHeader>
            </Card>
            <div className='space-y-4 flex-1'>
              {posts && posts.posts.length > 0 ? (
                <>
                  {posts.posts.map((post: PostPageItem) => (
                    <Card
                      key={post.id}
                      className='border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm cursor-pointer hover:scale-[1.02]'
                      onClick={() => handlePostClick(post.id)}
                    >
                      <CardContent className='p-6'>
                        <div className='space-y-4'>
                          {/* 게시글 헤더 */}
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
                              {/* PostPageDto에는 content 미포함 */}
                            </div>
                          </div>

                          {/* 게시글 메타 정보 */}
                          <div className='flex items-center justify-between pt-3 border-t border-slate-100'>
                            <div className='flex items-center gap-4 text-sm text-slate-500'>
                              <div className='flex items-center gap-1'>
                                <User className='w-4 h-4' />
                                <span>{post.nickname}</span>
                              </div>
                              {/* 시간 정보 없음 (PostPageDto 미포함) */}
                            </div>
                            <div className='flex items-center gap-4 text-sm text-slate-500'>
                              <div className='flex items-center gap-1'>
                                {/* viewCount 없음 */}
                                <Eye className='w-4 h-4 opacity-40' />
                                <span className='text-slate-400'>-</span>
                              </div>
                              <div className='flex items-center gap-1'>
                                <MessageCircle className='w-4 h-4' />
                                <span>0</span> {/* 댓글 수는 추후 구현 */}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* 무한 스크롤 센티넬 */}
                  <div
                    ref={sentinelRef}
                    className='h-12 flex items-center justify-center'
                  >
                    {isFetchingNextPage && (
                      <div className='flex items-center text-sm text-slate-500 gap-2'>
                        <LoadingSpinner size='sm' /> 다음 글 불러오는 중...
                      </div>
                    )}
                    {!hasNextPage && posts.posts.length > 0 && (
                      <span className='text-xs text-slate-400'>
                        모든 게시글을 다 보셨습니다 🎉
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <Card className='border-0 shadow-md bg-white/80 backdrop-blur-sm'>
                  <CardContent className='p-12 text-center'>
                    <div className='space-y-4'>
                      <div className='w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto'>
                        <MessageCircle className='w-8 h-8 text-slate-400' />
                      </div>
                      <div>
                        <h3 className='text-lg font-medium text-slate-800 mb-2'>
                          아직 게시글이 없습니다
                        </h3>
                        <p className='text-slate-600 mb-6'>
                          첫 번째 게시글을 작성해보세요!
                        </p>
                        {user && (
                          <Button
                            onClick={handleCreatePost}
                            className='bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white font-medium px-6 py-3 rounded-xl'
                          >
                            <Plus className='w-4 h-4 mr-2' />새 글 작성
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          <MobileSidebarToggle />
        </div>
      </div>
    </SidebarProvider>
  );
};
