import {
  ArrowLeft,
  Calendar,
  Check,
  Edit,
  Eye,
  MessageCircle,
  MoreVertical,
  Send,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { CommonHeader } from '@/components/layout/CommonHeader';
import { Badge } from '@/components/ui/data-display/badge';
import { Alert, AlertDescription } from '@/components/ui/feedback/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/feedback/alert-dialog';
import { LoadingSpinner } from '@/components/ui/feedback/loading-spinner';
import { Textarea } from '@/components/ui/forms/textarea';
import { Button } from '@/components/ui/interactive/button';
import { Card, CardContent, CardHeader } from '@/components/ui/layout/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/navigation/dropdown-menu';
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from '@/hooks/useCommunityComments';
import { useDeletePost } from '@/hooks/useCommunityMutations';
import { useCommunityPost } from '@/hooks/useCommunityPost';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuthStore } from '@/stores/useAuthStore';
import { CATEGORY_LABELS } from '@/types/community';
import { cn } from '@/utils/cn';
import { formatRelativeTime } from '@/utils/communityUtils';

export const CommunityPostDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: user } = useUserProfile();
  const { isAuthenticated } = useAuthStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const postId = id ? parseInt(id, 10) : 0;

  const { data: post, isLoading, isError, error } = useCommunityPost(postId);
  const { data: comments, isLoading: commentsLoading } = useComments(
    postId,
    true
  );
  const createCommentMutation = useCreateComment(postId);
  const updateCommentMutation = useUpdateComment(postId);
  const deleteCommentMutation = useDeleteComment(postId);

  const [commentContent, setCommentContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const handleSubmitComment = useCallback(() => {
    if (!commentContent.trim()) return;
    
    // 이미 작성 중인 경우 중복 요청 방지
    if (createCommentMutation.isPending) return;
    
    createCommentMutation.mutate(
      { content: commentContent.trim() },
      {
        onSuccess: () => {
          setCommentContent('');
        },
        onError: () => {
          // 에러 시에도 입력 내용은 유지하여 재시도 가능하게 함
        },
      }
    );
  }, [commentContent, createCommentMutation]);

  const startEditComment = useCallback((id: number, existing: string) => {
    setEditingCommentId(id);
    setEditingContent(existing);
  }, []);

  const cancelEditComment = useCallback(() => {
    setEditingCommentId(null);
    setEditingContent('');
  }, []);

  const submitEditComment = useCallback(() => {
    if (!editingCommentId) return;
    if (!editingContent.trim()) return;
    
    // 이미 수정 중인 경우 중복 요청 방지
    if (updateCommentMutation.isPending) return;
    
    updateCommentMutation.mutate(
      { id: editingCommentId, data: { content: editingContent.trim() } },
      {
        onSuccess: () => {
          cancelEditComment();
        },
        onError: () => {
          // 에러 발생 시에도 편집 상태는 유지하여 재시도 가능하게 함
        },
      }
    );
  }, [
    editingCommentId,
    editingContent,
    updateCommentMutation,
    cancelEditComment,
  ]);

  const handleDeleteComment = useCallback(
    (id: number) => {
      // 이미 삭제 중인 경우 중복 요청 방지
      if (deleteCommentMutation.isPending) return;
      
      deleteCommentMutation.mutate(id, {
        onSuccess: () => {
          if (editingCommentId === id) cancelEditComment();
        },
        onError: () => {
          // 에러 처리는 hook 내부에서 toast로 처리됨
        },
      });
    },
    [deleteCommentMutation, editingCommentId, cancelEditComment]
  );

  // 댓글 목록 렌더링 최적화 - 의존성 기반 메모이제이션
  const renderedComments = useMemo(() => {
    if (!comments) return null;
    
    return comments.map(c => {
      const isEditing = editingCommentId === c.id;
      // 댓글 작성자 확인 - nickname 비교 (CommentListDto에는 isAuthor 필드 없음)
      const isOwner = user?.nickname === c.nickname;

      return (
        <div
          key={c.id}
          className='group rounded-lg border-2 border-slate-200 bg-white hover:bg-slate-50 transition p-4 shadow-lg hover:shadow-xl hover:border-orange-200'
        >
          <div className='flex justify-between items-start mb-2'>
            <div className='flex items-center gap-2 text-sm text-slate-600'>
              <User className='w-4 h-4' />
              <span className='font-medium'>{c.nickname}</span>
              <Calendar className='w-4 h-4' />
              <span>{formatRelativeTime(c.createdDate)}</span>
            </div>
            {isOwner && (
              <div className='flex gap-1'>
                {/* 댓글 수정/삭제 버튼 - React 조건부 렌더링 (&&) 사용 */}
                {!isEditing && (
                  <>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => startEditComment(c.id, c.content)}
                      className='opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-orange-500'
                    >
                      <Edit className='w-4 h-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleDeleteComment(c.id)}
                      disabled={deleteCommentMutation.isPending}
                      className='opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-500'
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          {isEditing ? (
            <div className='space-y-3'>
              <Textarea
                value={editingContent}
                onChange={e => setEditingContent(e.target.value)}
                maxLength={1000}
                rows={4}
                className='resize-none focus-visible:ring-orange-400/30'
              />
              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={cancelEditComment}
                  disabled={updateCommentMutation.isPending}
                >
                  <X className='w-4 h-4 mr-1' />
                  취소
                </Button>
                <Button
                  size='sm'
                  onClick={submitEditComment}
                  disabled={
                    updateCommentMutation.isPending ||
                    !editingContent.trim()
                  }
                  className='bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white'
                >
                  {updateCommentMutation.isPending ? (
                    '저장 중...'
                  ) : (
                    <>
                      <Check className='w-4 h-4 mr-1' />
                      저장
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className='text-slate-700 leading-relaxed whitespace-pre-wrap'>
              {c.content}
            </div>
          )}
        </div>
      );
    });
  }, [
    comments,
    editingCommentId,
    editingContent,
    user?.nickname,
    updateCommentMutation.isPending,
    deleteCommentMutation.isPending,
    startEditComment,
    handleDeleteComment,
    cancelEditComment,
    submitEditComment,
  ]);

  const deletePostMutation = useDeletePost();

  // 뒤로 가기 - useCallback으로 최적화
  const handleGoBack = useCallback(() => {
    navigate('/community');
  }, [navigate]);

  // 수정 - useCallback으로 최적화 (postId 의존성 추가)
  const handleEdit = useCallback(() => {
    navigate(`/community/${postId}/edit`);
  }, [navigate, postId]);

  // 삭제 - useCallback으로 최적화
  const handleDelete = useCallback(() => {
    deletePostMutation.mutate(postId, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        navigate('/community');
      },
    });
  }, [deletePostMutation, postId, navigate]);

  // 현재 사용자가 작성자인지 확인 - 백엔드 isAuthor가 잘못 계산되므로 프론트에서 비교
  const isAuthor = useMemo(() => {
    console.log('🔍 현재 로그인한 사용자:', user?.nickname);
    console.log('🔍 게시글 작성자:', post?.nickname);
    console.log('🔍 백엔드에서 계산된 isAuthor:', post?.isAuthor);
    
    // 백엔드 isAuthor가 잘못 계산되므로 프론트엔드에서 닉네임 비교
    const calculatedIsAuthor = user?.nickname === post?.nickname;
    console.log('🔍 프론트엔드에서 계산된 isAuthor:', calculatedIsAuthor);
    
    return calculatedIsAuthor;
  }, [post, user]);

  // 시간 포맷팅 함수 - useCallback으로 최적화
  const safeRelativeTime = useCallback(
    (value?: string) => (value ? formatRelativeTime(value) : ''),
    []
  );

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-orange-50 via-orange-25 to-slate-50'>
        <div className='container mx-auto px-4 py-8'>
          <div className='flex items-center justify-center h-64'>
            <LoadingSpinner size='lg' />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-orange-50 via-orange-25 to-slate-50'>
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
    <div className='min-h-screen bg-gradient-to-b from-orange-50 via-orange-25 to-slate-50'>
      <CommonHeader user={{ roles: [] }} title='게시글 상세' />
      <div className='container mx-auto px-4 py-6 max-w-4xl'>
        {/* 상단 네비게이션 */}
        <div className='mb-2'>
          <Button
            onClick={handleGoBack}
            variant='ghost'
            className='text-slate-600 hover:text-slate-800 p-0 h-auto'
          >
            <ArrowLeft className='w-4 h-4 mr-2' /> 목록으로
          </Button>
        </div>

        {/* 게시글 카드 */}
        <Card className='border-2 border-slate-200 shadow-2xl bg-white mb-8'>
          <CardHeader className='pb-6 border-b-2 border-slate-150'>
            <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
              <div className='flex-1'>
                {/* 카테고리 배지 */}
                <Badge
                  variant='secondary'
                  className={cn(
                    'px-3 py-1 text-sm font-medium rounded-full mb-4',
                    post.category === 'FAMILY' && 'bg-rose-100 text-rose-700',
                    post.category === 'FRIENDSHIP' &&
                      'bg-blue-100 text-blue-700',
                    post.category === 'STUDY' && 'bg-green-100 text-green-700',
                    post.category === 'SECRET' &&
                      'bg-purple-100 text-purple-700',
                    post.category === 'GENERAL' &&
                      'bg-orange-100 text-orange-700'
                  )}
                >
                  {CATEGORY_LABELS[post.category]}
                </Badge>

                {/* 제목 */}
                <h1 className='text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-4'>
                  {post.title}
                </h1>
                {/* 메타 정보 */}
                <div className='flex flex-wrap items-center gap-4 text-sm text-slate-600 divide-x divide-slate-200'>
                  <div className='flex items-center gap-1'>
                    <User className='w-4 h-4' />
                    <span>{post.nickname}</span>
                  </div>
                  {safeRelativeTime(post.createdDate) && (
                    <div className='flex items-center gap-1 pl-4'>
                      <Calendar className='w-4 h-4' />
                      <span className='tabular-nums'>
                        {safeRelativeTime(post.createdDate)}
                      </span>
                    </div>
                  )}
                  <div className='flex items-center gap-1 pl-4'>
                    <Eye className='w-4 h-4' />
                    <span className='tabular-nums'>{post.viewCount}</span>
                  </div>
                </div>
              </div>

              {/* 작성자 액션 메뉴 - React 조건부 렌더링 (&&) 사용 */}
              {Boolean(isAuthor) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='icon' className='h-8 w-8'>
                      <MoreVertical className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem onClick={handleEdit}>
                      <Edit className='mr-2 h-4 w-4' />
                      수정
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className='text-red-600 focus:text-red-600'
                    >
                      <Trash2 className='mr-2 h-4 w-4' />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardHeader>

          <CardContent className='pt-6 space-y-8'>
            <section aria-label='게시글 본문' className='space-y-4'>
              <h2 className='sr-only'>본문</h2>
              <div className='whitespace-pre-wrap text-slate-800 leading-relaxed text-[15px]'>
                {post.content}
              </div>
            </section>
          </CardContent>
        </Card>

        {/* 댓글 섹션 */}
        <Card className='border-2 border-slate-200 shadow-2xl bg-white'>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <MessageCircle className='w-5 h-5 text-slate-600' />
              <h2 className='text-lg font-semibold text-slate-800'>댓글</h2>
              <span className='text-sm text-slate-500'>
                {comments?.length || 0}
              </span>
            </div>
          </CardHeader>

          <CardContent className='space-y-6'>
            {/* 작성 폼 */}
            {isAuthenticated && (
              <div className='space-y-2'>
                <Textarea
                  placeholder='댓글을 입력하세요'
                  value={commentContent}
                  onChange={e => setCommentContent(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  className='resize-none focus-visible:ring-orange-400/30'
                />
                <div className='flex justify-between items-center'>
                  <span className='text-xs text-slate-500'>
                    {commentContent.length}/1000
                  </span>
                  <Button
                    onClick={handleSubmitComment}
                    disabled={
                      createCommentMutation.isPending || !commentContent.trim()
                    }
                    className='bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white'
                    size='sm'
                  >
                    {createCommentMutation.isPending ? (
                      '작성 중...'
                    ) : (
                      <>
                        <Send className='w-4 h-4 mr-1' />
                        작성
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* 목록 */}
            <div className='space-y-4'>
              {commentsLoading && (
                <div className='flex items-center gap-2 text-slate-500 text-sm'>
                  <LoadingSpinner size='sm' /> 불러오는 중...
                </div>
              )}
              {!commentsLoading && comments && comments.length === 0 && (
                <div className='text-center py-6 text-slate-400 text-sm'>
                  첫 댓글을 남겨보세요.
                </div>
              )}
              {/* 메모이제이션된 댓글 목록 렌더링 */}
              {renderedComments}
            </div>
          </CardContent>
        </Card>

        {/* 삭제 확인 다이얼로그 */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>게시글 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                정말로 이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수
                없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deletePostMutation.isPending}
                className='bg-red-600 hover:bg-red-700'
              >
                {deletePostMutation.isPending ? '삭제 중...' : '삭제'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
