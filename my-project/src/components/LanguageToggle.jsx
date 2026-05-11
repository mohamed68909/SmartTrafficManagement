import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';

const LanguageToggle = () => {
  const { lang, toggle, t } = useTranslation();
  const next = lang === 'ar' ? 'en' : 'ar';
  const label = next === 'ar' ? 'ع' : 'EN';

  return (
    <button
      type="button"
      onClick={toggle}
      style={{
        minWidth: 44,
        height: 44,
        padding: '0 10px',
        borderRadius: 50,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text2)',
        transition: 'all .2s',
        border: '1px solid var(--border)',
        background: 'var(--bg3)',
        fontFamily: 'var(--mono)',
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 0.5,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--neon)';
        e.currentTarget.style.color = 'var(--neon)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.color = 'var(--text2)';
      }}
      aria-label={t('common.toggleLanguage')}
      title={next === 'ar' ? t('common.switchToArabic') : t('common.switchToEnglish')}
    >
      {label}
    </button>
  );
};

export default LanguageToggle;
