import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/data-display/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/layout/card';
import { useStudentCounselingList } from '@/hooks/useCounselingList';
import { formatDateTimeSimple } from '@/utils/dateUtils';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PasswordChangeDialog } from '@/components/forms/PasswordChangeDialog';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { CommonHeader } from '@/components/layout/CommonHeader';
import { Input } from '@/components/ui/forms/input';
import { Button } from '@/components/ui/interactive/button';
import {
  MobileSidebarToggle,
  SidebarProvider,
} from '@/components/ui/navigation/sidebar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/overlay/dialog';
import { Label } from '@/components/ui/primitives/label';
import { useNicknameEdit } from '@/hooks/useNicknameEdit';
import { useUserInfo } from '@/hooks/useUserInfo';
import { useAuthStore } from '@/stores/useAuthStore';
import { mapGenderToKorean } from '@/utils/genderMapping';
import { AlertCircle, Edit, Lock, RefreshCw, Save, X } from 'lucide-react';

// 헤더 컴포넌트 제거 (CommonHeader 사용)

// 로딩 컴포넌트 분리
const MyPageLoading = React.memo(() => {
  return (
    <div className='p-6 flex items-center justify-center'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
        <p className='text-muted-foreground'>내 정보를 불러오는 중...</p>
      </div>
    </div>
  );
});

// 에러 컴포넌트 분리
interface MyPageErrorProps {
  error: Error | null;
  onRetry: () => void;
  onBack: () => void;
}

