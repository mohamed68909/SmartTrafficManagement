import React, { useEffect, useRef } from 'react';
import { useTranslation } from '../i18n/LanguageContext';

const Modal = ({ open, onClose, title, children, size = '560px' }) => {
  const { t } = useTranslation();
  const contentRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      contentRef.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        background: 'rgba(4,6,8,0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        ref={contentRef}
        onClick={(event) => event.stopPropagation()}
        tabIndex={-1}
        style={{
          width: '100%',
          maxWidth: size,
          maxHeight: 'calc(100vh - 64px)',
          overflowY: 'auto',
          background: 'var(--card)',
          border: '1px solid var(--border2)',
          borderRadius: 22,
          padding: 24,
          boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
          color: 'var(--text)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 16 }}>
          <div>
            <h2 id="modal-title" style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text3)',
              fontSize: 22,
              cursor: 'pointer',
              padding: 6,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};

export default Modal;
