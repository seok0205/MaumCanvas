import { MenuItem } from '@/types/menu';
import { BarChart3, Home, MessageCircle, User } from 'lucide-react';

export const USER_TYPES = {
  STUDENT: 'student',
  COUNSELOR: 'counselor',
  ADMIN: 'admin',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  ONBOARDING: '/onboarding',
  USER_TYPE_SELECTION: '/user-type-selection',
} as const;

export const STUDENT_MENU_ITEMS: MenuItem[] = [
  { title: '홈', url: '/dashboard', icon: Home },
  { title: '내 마음 진단', url: '/progress', icon: BarChart3 },
  { title: '상담 내역', url: '/counseling-history', icon: MessageCircle },
  { title: '커뮤니티', url: '/community', icon: MessageCircle },
  { title: '마이페이지', url: '/profile', icon: User },
];

export const COUNSELOR_MENU_ITEMS: MenuItem[] = [
  { title: '홈', url: '/dashboard', icon: Home },
  { title: '내 활동', url: '/my-activities', icon: BarChart3 },
  { title: '상담 관리', url: '/counseling-management', icon: MessageCircle },
  { title: '커뮤니티', url: '/community', icon: MessageCircle },
  { title: '마이페이지', url: '/profile', icon: User },
];
