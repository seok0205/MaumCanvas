import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PasswordChangeDialog } from '@/components/forms/PasswordChangeDialog';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Input } from '@/components/ui/forms/input';
import { Button } from '@/components/ui/interactive/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/layout/card';
import { SidebarProvider } from '@/components/ui/navigation/sidebar';
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
import {
  AlertCircle,
  ArrowLeft,
  Edit,
  Lock,
  RefreshCw,
  Save,
  X,
} from 'lucide-react';

// 헤더 컴포넌트 분리
interface MyPageHeaderProps {
  onBack: () => void;
}

const MyPageHeader = React.memo<MyPageHeaderProps>(({ onBack }) => {
  return (
    <header className='border-b border-border/50 bg-card/80 shadow-card backdrop-blur-sm rounded-2xl mx-4 mt-4'>
      <div className='flex items-center justify-between px-4 py-4'>
        <div className='flex items-center space-x-4'>
          <Button
            variant='ghost'
            size='sm'
            onClick={onBack}
            className='text-muted-foreground hover:text-foreground'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            뒤로가기
          </Button>
          <h1 className='text-xl font-bold text-foreground'>마이페이지</h1>
        </div>
      </div>
    </header>
  );
});

// 로딩 컴포넌트 분리
const MyPageLoading = React.memo(() => {
  return (
    <div className='flex-1 flex items-center justify-center'>
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
      <div className='flex-1 flex items-center justify-center'>
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
    <main className='flex-1 overflow-auto p-6'>
      <div className='max-w-2xl mx-auto space-y-6'>
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
                <Input
                  value={userInfo.birthday}
                  disabled
                  className='bg-muted'
                />
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
                <Input value={userInfo.gender} disabled className='bg-muted' />
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
                  disabled={
                    !isDuplicateChecked || nickname === userInfo.nickname
                  }
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
    </main>
  );
});

// 메인 MyPage 컴포넌트
interface MyPageProps {}

export const MyPage = ({}: MyPageProps) => {
  const navigate = useNavigate();
  const { userInfo, isLoading, error, refetch } = useUserInfo();

  // 뒤로가기 핸들러
  const handleBack = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  // 재시도 핸들러
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <SidebarProvider>
      <div className='flex w-full min-h-screen bg-gradient-warm'>
        <AppSidebar />

        <div className='flex-1 flex flex-col'>
          {/* 헤더는 항상 고정 */}
          <MyPageHeader onBack={handleBack} />

          {/* 메인 콘텐츠만 상태에 따라 변경 */}
          {isLoading && !userInfo && <MyPageLoading />}
          {error && !userInfo && (
            <MyPageError
              error={error}
              onRetry={handleRetry}
              onBack={handleBack}
            />
          )}
          {userInfo && <MyPageForm userInfo={userInfo} />}
        </div>
      </div>
    </SidebarProvider>
  );
};
