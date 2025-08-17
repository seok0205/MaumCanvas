import type { LucideIcon } from 'lucide-react';

export interface CommunityGuideline {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tips: string[];
}
