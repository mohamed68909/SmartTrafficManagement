import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './hooks/useToast';
import { LanguageProvider, useTranslation } from './i18n/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import { useDarkMode } from './hooks/useDarkMode';

const Landing = lazy(() => import('./pages/Landing'));
const CsAgent = lazy(() => import('./pages/CsAgent'));
const Provider = lazy(() => import('./pages/Provider'));
const Seller = lazy(() => import('./pages/Seller'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));


const Loader = () => {
  const { t } = useTranslation();
  const [isDark] = useDarkMode();

  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: isDark ? '#04060c' : '#f0fdf8',
      transition: 'background 0.3s',
    }}>
      <style>{`
        @keyframes iconBeat {
          0%, 100% { transform: scale(1);    box-shadow: 0 0 24px var(--neon-glow); }
          50%       { transform: scale(1.12); box-shadow: 0 0 40px var(--neon-glow); }
        }
        @keyframes loaderDot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%           { opacity: 1;   transform: scale(1); }
        }
      `}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, background: 'var(--neon)', borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--head)', fontSize: 24, color: '#000',
          margin: '0 auto 20px', animation: 'iconBeat 1.2s ease-in-out infinite',
        }}>ST</div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 14 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--neon)',
              animation: 'loaderDot 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }} />
          ))}
        </div>

        <div style={{
          fontFamily: 'var(--mono)', fontSize: 12,
          color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(5,150,105,0.7)',
          letterSpacing: 2,
        }}>{t('common.loading')}</div>
      </div>
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <BrowserRouter>
          <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/index" element={<Landing />} />
            <Route path="/cs-agent" element={
              <ProtectedRoute allowedRoles={['cs']}>
                <CsAgent />
              </ProtectedRoute>
            } />
            <Route path="/provider" element={
              <ProtectedRoute allowedRoles={['provider']}>
                <Provider />
              </ProtectedRoute>
            } />
            <Route path="/seller" element={
              <ProtectedRoute allowedRoles={['seller']}>
                <Seller />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      </ToastProvider>
    </LanguageProvider>
  );
}

export default App;