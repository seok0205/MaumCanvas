import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';

import { Dashboard } from '@/pages/Dashboard';
import { Diagnosis } from '@/pages/Diagnosis';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { Index } from '@/pages/Index';
import { Login } from '@/pages/Login';
import { MyPage } from '@/pages/MyPage';
import { Onboarding } from '@/pages/Onboarding';
import { Register } from '@/pages/Register';
import { UserRoleSelection } from '@/pages/UserRoleSelection';

// React Query 클라이언트 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      retry: 1,
    },
  },
});

function App() {
  return (
    <div className='min-h-screen bg-background font-sans antialiased'>
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
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/diagnosis' element={<Diagnosis />} />
            <Route path='/mypage' element={<MyPage />} />
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
