import React, { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import { useTranslation } from '../i18n/LanguageContext';

const TopBar = ({ onLogout = null, title = '', showLogout = true, profileUser = null, onProfileClick = null, profileDirect = false }) => {
  const { t } = useTranslation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const handleAvatarClick = () => {
    if (profileDirect && onProfileClick) {
      onProfileClick();
      setShowProfileMenu(false);
      return;
    }
    setShowProfileMenu(open => !open);
  };
  const handleProfileItem = () => {
    if (onProfileClick) {
      onProfileClick();
    }
    setShowProfileMenu(false);
  };
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 999,
      height: 'clamp(52px, 6vw, 70px)',
      background: 'var(--bg2)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 clamp(12px, 3vw, 24px)',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        fontFamily: 'var(--head)',
        fontSize: 'clamp(16px, 4vw, 20px)',
        letterSpacing: 0.5,
        color: 'var(--text)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        flex: 1,
      }}>
        {title}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'clamp(8px, 2vw, 14px)',
        flexShrink: 0,
      }}>
        {profileUser && (
          <div style={{ position: 'relative' }}>
            <div
              onClick={handleAvatarClick}
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'linear-gradient(135deg,var(--neon),#2eff80)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 0 18px rgba(170,255,0,.2)',
              }}
              title={t('common.profile')}
            >
              {profileUser.initials || profileUser.name?.slice(0, 2) || '?'}
            </div>
            {showProfileMenu && (
              <div style={{
                position: 'absolute',
                top: 42,
                insetInlineEnd: 0,
                width: 180,
                background: 'var(--card2)',
                border: '1px solid var(--border2)',
                borderRadius: 12,
                boxShadow: '0 10px 28px rgba(0,0,0,0.18)',
                zIndex: 1000,
              }}>
                <div onClick={handleProfileItem} style={{ padding: '10px 14px', cursor: 'pointer', color: 'var(--text2)', fontSize: 13, borderBottom: '1px solid var(--border)' }}>
                  {t('common.profile')}
                </div>
              </div>
            )}
          </div>
        )}
        <LanguageToggle />
        <ThemeToggle />
        {showLogout && onLogout && (
          <button
            onClick={onLogout}
            style={{
              padding: 'clamp(6px, 1.5vw, 10px) clamp(10px, 2vw, 16px)',
              borderRadius: 8,
              border: 'none',
              background: 'var(--red-dim)',
              color: 'var(--red)',
              fontSize: 'clamp(10px, 2vw, 13px)',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all .2s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,45,72,.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'var(--red-dim)';
            }}
          >
            🚪 <span style={{ display: 'inline', marginInlineStart: 4 }}>{t('common.logout')}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default TopBar;
