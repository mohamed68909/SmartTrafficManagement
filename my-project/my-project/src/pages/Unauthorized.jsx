// UNAUTHORIZED PAGE 
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import { useTranslation } from '../i18n/LanguageContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
      background: 'var(--bg)',
      fontFamily: 'Cairo, var(--body), sans-serif',
    }}>
      <div style={{ position: 'absolute', top: 18, insetInlineEnd: 18, display: 'flex', gap: 8 }}>
        <LanguageToggle />
        <ThemeToggle />
      </div>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{
          width: 64, height: 64, background: 'var(--red-dim)', borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, margin: '0 auto 20px', border: '1px solid rgba(255,45,72,.2)',
        }}>🚫</div>
        <div style={{ fontFamily: 'var(--head)', fontSize: 36, letterSpacing: 1, marginBottom: 8, color: 'var(--red)' }}>
          {t('errors.unauthorizedTitle')}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 28 }}>
          {t('errors.unauthorizedDesc')}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => navigate('/')} style={{
            padding: '12px 28px', background: 'var(--neon)', color: '#000', border: 'none',
            borderRadius: 10, fontFamily: 'var(--head)', fontSize: 16, letterSpacing: 1,
            cursor: 'pointer', transition: 'all .2s',
          }}>{t('common.signIn')}</button>
          <button onClick={() => navigate(-1)} style={{
            padding: '12px 28px', background: 'transparent', color: 'var(--text2)',
            border: '1px solid var(--border)', borderRadius: 10, fontSize: 14,
            cursor: 'pointer', transition: 'all .2s',
          }}>{t('errors.goBack')}</button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
