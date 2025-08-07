import {
  ArrowLeft,
  Calendar,
  Edit,
  Eye,
  MessageCircle,
  MoreVertical,
  Trash2,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
import { Button } from '@/components/ui/interactive/button';
import { Card, CardContent, CardHeader } from '@/components/ui/layout/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/navigation/dropdown-menu';
import { useDeletePost } from '@/hooks/useCommunityMutations';
import { useCommunityPost } from '@/hooks/useCommunityPost';
import { useAuthStore } from '@/stores/useAuthStore';
import { CATEGORY_LABELS } from '@/types/community';
import { cn } from '@/utils/cn';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export const CommunityPostDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const postId = id ? parseInt(id, 10) : 0;

  const { data: post, isLoading, isError, error } = useCommunityPost(postId);

  const deletePostMutation = useDeletePost();

  // 뒤로 가기
  const handleGoBack = () => {
    navigate('/community');
  };

  // 수정
  const handleEdit = () => {
    navigate(`/community/${postId}/edit`);
  };

  // 삭제
  const handleDelete = () => {
    deletePostMutation.mutate(postId, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        navigate('/community');
      },
    });
  };

  // 현재 사용자가 작성자인지 확인 (nickname 기반)
  const isAuthor = user && post && user.nickname === post.nickname;

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

  if (isError || !post) {
    return (
      <div className='min-h-screen bg-warm-gradient'>
        <div className='container mx-auto px-4 py-8'>
          <Alert variant='destructive'>
            <AlertDescription>
              게시글을 불러오는 중 오류가 발생했습니다. {error?.message}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-warm-gradient'>
      <div className='container mx-auto px-4 py-8 max-w-4xl'>
        {/* 상단 네비게이션 */}
        <div className='mb-6'>
          <Button
            onClick={handleGoBack}
            variant='ghost'
            className='text-slate-600 hover:text-slate-800 p-0 h-auto mb-4'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            목록으로 돌아가기
          </Button>
        </div>

        {/* 게시글 카드 */}
        <Card className='border-0 shadow-lg bg-white/90 backdrop-blur-sm mb-8'>
          <CardHeader className='pb-4'>
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
                <h1 className='text-2xl sm:text-3xl font-bold text-slate-800 mb-4'>
                  {post.title}
                </h1>

                {/* 메타 정보 */}
                <div className='flex flex-wrap items-center gap-4 text-sm text-slate-600'>
                  <div className='flex items-center gap-1'>
                    <User className='w-4 h-4' />
                    <span>{post.nickname}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Calendar className='w-4 h-4' />
                    <span>
                      {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Eye className='w-4 h-4' />
                    <span>{post.viewCount}</span>
                  </div>
                </div>
              </div>

              {/* 작성자 액션 메뉴 */}
              {isAuthor && (
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

          <CardContent>
            {/* 게시글 내용 */}
            <div className='prose prose-slate max-w-none'>
              <div className='whitespace-pre-wrap text-slate-700 leading-relaxed'>
                {post.content}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 댓글 섹션 */}
        <Card className='border-0 shadow-lg bg-white/90 backdrop-blur-sm'>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <MessageCircle className='w-5 h-5 text-slate-600' />
              <h2 className='text-lg font-semibold text-slate-800'>댓글</h2>
              <span className='text-sm text-slate-500'>0</span>
            </div>
          </CardHeader>

          <CardContent>
            {/* TODO: 댓글 목록 및 작성 폼 구현 */}
            <div className='text-center py-8 text-slate-500'>
              댓글 기능은 곧 추가될 예정입니다.
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
