import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { QuestionnaireForm } from '@/components/questionnaire/QuestionnaireForm';
import { QuestionnaireResult } from '@/components/questionnaire/QuestionnaireResult';
import { useGlobalFontLoading } from '@/hooks/useFontLoading';
import { Dashboard } from '@/pages/Dashboard';
import { Diagnosis } from '@/pages/Diagnosis';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { Index } from '@/pages/Index';
import { Login } from '@/pages/Login';
import { MyPage } from '@/pages/MyPage';
import { Onboarding } from '@/pages/Onboarding';
import { Register } from '@/pages/Register';
import { Unauthorized } from '@/pages/Unauthorized';
import { UserRoleSelection } from '@/pages/UserRoleSelection';

// React Query 클라이언트 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      retry: 3,
      retryDelay: 2000, // 2초
      refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 재요청 비활성화
      refetchOnReconnect: false, // 네트워크 재연결 시 자동 재요청 비활성화 (깜빡거림 방지)
      refetchOnMount: true, // 컴포넌트 마운트 시 재요청 활성화
    },
  },
});

function App() {
  const fontsLoaded = useGlobalFontLoading();

  return (
    <div
      className={`min-h-screen bg-background font-sans antialiased ${
        fontsLoaded ? 'font-loaded' : 'font-loading'
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
