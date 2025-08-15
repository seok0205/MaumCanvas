import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { CommunityGuideline } from '@/types/communityGuidelines';

interface GuidelineItemProps {
  guideline: CommunityGuideline;
}

export const GuidelineItem = ({ guideline }: GuidelineItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const IconComponent = guideline.icon;

  return (
    <div
      className={`
        p-4 rounded-lg border border-border bg-card
        hover:shadow-md cursor-pointer transition-all duration-200
        hover:border-primary/30
      `}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className='flex items-start justify-between'>
        <div className='flex items-start gap-3 flex-1'>
          {/* 아이콘 */}
          <div className='p-2 rounded-lg bg-primary/10 border border-primary/20'>
            <IconComponent className='w-4 h-4 text-primary' />
          </div>
          
          {/* 내용 */}
          <div className='flex-1 min-w-0'>
            <h4 className='font-semibold text-sm text-foreground mb-1'>
              {guideline.title}
            </h4>
            <p className='text-sm text-muted-foreground'>
              {guideline.description}
            </p>
          </div>
        </div>
        
        {/* 확장/축소 버튼 */}
        <div className='p-1 text-muted-foreground hover:text-foreground'>
          {isExpanded ? (
            <ChevronUp className='w-4 h-4' />
          ) : (
            <ChevronDown className='w-4 h-4' />
          )}
        </div>
      </div>
      
      {/* 확장된 내용 - 실천 팁 */}
      {isExpanded && (
        <div className='mt-4 pt-4 border-t border-border'>
          <h5 className='text-sm font-medium mb-2 text-foreground'>
            실천 방법:
          </h5>
          <ul className='space-y-1'>
            {guideline.tips.map((tip, index) => (
              <li
                key={index}
                className='text-sm text-muted-foreground flex items-start gap-2'
              >
                <span className='w-1 h-1 rounded-full mt-2 bg-primary opacity-60' />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
