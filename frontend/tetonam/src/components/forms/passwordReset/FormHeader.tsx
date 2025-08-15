import { PASSWORD_RESET_CONSTANTS } from '@/constants/passwordReset';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FormHeaderProps {
  title: string;
}

export const FormHeader = ({ title }: FormHeaderProps) => {
  return (
    <div className='flex items-center justify-between mb-6'>
      <Link
        to={PASSWORD_RESET_CONSTANTS.ROUTES.LOGIN}
        className='text-muted-foreground hover:text-foreground transition-colors'
        aria-label='로그인 페이지로 돌아가기'
      >
        <ArrowLeft className='w-5 h-5' aria-hidden='true' />
      </Link>
      <div className='flex items-center'>
        <img src='/logo.png' alt='로고' className='w-5 h-5 mr-2' />
        <h1 className='text-lg font-bold text-foreground'>{title}</h1>
      </div>
      <div className='w-5' />
    </div>
  );
};
