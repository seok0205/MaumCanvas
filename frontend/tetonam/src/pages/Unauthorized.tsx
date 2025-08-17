import { Button } from '@/components/ui/interactive/button';
import { Link } from 'react-router-dom';

export const Unauthorized = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <div className='text-center space-y-6 p-8'>
        <div className='space-y-2'>
          <h1 className='text-3xl font-bold text-foreground'>
            접근 권한이 없습니다
          </h1>
          <p className='text-muted-foreground'>
            이 페이지에 접근할 권한이 없습니다.
          </p>
        </div>

        <div className='space-x-4'>
          <Button asChild>
            <Link to='/dashboard'>대시보드로 돌아가기</Link>
          </Button>
          <Button variant='outline' asChild>
            <Link to='/login'>로그인 페이지</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