const MyPageError = React.memo<MyPageErrorProps>(
  ({ error, onRetry, onBack }) => {
    return (
      <div className='p-6 flex items-center justify-center'>
        <div className='text-center'>
          <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-3' />
          <p className='text-muted-foreground mb-2'>
            내 정보를 불러오지 못했습니다
          </p>
          <p className='text-sm text-muted-foreground mb-4'>
            {error?.message || '네트워크 연결을 확인하고 다시 시도해주세요'}
          </p>
          <div className='flex space-x-2 justify-center'>
            <Button
              variant='outline'
              size='sm'
              onClick={onRetry}
              className='text-xs'
            >
              <RefreshCw className='w-3 h-3 mr-1' />
              다시 시도
            </Button>
            <Button onClick={onBack} className='text-xs'>
              대시보드로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

// 사용자 정보 폼 컴포넌트 분리
interface MyPageFormProps {
  userInfo: {
    name: string;
    nickname: string;
    email: string;
    birthday: string;
    phone: string;
    school: string;
    gender: string;
  };
}

const MyPageForm = React.memo<MyPageFormProps>(({ userInfo }) => {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  // 닉네임 편집 로직을 커스텀 훅으로 분리
  const {
    nickname,
    isEditing,
    isDuplicateChecking,
    isDuplicateChecked,
    setNickname,
    setIsEditing,
    handleDuplicateCheck,
    handleSave,
    handleCancel,
  } = useNicknameEdit(userInfo.nickname);

  return (
    <div className='p-6 max-w-2xl mx-auto space-y-6'>
      {/* 사용자 정보 카드 */}
      <Card className='shadow-lg'>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <span>내 정보</span>
            <div className='ml-auto flex space-x-2'>
              {!isEditing && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className='h-4 w-4 mr-2' />
                  수정
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* 이름 */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Label className='text-sm font-medium text-muted-foreground'>
              이름
            </Label>
            <div className='md:col-span-2'>
              <Input value={userInfo.name} disabled className='bg-muted' />
            </div>
          </div>

          {/* 닉네임 */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Label className='text-sm font-medium text-muted-foreground'>
              닉네임
            </Label>
            <div className='md:col-span-2 flex space-x-2'>
              <Input
                value={nickname}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNickname(e.target.value)
                }
                disabled={!isEditing}
                className='flex-1'
              />
              {isEditing && (
                <Button
                  variant='outline'
                  onClick={handleDuplicateCheck}
                  disabled={
                    isDuplicateChecking || nickname === userInfo.nickname
                  }
                  className='whitespace-nowrap'
                >
                  {isDuplicateChecking ? '확인 중...' : '중복확인'}
                </Button>
              )}
            </div>
          </div>

          {/* 이메일 */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Label className='text-sm font-medium text-muted-foreground'>
              이메일
            </Label>
            <div className='md:col-span-2'>
              <Input value={userInfo.email} disabled className='bg-muted' />
            </div>
          </div>

          {/* 생년월일 */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Label className='text-sm font-medium text-muted-foreground'>
              생년월일
            </Label>
            <div className='md:col-span-2'>
              <Input value={userInfo.birthday} disabled className='bg-muted' />
            </div>
          </div>

          {/* 전화번호 */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Label className='text-sm font-medium text-muted-foreground'>
              전화번호
            </Label>
            <div className='md:col-span-2'>
              <Input value={userInfo.phone} disabled className='bg-muted' />
            </div>
          </div>

          {/* 학교 */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Label className='text-sm font-medium text-muted-foreground'>
              학교
            </Label>
            <div className='md:col-span-2'>
              <Input value={userInfo.school} disabled className='bg-muted' />
            </div>
          </div>

          {/* 성별 */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Label className='text-sm font-medium text-muted-foreground'>
              성별
            </Label>
            <div className='md:col-span-2'>
              <Input
                value={mapGenderToKorean(userInfo.gender)}
                disabled
                className='bg-muted'
              />
            </div>
          </div>

          {/* 수정 버튼들 */}
          {isEditing && (
            <div className='flex justify-end space-x-2 pt-4 border-t'>
              <Button variant='outline' onClick={handleCancel}>
                <X className='h-4 w-4 mr-2' />
                취소
              </Button>
              <Button
                onClick={handleSave}
                disabled={!isDuplicateChecked || nickname === userInfo.nickname}
              >
                <Save className='h-4 w-4 mr-2' />
                저장
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 비밀번호 변경 카드 */}
      <Card className='shadow-lg'>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Lock className='h-5 w-5' />
            <span>비밀번호 변경</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground mb-4'>
            보안을 위해 정기적으로 비밀번호를 변경하는 것을 권장합니다.
          </p>
          <Dialog
            open={isPasswordDialogOpen}
            onOpenChange={setIsPasswordDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant='outline'>
                <Lock className='h-4 w-4 mr-2' />
                비밀번호 변경
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-md'>
              <DialogHeader>
                <DialogTitle>비밀번호 변경</DialogTitle>
              </DialogHeader>
              <PasswordChangeDialog
                onClose={() => setIsPasswordDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
});

// 메인 MyPage 컴포넌트
interface MyPageProps {}

export const MyPage = ({}: MyPageProps) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { userInfo, error, refetch, showSkeleton, isBackgroundFetching } =
    useUserInfo();

  // 재시도 핸들러
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  if (!user) {
    return <div>로딩 중...</div>;
  }

  return (
    <SidebarProvider>
      <div className='flex w-full min-h-screen bg-gradient-warm'>
        <AppSidebar />

        <div className='flex-1 flex flex-col'>
          {/* 헤더는 항상 고정 */}
          <CommonHeader user={user} title='마이페이지' />

          {/* 페이지 제목 */}
          <div className='px-6 py-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold text-foreground'>
                  마이페이지
                </h1>
                <p className='text-muted-foreground mt-2'>
                  내 정보를 확인하고 관리할 수 있습니다.
                </p>
              </div>
              {/* Context7 모범 사례: 백그라운드 갱신 상태 표시 */}
              {isBackgroundFetching && (
                <div className='flex items-center space-x-2'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-primary' />
                  <span className='text-sm text-muted-foreground'>
                    업데이트 중...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <main className='flex-1 overflow-auto'>
            <Tabs defaultValue='info' className='px-6 py-4'>
              <TabsList>
                <TabsTrigger value='info'>내 정보</TabsTrigger>
                <TabsTrigger value='counseling'>상담 내역</TabsTrigger>
              </TabsList>

              <TabsContent value='info'>
                {/* Progressive Loading: 초기 로딩 시 스켈레톤 표시 */}
                {showSkeleton && <MyPageLoading />}
                {error && !userInfo && (
                  <MyPageError
                    error={error}
                    onRetry={handleRetry}
                    onBack={() => navigate('/dashboard')}
                  />
                )}
                {userInfo && <MyPageForm userInfo={userInfo} />}
              </TabsContent>

              <TabsContent value='counseling'>
                <StudentCounselingTab />
              </TabsContent>
            </Tabs>
          </main>
        </div>

        {/* 모바일 사이드바 토글 버튼 - 왼쪽 하단 고정 */}
        <MobileSidebarToggle />
      </div>
    </SidebarProvider>
  );
};

// 학생 상담 내역 탭 컴포넌트
const StudentCounselingTab = () => {
  const navigate = useNavigate();

  const { items, isLoading: loading, error } = useStudentCounselingList();

  return (
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle>내 상담 내역</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop Header - Hidden on mobile */}
        <div className='hidden md:grid md:grid-cols-4 gap-4 text-xs font-medium text-muted-foreground pb-2'>
          <div>상담사</div>
          <div>시간</div>
          <div>유형</div>
          <div>상태</div>
        </div>

        {loading ? (
          <div className='space-y-3'>
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className='p-4 bg-card border rounded-lg md:grid md:grid-cols-4 md:gap-4 md:items-center md:p-3 md:bg-transparent md:border-0 md:rounded-none space-y-2 md:space-y-0'
              >
                <div className='flex items-center gap-2 md:block'>
                  <span className='text-xs text-muted-foreground md:hidden'>
                    상담사:
                  </span>
                  <div className='h-4 w-24 bg-muted animate-pulse rounded' />
                </div>
                <div className='flex items-center gap-2 md:block'>
                  <span className='text-xs text-muted-foreground md:hidden'>
                    시간:
                  </span>
                  <div className='h-4 w-32 bg-muted animate-pulse rounded' />
                </div>
                <div className='flex items-center gap-2 md:block'>
                  <span className='text-xs text-muted-foreground md:hidden'>
                    유형:
                  </span>
                  <div className='h-4 w-24 bg-muted animate-pulse rounded' />
                </div>
                <div className='flex items-center gap-2 md:block'>
                  <span className='text-xs text-muted-foreground md:hidden'>
                    상태:
                  </span>
                  <div className='h-4 w-20 bg-muted animate-pulse rounded' />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className='text-center py-10 text-muted-foreground'>{error}</div>
        ) : !items || items.length === 0 ? (
          <div className='text-center py-10 text-muted-foreground'>
            상담 내역이 없습니다
          </div>
        ) : (
          <div className='space-y-3 md:space-y-0 md:divide-y md:divide-border/60'>
            {items.map(item => (
              <div
                key={item.id}
                className='p-4 bg-card border rounded-lg md:grid md:grid-cols-4 md:gap-4 md:items-center md:p-3 md:bg-transparent md:border-0 md:rounded-none space-y-3 md:space-y-0'
              >
                <div className='flex items-center gap-2 md:block'>
                  <span className='text-xs text-muted-foreground md:hidden font-medium'>
                    상담사:
                  </span>
                  <div className='text-sm text-foreground font-medium md:font-normal'>
                    {item.counselor}
                  </div>
                </div>
                <div className='flex items-center gap-2 md:block'>
                  <span className='text-xs text-muted-foreground md:hidden font-medium'>
                    시간:
                  </span>
                  <div className='text-sm text-muted-foreground'>
                    {formatDateTimeSimple(item.time)}
                  </div>
                </div>
                <div className='flex items-center gap-2 md:block'>
                  <span className='text-xs text-muted-foreground md:hidden font-medium'>
                    유형:
                  </span>
                  <div className='text-sm'>{item.type}</div>
                </div>
                <div className='flex items-center justify-between md:block'>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs text-muted-foreground md:hidden font-medium'>
                      상태:
                    </span>
                    <div className='text-xs px-3 py-1 rounded-full bg-accent/50 text-foreground/80 inline-block'>
                      {item.status}
                    </div>
                  </div>
                  <Button
                    size='sm'
                    onClick={() => navigate(`/counseling/${item.id}`)}
                    className='ml-auto md:ml-0 md:mt-2'
                  >
                    상세 보기
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
