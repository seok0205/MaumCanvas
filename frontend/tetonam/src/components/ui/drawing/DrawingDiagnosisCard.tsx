import { CheckIcon } from '@/components/ui/icons/CheckIcon';

interface DrawingDiagnosisCardProps {
  icon: React.ReactNode;
  iconBgColor: string;
  title: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: 'primary' | 'outline';
  buttonColor: string;
  onAction: () => void;
}

export const DrawingDiagnosisCard = ({
  icon,
  iconBgColor,
  title,
  description,
  features,
  buttonText,
  buttonVariant,
  buttonColor,
  onAction,
}: DrawingDiagnosisCardProps) => {
  return (
    <div className='bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col h-full'>
      {/* 아이콘 섹션 */}
      <div className='flex justify-center mb-6'>
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center ${iconBgColor}`}
        >
          {icon}
        </div>
      </div>

      {/* 제목 */}
      <h3 className='text-2xl font-bold text-gray-900 text-center mb-4'>
        {title}
      </h3>

      {/* 설명 */}
      <p className='text-gray-600 text-center mb-8 leading-relaxed'>
        {description}
      </p>

      {/* 기능 리스트 */}
      <div className='flex-1 mb-8'>
        <ul className='space-y-4'>
          {features.map((feature, index) => (
            <li key={index} className='flex items-start gap-3'>
              <div className='flex-shrink-0 mt-0.5'>
                <CheckIcon className='text-green-500' size={16} />
              </div>
              <span className='text-gray-700 text-sm leading-relaxed'>
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* 버튼 */}
      <button
        onClick={onAction}
        className={`
          w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200
          ${
            buttonVariant === 'primary'
              ? `${buttonColor} text-white hover:opacity-90 active:scale-[0.98]`
              : `border-2 ${buttonColor} bg-transparent hover:bg-gray-50 active:scale-[0.98]`
          }
        `}
      >
        {buttonText}
      </button>
    </div>
  );
};
