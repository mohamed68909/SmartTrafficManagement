// ═══ UNAUTHORIZED PAGE ═══
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
      background: 'var(--bg)', direction: 'ltr', fontFamily: 'var(--font)',
        fontFamily: 'Cairo, var(--body), sans-serif',
    }}>
      <div style={{ position: 'absolute', top: 18, right: 18 }}><ThemeToggle /></div>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{
          width: 64, height: 64, background: 'var(--red-dim)', borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, margin: '0 auto 20px', border: '1px solid rgba(255,45,72,.2)',
        }}>🚫</div>
        <div style={{ fontFamily: 'var(--head)', fontSize: 36, letterSpacing: 1, marginBottom: 8, color: 'var(--red)' }}>
          Unauthorized
        </div>
        <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 28 }}>
          You don’t have permission to access this page. Please log in with the correct account.
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => navigate('/')} style={{
            padding: '12px 28px', background: 'var(--neon)', color: '#000', border: 'none',
            borderRadius: 10, fontFamily: 'var(--head)', fontSize: 16, letterSpacing: 1,
            cursor: 'pointer', transition: 'all .2s',
          }}>Log in</button>
          <button onClick={() => navigate(-1)} style={{
            padding: '12px 28px', background: 'transparent', color: 'var(--text2)',
            border: '1px solid var(--border)', borderRadius: 10, fontSize: 14,
            cursor: 'pointer', transition: 'all .2s',
          }}>Go back</button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
