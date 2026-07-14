import React from 'react';

const CsDriverLookup = ({
  driverQuery,
  setDriverQuery,
  handleSearchDrivers,
  lookupLoading,
  driverLookupList,
  driverLookup,
  setDriverLookup,
  handleBlockDriver
}) => {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 9, padding: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 18, color: 'var(--text3)' }}>🔍</span>
        <input
          type="text"
          placeholder="Search by name..."
          value={driverQuery}
          onChange={e => setDriverQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearchDrivers(driverQuery)}
          style={{
            background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: 'inherit', fontSize: 15, flex: 1, direction: 'ltr',
          }} />
        <button className="btn btn-neon" onClick={() => handleSearchDrivers(driverQuery)}>Search</button>
      </div>
      {/* Loading spinner */}
      {lookupLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--border)', borderTop: '3px solid var(--neon)', animation: 'spin 0.8s linear infinite' }} />
        </div>
      )}

      {/* Empty state — no search yet */}
      {!lookupLoading && (driverLookupList || []).length === 0 && !driverLookup && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 9, padding: 40, textAlign: 'center', color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 13 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
          Search for a driver by name
        </div>
      )}

      {/* Results list */}
      {!lookupLoading && (driverLookupList || []).length > 0 && !driverLookup && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 9, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: 1 }}>RESULTS</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, background: 'var(--neon-dim)', color: 'var(--neon)', padding: '2px 8px', borderRadius: 20 }}>{driverLookupList.length}</span>
          </div>
          {driverLookupList.map((d, i) => (
            <div key={d.id} onClick={() => setDriverLookup(d)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
              borderBottom: i < driverLookupList.length - 1 ? '1px solid var(--border)' : 'none',
              cursor: 'pointer', transition: 'background .12s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                background: d.isActive ? 'linear-gradient(135deg,var(--neon),#44ff88)' : 'var(--bg3)',
                border: d.isActive ? 'none' : '1px solid var(--border2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 13, color: d.isActive ? '#000' : 'var(--text3)',
              }}>{d.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.email}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {d.phone !== '—' && <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{d.phone}</span>}
                <span style={{
                  fontSize: 10, fontFamily: 'var(--mono)', padding: '2px 8px', borderRadius: 20, fontWeight: 600,
                  background: d.isActive ? 'rgba(170,255,0,.12)' : 'rgba(255,45,72,.10)',
                  color: d.isActive ? 'var(--neon)' : 'var(--red)',
                  border: `1px solid ${d.isActive ? 'rgba(170,255,0,.2)' : 'rgba(255,45,72,.2)'}`,
                }}>{d.isActive ? 'Active' : 'Inactive'}</span>
                <span style={{ color: 'var(--text3)', fontSize: 13 }}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Driver detail card — shown after selecting from list */}
      {!lookupLoading && driverLookup && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 9, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Back button */}
          <button className="btn btn-ghost" style={{ alignSelf: 'flex-start', fontSize: 12 }} onClick={() => setDriverLookup(null)}>← Back to results</button>

          {/* Header */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
              background: driverLookup.isActive ? 'linear-gradient(135deg,var(--neon),#44ff88)' : 'var(--bg3)',
              border: driverLookup.isActive ? 'none' : '1px solid var(--border2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 20, color: driverLookup.isActive ? '#000' : 'var(--text3)',
            }}>{driverLookup.initials}</div>
            <div>
              <div style={{ fontFamily: 'var(--head)', fontSize: 20, fontWeight: 700, marginBottom: 3 }}>{driverLookup.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)', marginBottom: 6 }}>{driverLookup.email}</div>
              <span style={{
                fontSize: 10, fontFamily: 'var(--mono)', padding: '3px 10px', borderRadius: 20, fontWeight: 600,
                background: driverLookup.isActive ? 'rgba(170,255,0,.12)' : 'rgba(255,45,72,.10)',
                color: driverLookup.isActive ? 'var(--neon)' : 'var(--red)',
                border: `1px solid ${driverLookup.isActive ? 'rgba(170,255,0,.2)' : 'rgba(255,45,72,.2)'}`,
              }}>{driverLookup.isActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>

          {/* Fields */}
          {[
            { label: 'Phone', val: driverLookup.phone },
            { label: 'Email', val: driverLookup.email },
            { label: 'Driver ID', val: driverLookup.id ? driverLookup.id.slice(0, 8).toUpperCase() + '…' : '—' },
            { label: 'Status', val: driverLookup.isActive ? 'Active' : 'Inactive' },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{row.val}</span>
            </div>
          ))}

          <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} onClick={() => handleBlockDriver(driverLookup.id)}>
            🚫 Block Driver
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(CsDriverLookup);
