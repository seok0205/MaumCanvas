import { Toaster as Sonner } from '@/components/ui/feedback/sonner';
import { Toaster } from '@/components/ui/feedback/toaster';
import { TooltipProvider } from '@/components/ui/overlay/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { ForgotPassword } from './pages/ForgotPassword';
import { Index } from './pages/Index';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';
import { Onboarding } from './pages/Onboarding';
import { Register } from './pages/Register';
import { UserRoleSelection } from './pages/UserRoleSelection';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className='min-h-screen bg-background font-sans antialiased'>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Index />} />
            <Route path='/onboarding' element={<Onboarding />} />
            <Route
              path='/user-role-selection'
              element={<UserRoleSelection />}
            />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/dashboard' element={<Dashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path='*' element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
