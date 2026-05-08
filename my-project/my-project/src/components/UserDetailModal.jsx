import React from 'react';
import Modal from './Modal';
import { useTranslation } from '../i18n/LanguageContext';

const UserDetailModal = ({ open, onClose, user }) => {
  const { t } = useTranslation();
  if (!user) return null;

  const fields = [
    { label: t('modal.fields.id'), value: user.id },
    { label: t('modal.fields.name'), value: user.name },
    { label: t('modal.fields.role'), value: user.role },
    { label: t('modal.fields.email'), value: user.email },
    { label: t('modal.fields.phone'), value: user.phone },
    { label: t('modal.fields.status'), value: user.status },
    { label: t('modal.fields.registrationDate'), value: user.date },
    { label: t('modal.fields.orders'), value: user.orders },
    { label: t('modal.fields.rating'), value: user.rating ? `★ ${user.rating}` : undefined },
    { label: t('modal.fields.employeeCode'), value: user.code },
    { label: t('modal.fields.open'), value: user.open },
  ].filter((item) => item.value !== undefined && item.value !== null && item.value !== '');

  return (
    <Modal open={open} onClose={onClose} title={`${user.name || t('modal.fallbackUser')} — ${t('modal.userDetails')}`} size="520px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            minWidth: 72,
            minHeight: 72,
            borderRadius: '50%',
            background: user.avatarGrad || 'var(--neon-dim)',
            color: user.avatarColor || '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            fontWeight: 700,
          }}>
            {user.initials || user.name?.slice(0, 2) || '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{user.name}</div>
            {user.email && <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>{user.email}</div>}
            {user.role && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>{user.role}</div>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
          {fields.map((field) => (
            <div key={field.label} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', marginBottom: 5 }}>{field.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{field.value}</div>
            </div>
          ))}
        </div>

        {user.notes && (
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', marginBottom: 6 }}>{t('modal.fields.notes')}</div>
            <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>{user.notes}</div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default UserDetailModal;
