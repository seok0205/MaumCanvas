import { cn } from '@/utils/cn';

interface PrivacyNoticeProps {
  message?: string;
  className?: string;
}

export const PrivacyNotice = ({
  message = '개인정보 보호: 입력하신 정보는 안전하게 암호화되어 저장됩니다.',
  className,
}: PrivacyNoticeProps) => {
  return (
    <div
      className={cn(
        'bg-orange-50 border border-orange-200 rounded-md p-3',
        className
      )}
    >
      <p className='text-sm text-orange-800'>{message}</p>
    </div>
  );
};
