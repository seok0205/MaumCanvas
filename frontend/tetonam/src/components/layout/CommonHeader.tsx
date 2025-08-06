import { Alert, AlertDescription } from '@/components/ui/feedback/alert';
import { Button } from '@/components/ui/interactive/button';
import { getUserRoleLabel } from '@/constants/userRoles';
import { useAuthActions } from '@/hooks/useAuthActions';
import { getPrimaryRole } from '@/utils/userRoleMapping';
import { AlertCircle, ArrowLeft, Heart, LogOut, User, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 타입 정의
interface CommonHeaderProps {
  user: {
    name: string | null;
    roles: string[];
  };
  showUserInfo?: boolean;
  showLogout?: boolean;
  showBackButton?: boolean;
  backButtonText?: string;
  onBackClick?: () => void;
  title?: string;
}

export const CommonHeader = ({
  user,
  showUserInfo = true,
  showLogout = true,
  showBackButton = false,
  backButtonText = '뒤로가기',
  onBackClick,
  title,
}: CommonHeaderProps) => {
  const { logout } = useAuthActions();
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState<string | null>(null);

  // 에러 배너 자동 사라짐
  useEffect(() => {
    if (logoutError) {
      const timer = setTimeout(() => {
        setLogoutError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [logoutError]);

  // roles 배열에서 주요 역할 결정
  const primaryRole = getPrimaryRole(user.roles);

  // 로그아웃 핸들러 메모이제이션
  const handleLogout = useCallback(async () => {
    try {
      setLogoutError(null); // 기존 에러 초기화
      await logout();
    } catch (error) {
      console.error('로그아웃 실패:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : '로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.';
      setLogoutError(errorMessage);
    }
  }, [logout]);

  // 재시도 핸들러
  const handleRetry = useCallback(() => {
    handleLogout();
  }, [handleLogout]);

  // 에러 배너 닫기
  const handleCloseError = useCallback(() => {
    setLogoutError(null);
  }, []);

  // 마이페이지로 이동
  const handleMyPageClick = useCallback(() => {
    navigate('/mypage');
  }, [navigate]);

  // 뒤로가기 핸들러
  const handleBackClick = useCallback(() => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  }, [onBackClick, navigate]);

  return (
    <>
      {/* 헤더 */}
      <header className='border-b border-border/50 bg-card/80 shadow-card backdrop-blur-sm rounded-2xl mx-4 mt-4'>
        <div className='flex items-center justify-between px-4 py-4'>
          <div className='flex items-center space-x-4'>
            {showBackButton && (
              <Button
                variant='ghost'
                size='sm'
                onClick={handleBackClick}
                className='text-muted-foreground hover:text-foreground'
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
                {backButtonText}
              </Button>
            )}

            <div className='flex items-center space-x-2'>
              <Heart className='h-5 w-5 text-primary' />
              <span className='font-bold text-lg text-foreground'>
                {title || '마음 캔버스'}
              </span>
            </div>
          </div>

          {(showUserInfo || showLogout) && (
            <div className='flex items-center space-x-2 md:space-x-4'>
              {showUserInfo && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleMyPageClick}
                  className='flex items-center space-x-2 text-foreground hover:text-foreground hover:bg-accent'
                  aria-label={`사용자 정보: ${user.name || '알 수 없는 사용자'}, 역할: ${getUserRoleLabel(primaryRole)}`}
                >
                  <User
                    className='h-5 w-5 text-muted-foreground'
                    aria-hidden='true'
                  />
                  <span className='max-w-24 truncate font-medium md:max-w-none'>
                    {user.name || '알 수 없는 사용자'}
                  </span>
                  <span className='hidden text-muted-foreground sm:inline'>
                    ({getUserRoleLabel(primaryRole)})
                  </span>
                </Button>
              )}

              {showLogout && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleLogout}
                  className='text-muted-foreground hover:text-foreground'
                  aria-label='로그아웃'
                >
                  <LogOut className='mr-2 h-4 w-4' aria-hidden='true' />
                  <span className='hidden sm:inline'>로그아웃</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* 에러 알림 배너 */}
      {logoutError && (
        <Alert variant='destructive' className='mx-4 mt-4 mb-0'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription className='flex items-center justify-between'>
            <span>{logoutError}</span>
            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleRetry}
                className='h-6 px-2 text-xs'
              >
                재시도
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleCloseError}
                className='h-6 w-6 p-0'
              >
                <X className='h-3 w-3' />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
