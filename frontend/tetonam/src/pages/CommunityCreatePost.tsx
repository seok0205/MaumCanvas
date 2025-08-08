import { ArrowLeft, Save } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CounselingTypeSelector } from '@/components/ui/CounselingTypeSelector';
import { Alert, AlertDescription } from '@/components/ui/feedback/alert';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import { Textarea } from '@/components/ui/forms/textarea';
import { Button } from '@/components/ui/interactive/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/layout/card';
import { useCreatePost } from '@/hooks/useCommunityMutations';
import type { CommunityCategory, PostWriteRequest } from '@/types/community';
import { CATEGORY_LABELS, COMMUNITY_LIMITS } from '@/types/community';
import {
  COUNSELING_TYPE_DATA,
  type CounselingTypeId,
} from '@/types/counselingType';
import { mapCounselingTypeToCommunityCategory } from '@/utils/communityMapping';

export const CommunityCreatePost = () => {
  const navigate = useNavigate();
  const createPostMutation = useCreatePost();

  // 폼 상태
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '' as CommunityCategory | '',
  });
  const [selectedCounselingType, setSelectedCounselingType] =
    useState<CounselingTypeId | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 뒤로 가기
  const handleGoBack = () => {
    navigate('/community');
  };

  // 상담 유형 선택 핸들러
  const handleCounselingTypeSelect = (counselingTypeId: CounselingTypeId) => {
    setSelectedCounselingType(counselingTypeId);
    const category = mapCounselingTypeToCommunityCategory(counselingTypeId);
    setFormData(prev => ({ ...prev, category }));
  };

  // 직접 카테고리 선택 핸들러
  const handleCategorySelect = (category: CommunityCategory) => {
    setFormData(prev => ({ ...prev, category }));
    setSelectedCounselingType(null); // 직접 선택 시 상담 유형 초기화
  };

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors['title'] = '제목을 입력해주세요.';
    } else if (formData.title.length > COMMUNITY_LIMITS.TITLE_MAX_LENGTH) {
      newErrors['title'] =
        `제목은 ${COMMUNITY_LIMITS.TITLE_MAX_LENGTH}자 이하로 입력해주세요.`;
    }

    if (!formData.content.trim()) {
      newErrors['content'] = '내용을 입력해주세요.';
    } else if (formData.content.length > COMMUNITY_LIMITS.CONTENT_MAX_LENGTH) {
      newErrors['content'] =
        `내용은 ${COMMUNITY_LIMITS.CONTENT_MAX_LENGTH}자 이하로 입력해주세요.`;
    }

    if (!formData.category) {
      newErrors['category'] = '카테고리를 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 게시글 작성
  const handleSubmit = () => {
    if (!validateForm()) return;

    const postData: PostWriteRequest = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      category: formData.category as CommunityCategory,
    };

    createPostMutation.mutate(postData, {
      onSuccess: () => {
        navigate('/community');
      },
    });
  };

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

        {/* 게시글 작성 폼 */}
        <Card className='border-0 shadow-lg bg-white/90 backdrop-blur-sm'>
          <CardHeader>
            <CardTitle className='text-2xl font-bold text-slate-800'>
              새 글 작성
            </CardTitle>
          </CardHeader>

          <CardContent className='space-y-6'>
            {/* 상담 유형 선택 */}
            <div className='space-y-3'>
              <Label className='text-sm font-medium text-slate-700'>
                고민 유형 선택 (선택사항)
              </Label>
              <CounselingTypeSelector
                selectedType={
                  selectedCounselingType
                    ? COUNSELING_TYPE_DATA.find(
                        c => c.id === selectedCounselingType
                      ) || null
                    : null
                }
                onTypeSelect={type => handleCounselingTypeSelect(type.id)}
                categories={COUNSELING_TYPE_DATA}
                className='border rounded-lg p-4'
              />
              <p className='text-xs text-slate-500'>
                고민 유형을 선택하시면 적절한 카테고리가 자동으로 설정됩니다.
              </p>
            </div>

            {/* 카테고리 직접 선택 */}
            <div className='space-y-3'>
              <Label className='text-sm font-medium text-slate-700'>
                카테고리 <span className='text-red-500'>*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={handleCategorySelect}
              >
                <SelectTrigger
                  className={`border-slate-200 focus:border-orange-400 focus:ring-orange-400/20 ${
                    errors['category'] ? 'border-red-500' : ''
                  }`}
                >
                  <SelectValue placeholder='카테고리를 선택하세요' />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors['category'] && (
                <p className='text-sm text-red-600'>{errors['category']}</p>
              )}
            </div>

            {/* 제목 입력 */}
            <div className='space-y-3'>
              <Label className='text-sm font-medium text-slate-700'>
                제목 <span className='text-red-500'>*</span>
              </Label>
              <Input
                value={formData.title}
                onChange={e =>
                  setFormData(prev => ({ ...prev, title: e.target.value }))
                }
                placeholder='제목을 입력하세요'
                maxLength={COMMUNITY_LIMITS.TITLE_MAX_LENGTH}
                className={`border-slate-200 focus:border-orange-400 focus:ring-orange-400/20 ${
                  errors['title'] ? 'border-red-500' : ''
                }`}
              />
              <div className='flex justify-between items-center'>
                {errors['title'] && (
                  <p className='text-sm text-red-600'>{errors['title']}</p>
                )}
                <p className='text-xs text-slate-500 ml-auto'>
                  {formData.title.length}/{COMMUNITY_LIMITS.TITLE_MAX_LENGTH}
                </p>
              </div>
            </div>

            {/* 내용 입력 */}
            <div className='space-y-3'>
              <Label className='text-sm font-medium text-slate-700'>
                내용 <span className='text-red-500'>*</span>
              </Label>
              <Textarea
                value={formData.content}
                onChange={e =>
                  setFormData(prev => ({ ...prev, content: e.target.value }))
                }
                placeholder='내용을 입력하세요&#10;&#10;• 다른 사람을 배려하는 마음으로 작성해주세요&#10;• 개인정보나 민감한 정보는 포함하지 마세요&#10;• 건전하고 건설적인 소통을 지향합니다'
                maxLength={COMMUNITY_LIMITS.CONTENT_MAX_LENGTH}
                rows={12}
                className={`border-slate-200 focus:border-orange-400 focus:ring-orange-400/20 resize-none ${
                  errors['content'] ? 'border-red-500' : ''
                }`}
              />
              <div className='flex justify-between items-center'>
                {errors['content'] && (
                  <p className='text-sm text-red-600'>{errors['content']}</p>
                )}
                <p className='text-xs text-slate-500 ml-auto'>
                  {formData.content.length}/
                  {COMMUNITY_LIMITS.CONTENT_MAX_LENGTH}
                </p>
              </div>
            </div>

            {/* 작성 안내 */}
            <Alert className='border-orange-200 bg-orange-50'>
              <AlertDescription className='text-orange-800'>
                <strong>작성 전 확인사항:</strong>
                <ul className='mt-2 space-y-1 list-disc list-inside text-sm'>
                  <li>타인을 비방하거나 상처주는 내용은 삼가해주세요</li>
                  <li>개인정보 노출에 주의해주세요</li>
                  <li>커뮤니티 규정을 준수해주세요</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* 액션 버튼 */}
            <div className='flex justify-end gap-3 pt-4'>
              <Button
                variant='outline'
                onClick={handleGoBack}
                disabled={createPostMutation.isPending}
                className='border-slate-200 text-slate-600 hover:bg-slate-50'
              >
                취소
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  createPostMutation.isPending ||
                  !formData.title.trim() ||
                  !formData.content.trim() ||
                  !formData.category
                }
                className='bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white font-medium px-6'
              >
                {createPostMutation.isPending ? (
                  <>작성 중...</>
                ) : (
                  <>
                    <Save className='w-4 h-4 mr-2' />
                    작성하기
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
