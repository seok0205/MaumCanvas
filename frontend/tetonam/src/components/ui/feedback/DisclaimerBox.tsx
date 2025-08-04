import { DisclaimerBoxProps } from '@/types/diagnosis';
import { cn } from '@/utils/cn';
import { AlertTriangle } from 'lucide-react';

export const DisclaimerBox = ({ className }: DisclaimerBoxProps) => {
  return (
    <div
      className={cn(
        'flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg',
        className
      )}
      role='alert'
      aria-labelledby='disclaimer-title'
    >
      <AlertTriangle
        className='h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0'
        aria-hidden='true'
      />
      <div className='flex-1'>
        <h3 id='disclaimer-title' className='font-medium text-yellow-800 mb-2'>
          면책조항
        </h3>
        <p className='text-sm text-yellow-700 leading-relaxed'>
          본 서비스에서 제공하는 자가진단은 일반적인 건강 정보 및 참고 자료이며,
          전문적인 의료 조언, 진단, 또는 치료를 대체할 수 없습니다. 자신의 건강
          문제나 증상에 대해서는 반드시 의사, 약사 등 자격을 갖춘 의료 전문가와
          상담하시기 바랍니다. 본 서비스의 결과를 바탕으로 의학적 치료를 시작,
          변경 또는 중단해서는 안 됩니다.
        </p>
      </div>
    </div>
  );
};
