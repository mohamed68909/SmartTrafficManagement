import React from 'react';
import Modal from './Modal';

const UserDetailModal = ({ open, onClose, user }) => {
  if (!user) return null;

  const fields = [
    { label: 'ID', value: user.id },
    { label: 'Name', value: user.name },
    { label: 'Role', value: user.role },
    { label: 'Email address', value: user.email },
    { label: 'Phone number', value: user.phone },
    { label: 'Status', value: user.status },
    { label: 'Registration date', value: user.date },
    { label: 'Orders', value: user.orders },
    { label: 'Rating', value: user.rating ? `★ ${user.rating}` : undefined },
    { label: 'Employee code', value: user.code },
    { label: 'Open', value: user.open },
  ].filter((item) => item.value !== undefined && item.value !== null && item.value !== '');

  return (
    <Modal open={open} onClose={onClose} title={`Details for ${user.name || 'User'}`} size="520px">
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
            <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', marginBottom: 6 }}>Notes</div>
            <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>{user.notes}</div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default UserDetailModal;
