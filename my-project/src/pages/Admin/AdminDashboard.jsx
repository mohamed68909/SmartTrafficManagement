import React from 'react';

const AdminDashboard = ({
  dashboardData,
  pendingApprovals,
  setActiveView,
  setSectionErrors,
  setTabError,
  tabErrorsByView,
  loadTab
}) => {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {(dashboardData?.stats || []).map(s => {
          // Resolve icon matching if needed or use passed SVGs
          return (
            <div key={s.label} style={{
              background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px',
              transition: 'all .18s', cursor: 'default',
            }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 9.5, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--head)', fontSize: 28, letterSpacing: 1, lineHeight: 1, color: s.color, marginBottom: 4 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.delta}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
        {/* Traffic Overview */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'var(--head)', fontSize: 16, margin: 0 }}>Traffic Overview</h2>
            <div style={{ display: 'flex', gap: 6 }}>
              {['Cairo', 'Giza', 'Regional'].map(r => (
                <span key={r} style={{
                  padding: '3px 10px', borderRadius: 4, fontSize: 10, fontFamily: 'var(--mono)',
                  border: '1px solid var(--border)', color: 'var(--text3)', cursor: 'pointer',
                }}>{r}</span>
              ))}
            </div>
          </div>
          <div style={{
            height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden', background: 'var(--bg3)',
            backgroundImage: 'linear-gradient(rgba(170,255,0,.02) 1px,transparent 1px), linear-gradient(90deg,rgba(170,255,0,.02) 1px,transparent 1px)',
            backgroundSize: '20px 20px',
          }}>
            {(dashboardData?.trafficMap || []).map((m, i) => (
              <div key={i} style={{
                position: 'absolute', top: m.top, left: m.left,
                display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer',
              }} title={`${m.label}: ${m.density}% Density`}>
                <div style={{
                  width: 12, height: 12, borderRadius: '50%', background: m.color,
                  boxShadow: `0 0 10px ${m.color}`, animation: 'pulse 2s infinite',
                }} />
                <span style={{ fontSize: 8, fontFamily: 'var(--mono)', color: m.color, marginTop: 3 }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <h2 style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 16, margin: 0 }}>System Status</h2>
            {(dashboardData?.systemStatus || []).map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13 }}>{s.name}</span>
                <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: s.color }}>{s.status}</span>
                <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{s.uptime}</span>
              </div>
            ))}
          </div>

          <div style={{
            background: 'var(--neon-faint)', border: '1px solid rgba(170,255,0,.12)',
            borderRadius: 10, padding: '14px 16px',
          }}>
            <div style={{ fontSize: 9.5, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 6 }}>Pending Approvals</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: 'var(--head)', fontSize: 36, color: 'var(--amber)', lineHeight: 1 }}>{pendingApprovals?.length || 0}</span>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>apps need review</span>
            </div>
            <button className="btn btn-neon btn-sm" style={{ marginTop: 10, width: '100%', justifyContent: 'center' }} onClick={() => { setActiveView('approvals'); setSectionErrors({}); setTabError(tabErrorsByView?.approvals || ''); loadTab('approvals'); }}>Review Now</button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <h2 style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 16, margin: 0 }}>Recent Activity</h2>
        {(dashboardData?.recentActivity || []).map((a, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background .12s' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{a.icon}</div>
            <div style={{ flex: 1, fontSize: 13 }}>{a.text}</div>
            <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', whiteSpace: 'nowrap' }}>{a.time}</div>
          </div>
        ))}
      </div>
    </>
  );
};

export default React.memo(AdminDashboard);
