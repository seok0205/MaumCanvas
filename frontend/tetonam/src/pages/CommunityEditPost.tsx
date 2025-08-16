import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { MarkdownEditor } from '@/components/community/MarkdownEditor';
import { CommonHeader } from '@/components/layout/CommonHeader';
import { Badge } from '@/components/ui/data-display/badge';
import { Alert, AlertDescription } from '@/components/ui/feedback/alert';
import { LoadingSpinner } from '@/components/ui/feedback/loading-spinner';
import { Input } from '@/components/ui/forms/input';
import { Button } from '@/components/ui/interactive/button';
import { Card, CardContent, CardHeader } from '@/components/ui/layout/card';
import { useUpdatePost } from '@/hooks/useCommunityMutations';
import { useCommunityPost } from '@/hooks/useCommunityPost';
import { useUserHomeInfo } from '@/hooks/useUserHomeInfo';
import type { CommunityCategory, PostUpdateRequest } from '@/types/community';
import { CATEGORY_LABELS, COMMUNITY_LIMITS } from '@/types/community';
import { cn } from '@/utils/cn';

export const CommunityEditPost = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: user } = useUserHomeInfo();

  const postId = id ? parseInt(id, 10) : 0;

  const { data: post, isLoading, isError, error } = useCommunityPost(postId);
  const updatePostMutation = useUpdatePost();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '' as CommunityCategory | '',
  });

  // 게시글 데이터가 로드되면 폼에 설정
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        content: post.content,
        category: post.category,
      });
    }
  }, [post]);

  // 뒤로 가기
  const handleGoBack = () => {
    navigate(`/community/${postId}`);
  };

  // 제목 변경
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= COMMUNITY_LIMITS.TITLE_MAX_LENGTH) {
      setFormData(prev => ({ ...prev, title: value }));
    }
  };

  // 내용 변경
  const handleContentChange = (value: string) => {
    if (value.length <= COMMUNITY_LIMITS.CONTENT_MAX_LENGTH) {
      setFormData(prev => ({ ...prev, content: value }));
    }
  };

  // 폼 유효성 검사
  const isFormValid = () => {
    return (
      formData.title.trim().length >= COMMUNITY_LIMITS.TITLE_MIN_LENGTH &&
      formData.content.trim().length >= COMMUNITY_LIMITS.CONTENT_MIN_LENGTH
    );
  };

  // 수정 제출
  const handleSubmit = () => {
    if (!isFormValid()) return;

    const requestData: PostUpdateRequest = {
      title: formData.title.trim(),
      content: formData.content.trim(),
    };

    updatePostMutation.mutate(
      { id: postId, data: requestData },
      {
        onSuccess: () => {
          navigate(`/community/${postId}`);
        },
      }
    );
  };

  // 권한 검증
  const isAuthor = user && post && user.nickname === post.nickname;

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

  if (!isAuthor) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-orange-50 via-orange-25 to-slate-50'>
        <div className='container mx-auto px-4 py-8'>
          <Alert variant='destructive'>
            <AlertDescription>
              이 게시글을 수정할 권한이 없습니다.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-orange-50 via-orange-25 to-slate-50'>
      <CommonHeader user={{ roles: [] }} title='게시글 수정' />
      <div className='container mx-auto px-4 py-6 max-w-4xl'>
        {/* 상단 네비게이션 */}
        <div className='mb-6 flex items-center justify-between'>
          <Button
            onClick={handleGoBack}
            variant='ghost'
            className='text-slate-600 hover:text-slate-800 p-0 h-auto'
          >
            <ArrowLeft className='w-4 h-4 mr-2' /> 취소
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={!isFormValid() || updatePostMutation.isPending}
            className='bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 h-auto min-h-10 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {updatePostMutation.isPending ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                수정 중...
              </>
            ) : (
              <>
                <Save className='w-4 h-4 mr-2' />
                수정 완료
              </>
            )}
          </Button>
        </div>

        {/* 폼 카드 */}
        <Card className='border-2 border-slate-200 shadow-2xl bg-white'>
          <CardHeader className='pb-6 border-b-2 border-slate-150'>
            <div className='space-y-4'>
              {/* 카테고리 표시 (읽기 전용) */}
              <div className='space-y-2'>
                <label className='block text-sm font-medium text-slate-700'>
                  카테고리
                </label>
                <div className='flex items-center'>
                  <Badge
                    variant='secondary'
                    className={cn(
                      'px-3 py-1 text-sm font-medium rounded-full',
                      formData.category === 'FAMILY' &&
                        'bg-rose-100 text-rose-700',
                      formData.category === 'FRIENDSHIP' &&
                        'bg-blue-100 text-blue-700',
                      formData.category === 'STUDY' &&
                        'bg-green-100 text-green-700',
                      formData.category === 'SECRET' &&
                        'bg-purple-100 text-purple-700',
                      formData.category === 'GENERAL' &&
                        'bg-slate-100 text-slate-700'
                    )}
                  >
                    {formData.category
                      ? CATEGORY_LABELS[formData.category]
                      : '카테고리 없음'}
                  </Badge>
                  <span className='text-xs text-slate-500 ml-2'>
                    (카테고리는 수정할 수 없습니다)
                  </span>
                </div>
              </div>

              {/* 제목 입력 */}
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <label className='block text-sm font-medium text-slate-700'>
                    제목 *
                  </label>
                  <span
                    className={cn(
                      'text-xs',
                      formData.title.length >
                        COMMUNITY_LIMITS.TITLE_MAX_LENGTH * 0.8
                        ? 'text-orange-600'
                        : 'text-slate-500'
                    )}
                  >
                    {formData.title.length}/{COMMUNITY_LIMITS.TITLE_MAX_LENGTH}
                  </span>
                </div>
                <Input
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder='게시글 제목을 입력하세요'
                  className='h-12 text-base'
                  maxLength={COMMUNITY_LIMITS.TITLE_MAX_LENGTH}
                />
                {formData.title.length < COMMUNITY_LIMITS.TITLE_MIN_LENGTH && (
                  <p className='text-xs text-slate-500'>
                    최소 {COMMUNITY_LIMITS.TITLE_MIN_LENGTH}자 이상
                    입력해주세요.
                  </p>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className='pt-6'>
            {/* 내용 편집기 */}
            <div className='space-y-2 mb-6'>
              <label className='block text-sm font-medium text-slate-700'>
                내용 *
              </label>
              <div className='border border-slate-200 rounded-lg overflow-hidden'>
                <MarkdownEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder='게시글 내용을 입력하세요...'
                  maxLength={COMMUNITY_LIMITS.CONTENT_MAX_LENGTH}
                />
              </div>
              {formData.content.length <
                COMMUNITY_LIMITS.CONTENT_MIN_LENGTH && (
                <p className='text-xs text-slate-500'>
                  최소 {COMMUNITY_LIMITS.CONTENT_MIN_LENGTH}자 이상
                  입력해주세요.
                </p>
              )}
            </div>

            {/* 폼 유효성 안내 */}
            {!isFormValid() && (
              <Alert className='mb-4'>
                <AlertDescription>
                  모든 필수 항목을 올바르게 입력해주세요.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
