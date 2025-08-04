import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
import { authService } from '@/services/authService';
import { UserInfoResponse } from '@/types/api';
import { ArrowLeft, Edit, Lock, Save, X } from 'lucide-react';

interface MyPageProps {}

export const MyPage = ({}: MyPageProps) => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [originalNickname, setOriginalNickname] = useState('');
  const [isDuplicateChecking, setIsDuplicateChecking] = useState(false);
  const [isDuplicateChecked, setIsDuplicateChecked] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  // 사용자 정보 로드
  const loadUserInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await authService.getMyInfo();
      setUserInfo(data);
      setNickname(data.nickname);
      setOriginalNickname(data.nickname);
    } catch (error) {
      toast.error('사용자 정보를 불러오는데 실패했습니다.');
      console.error('Failed to load user info:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserInfo();
  }, [loadUserInfo]);

  // 닉네임 변경 감지
  useEffect(() => {
    if (nickname !== originalNickname) {
      setIsDuplicateChecked(false);
    }
  }, [nickname, originalNickname]);

  // 중복확인
  const handleDuplicateCheck = async () => {
    if (!nickname.trim()) {
      toast.error('닉네임을 입력해주세요.');
      return;
    }

    try {
      setIsDuplicateChecking(true);
      await authService.checkNicknameDuplicate(nickname);

      setIsDuplicateChecked(true);
      toast.success('사용 가능한 닉네임입니다.');
    } catch (error) {
      toast.error('닉네임 중복확인에 실패했습니다.');
    } finally {
      setIsDuplicateChecking(false);
    }
  };

  // 저장
  const handleSave = async () => {
    if (!isDuplicateChecked) {
      toast.error('중복확인을 완료해주세요.');
      return;
    }

    try {
      await authService.updateMyNickname(nickname);

      setOriginalNickname(nickname);
      setIsEditing(false);
      setIsDuplicateChecked(false);
      toast.success('닉네임이 변경되었습니다.');
    } catch (error) {
      toast.error('닉네임 변경에 실패했습니다.');
    }
  };

  // 취소
  const handleCancel = () => {
    setNickname(originalNickname);
    setIsEditing(false);
    setIsDuplicateChecked(false);
  };

  // 뒤로가기
  const handleBack = () => {
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className='flex w-full min-h-screen bg-gradient-warm'>
          <AppSidebar />
          <div className='flex-1 flex items-center justify-center'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
              <p className='text-muted-foreground'>로딩 중...</p>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!userInfo) {
    return (
      <SidebarProvider>
        <div className='flex w-full min-h-screen bg-gradient-warm'>
          <AppSidebar />
          <div className='flex-1 flex items-center justify-center'>
            <div className='text-center'>
              <p className='text-muted-foreground'>
                사용자 정보를 불러올 수 없습니다.
              </p>
              <Button onClick={handleBack} className='mt-4'>
                대시보드로 돌아가기
              </Button>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className='flex w-full min-h-screen bg-gradient-warm'>
        <AppSidebar />

        <div className='flex-1 flex flex-col'>
          {/* 헤더 */}
          <header className='border-b border-border/50 bg-card/80 shadow-card backdrop-blur-sm rounded-2xl mx-4 mt-4'>
            <div className='flex items-center justify-between px-4 py-4'>
              <div className='flex items-center space-x-4'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleBack}
                  className='text-muted-foreground hover:text-foreground'
                >
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  뒤로가기
                </Button>
                <h1 className='text-xl font-bold text-foreground'>
                  마이페이지
                </h1>
              </div>
            </div>
          </header>

          {/* 메인 콘텐츠 */}
          <main className='flex-1 overflow-auto p-6'>
            <div className='max-w-2xl mx-auto space-y-6'>
              {/* 사용자 정보 카드 */}
              <Card className='shadow-lg'>
                <CardHeader>
                  <CardTitle className='flex items-center space-x-2'>
                    <span>내 정보</span>
                    {!isEditing && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setIsEditing(true)}
                        className='ml-auto'
                      >
                        <Edit className='h-4 w-4 mr-2' />
                        수정
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {/* 이름 */}
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      이름
                    </Label>
                    <div className='md:col-span-2'>
                      <Input
                        value={userInfo.name}
                        disabled
                        className='bg-muted'
                      />
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
                        onChange={e => setNickname(e.target.value)}
                        disabled={!isEditing}
                        className='flex-1'
                      />
                      {isEditing && (
                        <Button
                          variant='outline'
                          onClick={handleDuplicateCheck}
                          disabled={
                            isDuplicateChecking || nickname === originalNickname
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
                      <Input
                        value={userInfo.email}
                        disabled
                        className='bg-muted'
                      />
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
                      <Input
                        value={userInfo.phone}
                        disabled
                        className='bg-muted'
                      />
                    </div>
                  </div>

                  {/* 학교 */}
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      학교
                    </Label>
                    <div className='md:col-span-2'>
                      <Input
                        value={userInfo.school}
                        disabled
                        className='bg-muted'
                      />
                    </div>
                  </div>

                  {/* 성별 */}
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      성별
                    </Label>
                    <div className='md:col-span-2'>
                      <Input
                        value={userInfo.gender}
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
                        disabled={
                          !isDuplicateChecked || nickname === originalNickname
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
        </div>
      </div>
    </SidebarProvider>
  );
};

// 비밀번호 변경 다이얼로그 컴포넌트
interface PasswordChangeDialogProps {
  onClose: () => void;
}

const PasswordChangeDialog = ({ onClose }: PasswordChangeDialogProps) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    try {
      setIsLoading(true);
      await authService.updateMyPassword(newPassword);

      toast.success('비밀번호가 변경되었습니다.');
      onClose();
    } catch (error) {
      toast.error('비밀번호 변경에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='newPassword'>새 비밀번호</Label>
        <Input
          id='newPassword'
          type='password'
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
          minLength={8}
        />
        <p className='text-xs text-muted-foreground'>
          비밀번호는 8자 이상이어야 합니다.
        </p>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='confirmPassword'>새 비밀번호 확인</Label>
        <Input
          id='confirmPassword'
          type='password'
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      <div className='flex justify-end space-x-2 pt-4'>
        <Button type='button' variant='outline' onClick={onClose}>
          취소
        </Button>
        <Button type='submit' disabled={isLoading}>
          {isLoading ? '변경 중...' : '변경'}
        </Button>
      </div>
    </form>
  );
};
