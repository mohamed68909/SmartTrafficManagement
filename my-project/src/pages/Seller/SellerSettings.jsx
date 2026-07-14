import React from 'react';

const SellerSettings = ({
  settings,
  setSettings,
  sellerService,
  showToast,
  refreshTab,
  tabLoading
}) => {
  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
        <div style={{ fontFamily: 'var(--head)', fontSize: 18, marginBottom: 16 }}>Store Settings</div>
        {(settings || []).map((s, i) => (
          <div key={s.key || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{s.label}</div>
              {s.desc && <div style={{ fontSize: 12, color: 'var(--text3)' }}>{s.desc}</div>}
            </div>
            <div
              onClick={async () => {
                const updated = settings.map((x, idx) => idx === i ? { ...x, on: !x.on } : x);
                setSettings(updated);
                try {
                  await sellerService.updateSettings(updated);
                  showToast('Setting updated ✓', 'ok');
                  await refreshTab('settings');
                } catch (err) {
                  setSettings(settings);
                  showToast(err?.message || 'Failed to update', 'err');
                }
              }}
              style={{
                width: 42, height: 22, borderRadius: 12, cursor: 'pointer',
                background: s.on ? 'var(--neon)' : 'var(--border2)',
                position: 'relative', transition: 'background .2s',
              }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 2, transition: 'right .2s',
                right: s.on ? 2 : 22,
                boxShadow: '0 1px 3px rgba(0,0,0,.3)',
              }} />
            </div>
          </div>
        ))}
        {(settings || []).length === 0 && !tabLoading && (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--text3)', fontSize: 13 }}>No settings available</div>
        )}
      </div>
    </div>
  );
};

export default React.memo(SellerSettings);
