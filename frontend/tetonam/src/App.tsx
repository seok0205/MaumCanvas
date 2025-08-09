import { QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { queryClient } from '@/config/queryClient';
import { useFontLoading } from '@/hooks/useFontLoading';
import { lazyNamedExport } from '@/utils/lazyNamedExport';

// 로딩 컴포넌트
const LoadingSpinner = () => (
  <div className='flex items-center justify-center min-h-screen bg-warm-gradient'>
    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-mint'></div>
  </div>
);

// 타입 안전 유틸리티를 사용한 페이지별 코드 분할
const Index = lazyNamedExport(() => import('@/pages/Index'), 'Index');
const Login = lazyNamedExport(() => import('@/pages/Login'), 'Login');
const Register = lazyNamedExport(() => import('@/pages/Register'), 'Register');
const ForgotPassword = lazyNamedExport(
  () => import('@/pages/ForgotPassword'),
  'ForgotPassword'
);
const Onboarding = lazyNamedExport(
  () => import('@/pages/Onboarding'),
  'Onboarding'
);
const UserRoleSelection = lazyNamedExport(
  () => import('@/pages/UserRoleSelection'),
  'UserRoleSelection'
);
const Dashboard = lazyNamedExport(
  () => import('@/pages/Dashboard'),
  'Dashboard'
);
const Diagnosis = lazyNamedExport(
  () => import('@/pages/Diagnosis'),
  'Diagnosis'
);
const DrawingDiagnosis = lazyNamedExport(
  () => import('@/pages/DrawingDiagnosis'),
  'DrawingDiagnosis'
);
const DrawingCanvas = lazyNamedExport(
  () => import('@/pages/DrawingCanvas'),
  'DrawingCanvas'
);
const MyPage = lazyNamedExport(() => import('@/pages/MyPage'), 'MyPage');
const QuestionnaireForm = lazyNamedExport(
  () => import('@/components/questionnaire/QuestionnaireForm'),
  'QuestionnaireForm'
);
const QuestionnaireResult = lazyNamedExport(
  () => import('@/components/questionnaire/QuestionnaireResult'),
  'QuestionnaireResult'
);
const CounselingReservation = lazyNamedExport(
  () => import('@/pages/CounselingReservation'),
  'CounselingReservation'
);
const CommunityPage = lazyNamedExport(
  () => import('@/pages/Community'),
  'CommunityPage'
);
const CommunityCreatePost = lazyNamedExport(
  () => import('@/pages/CommunityCreatePost'),
  'CommunityCreatePost'
);
const CommunityPostDetail = lazyNamedExport(
  () => import('@/pages/CommunityPostDetail'),
  'CommunityPostDetail'
);
const Unauthorized = lazyNamedExport(
  () => import('@/pages/Unauthorized'),
  'Unauthorized'
);

function App() {
  const { isLoaded, isError } = useFontLoading('Pretendard');

  return (
    <div
      className={`min-h-screen bg-warm-gradient font-sans antialiased ${
        isLoaded ? 'font-loaded' : isError ? 'font-fallback' : 'font-loading'
      }`}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path='/' element={<Index />} />
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path='/forgot-password' element={<ForgotPassword />} />
              <Route path='/onboarding' element={<Onboarding />} />
              <Route
                path='/user-role-selection'
                element={<UserRoleSelection />}
              />
              <Route
                path='/dashboard'
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/diagnosis'
                element={
                  <ProtectedRoute>
                    <Diagnosis />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/diagnosis/drawing'
                element={
                  <ProtectedRoute>
                    <DrawingDiagnosis />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/diagnosis/drawing/canvas'
                element={
                  <ProtectedRoute>
                    <DrawingCanvas />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/mypage'
                element={
                  <ProtectedRoute>
                    <MyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/questionnaire/:categoryId'
                element={
                  <ProtectedRoute>
                    <QuestionnaireForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/questionnaire/:categoryId/result'
                element={
                  <ProtectedRoute>
                    <QuestionnaireResult />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/counseling-reservation'
                element={
                  <ProtectedRoute>
                    <CounselingReservation />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/community'
                element={
                  <ProtectedRoute>
                    <CommunityPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/community/create'
                element={
                  <ProtectedRoute>
                    <CommunityCreatePost />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/community/:id'
                element={
                  <ProtectedRoute>
                    <CommunityPostDetail />
                  </ProtectedRoute>
                }
              />
              <Route path='/unauthorized' element={<Unauthorized />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster
          position='top-center'
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
            },
          }}
        />
      </QueryClientProvider>
    </div>
  );
}

export default App;
