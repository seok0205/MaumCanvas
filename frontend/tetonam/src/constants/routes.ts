export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  FORGOT_PASSWORD: '/forgot-password',
  USER_TYPE_SELECTION: '/user-role-selection',
  ONBOARDING: '/onboarding',
} as const;

export type RouteKey = keyof typeof ROUTES;
