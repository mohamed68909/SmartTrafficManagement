import React from 'react';

const CsReports = ({
  ticketsStats,
  reports
}) => {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[
          { icon: '📬', label: 'Open',             val: ticketsStats?.open             ?? '—', color: 'var(--neon)',  delta: 'Currently open' },
          { icon: '🔒', label: 'Closed',           val: ticketsStats?.closed           ?? '—', color: 'var(--text2)', delta: 'Resolved tickets' },
          { icon: '⏳', label: 'Pending',          val: ticketsStats?.pending          ?? '—', color: 'var(--amber)', delta: 'Awaiting response' },
          { icon: '⚡', label: 'Avg Response (h)', val: ticketsStats?.avgResponseHours ?? '—', color: 'var(--blue)',  delta: 'Hours to first reply' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 9,
            padding: '14px 16px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 9.5, color: 'var(--text3)', fontFamily: 'var(--mono)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--head)', fontSize: 26, fontWeight: 700, lineHeight: 1, color: s.color, marginBottom: 3 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.delta}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 9, padding: 16 }}>
        <h2 style={{ fontFamily: 'var(--head)', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Weekly Tickets</h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
          {(reports?.weeklyChart || []).map(d => (
            <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 9.5, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{d.val}</span>
              <div style={{ width: '100%', height: `${d.pct}%`, borderRadius: '3px 3px 0 0', background: 'var(--neon)', opacity: d.pct / 100 * 0.5 + 0.5, minHeight: 3 }} />
              <span style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CsReports);
