import { Compass } from 'lucide-react';
import { Card } from '@/components/ui/layout/card';
import { COMMUNITY_GUIDELINES } from '@/data/communityGuidelines';
import { GuidelineItem } from './GuidelineItem';

export const CommunityGuidelinesCard = () => {
  return (
    <Card className='p-6 h-full'>
      {/* 헤더 */}
      <div className='flex items-center gap-3 mb-6'>
        <div className='p-2 rounded-lg bg-blue-100'>
          <Compass className='w-5 h-5 text-blue-600' />
        </div>
        <div>
          <h3 className='text-lg font-bold text-foreground'>
            전문가 행동강령
          </h3>
          <p className='text-sm text-muted-foreground'>
            상담사 윤리 가이드라인
          </p>
        </div>
      </div>

      {/* 가이드라인 목록 */}
      <div className='space-y-3'>
        {COMMUNITY_GUIDELINES.map((guideline) => (
          <GuidelineItem
            key={guideline.id}
            guideline={guideline}
          />
        ))}
      </div>
    </Card>
  );
};
