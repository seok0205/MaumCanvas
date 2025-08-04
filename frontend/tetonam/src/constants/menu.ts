import {
  BarChart3,
  Calendar,
  Home,
  MessageCircle,
  Stethoscope,
  User,
} from 'lucide-react';

export interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const USER_TYPES = {
  USER: 'user',
  COUNSELOR: 'counselor',
  ADMIN: 'admin',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  DIAGNOSIS: '/diagnosis',
  ONBOARDING: '/onboarding',
  USER_TYPE_SELECTION: '/user-role-selection',
  MY_PAGE: '/mypage',
} as const;

export const USER_MENU_ITEMS: MenuItem[] = [
  { title: '홈', url: '/dashboard', icon: Home },
  { title: '내 마음 진단', url: '/diagnosis', icon: Stethoscope },
  { title: '상담 예약', url: '/counseling-history', icon: Calendar },
  { title: '커뮤니티', url: '/community', icon: MessageCircle },
  { title: '마이페이지', url: '/mypage', icon: User },
];

export const COUNSELOR_MENU_ITEMS: MenuItem[] = [
  { title: '홈', url: '/dashboard', icon: Home },
  { title: '내 활동', url: '/my-activities', icon: BarChart3 },
  { title: '상담 관리', url: '/counseling-management', icon: MessageCircle },
  { title: '커뮤니티', url: '/community', icon: MessageCircle },
  { title: '마이페이지', url: '/mypage', icon: User },
];
