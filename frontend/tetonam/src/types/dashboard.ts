export interface DashboardStats {
  totalCounselings: number;
  weeklyCounselings: number;
  satisfactionRate: number;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  studentName?: string;
  topic?: string;
  counselorName?: string;
}

export interface QuickAction {
  readonly title: string;
  readonly description: string;
  readonly actionText: string;
  readonly variant: 'default' | 'outline';
}

export interface MentalHealthMetric {
  value: number;
  label: string;
  color: string;
}

export interface DailyTip {
  readonly title: string;
  readonly content: string;
}

export interface CommunityActivity {
  title: string;
  description: string;
  type: 'contribution' | 'achievement';
}

// readonly 배열 타입을 위한 유틸리티 타입
export type ReadonlyArray<T> = readonly T[];
