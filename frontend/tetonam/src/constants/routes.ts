export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  FORGOT_PASSWORD: '/forgot-password',
  USER_TYPE_SELECTION: '/user-role-selection',
  ONBOARDING: '/onboarding',
  MY_PAGE: '/mypage',
  COUNSELING_MANAGEMENT: '/counseling-management',
  COUNSELING_DETAIL: '/counseling/:id',
  DRAWING_DETAIL: '/counseling/image/:drawingId',
} as const;

export type RouteKey = keyof typeof ROUTES;
