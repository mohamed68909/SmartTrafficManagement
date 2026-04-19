import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './hooks/useToast';
import ProtectedRoute from './components/ProtectedRoute';

const Landing = lazy(() => import('./pages/Landing'));
const CsAgent = lazy(() => import('./pages/CsAgent'));
const Provider = lazy(() => import('./pages/Provider'));
const Seller = lazy(() => import('./pages/Seller'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));

const Loader = () => (
  <div style={{
    height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg)', direction: 'ltr',
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 48, height: 48, background: 'var(--neon)', borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--head)', fontSize: 24, color: '#000',
        margin: '0 auto 16px', boxShadow: '0 0 24px var(--neon-glow)',
        animation: 'iconBeat 1s infinite',
      }}>ST</div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text3)', letterSpacing: 2 }}>Loading...</div>
    </div>
  </div>
);

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
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
  );
}

export default App;
