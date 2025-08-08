import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { QuestionnaireForm } from '@/components/questionnaire/QuestionnaireForm';
import { QuestionnaireResult } from '@/components/questionnaire/QuestionnaireResult';
import { queryClient } from '@/config/queryClient';
import { useFontLoading } from '@/hooks/useFontLoading';
import { CommunityPage } from '@/pages/Community';
import { CommunityCreatePost } from '@/pages/CommunityCreatePost';
import { CommunityPostDetail } from '@/pages/CommunityPostDetail';
import { CounselingReservation } from '@/pages/CounselingReservation';
import { Dashboard } from '@/pages/Dashboard';
import { Diagnosis } from '@/pages/Diagnosis';
import { DrawingDiagnosis } from '@/pages/DrawingDiagnosis';
import { DrawingCanvas } from '@/pages/DrawingCanvas';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { Index } from '@/pages/Index';
import { Login } from '@/pages/Login';
import { MyPage } from '@/pages/MyPage';
import { Onboarding } from '@/pages/Onboarding';
import { Register } from '@/pages/Register';
import { Unauthorized } from '@/pages/Unauthorized';
import { UserRoleSelection } from '@/pages/UserRoleSelection';

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
