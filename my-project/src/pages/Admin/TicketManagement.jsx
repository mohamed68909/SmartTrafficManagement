import React from 'react';

const TicketManagement = ({
  tickets,
  ticketsStats,
  handleViewTicket
}) => {
  const stats = (ticketsStats?.length ? ticketsStats : [
    { label: 'TOTAL', val: tickets?.length || 0, color: 'var(--neon)' },
    { label: 'OPEN', val: (tickets || []).filter(t => t.status === 'Open').length, color: 'var(--amber)' },
    { label: 'IN PROGRESS', val: (tickets || []).filter(t => t.status === 'In Progress').length, color: 'var(--blue)' },
    { label: 'CLOSED', val: (tickets || []).filter(t => t.status === 'Completed' || t.status === 'Closed').length, color: 'var(--emerald)' },
  ]);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Support <span style={{ color: 'var(--neon)' }}>Tickets</span></h2>
          <div style={{ fontSize: 11.5, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 3 }}>Support requests from users</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 9.5, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--head)', fontSize: 30, color: s.color, lineHeight: 1 }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', maxHeight: 480, overflowY: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: 90 }} /><col style={{ width: 200 }} /><col style={{ width: 140 }} /><col style={{ width: 130 }} /><col style={{ width: 110 }} /><col style={{ width: 110 }} /><col style={{ width: 100 }} />
            </colgroup>
            <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}><tr style={{ background: 'var(--bg3)' }}>
              {['#', 'Subject', 'User', 'Agent', 'Status', 'Date', 'Action'].map(h => (
                <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'center', fontWeight: 500, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', background: 'var(--bg3)' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {(tickets || []).map((t, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.id}>{t.id?.slice(0, 8)}...</td>
                  <td style={{ padding: '11px 14px', fontSize: 12.5, maxWidth: 180 }}>{t.subject}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{t.initials}</div>
                      <span style={{ fontSize: 13 }}>{t.user}</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', textAlign: 'center' }}>
                    {t.agent && t.agent !== '—' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{t.agent.substring(0, 2).toUpperCase()}</div>
                        <span style={{ fontSize: 12 }}>{t.agent}</span>
                      </div>
                    ) : <span style={{ color: 'var(--text3)' }}>—</span>}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'var(--mono)', background: t.status === 'Done' ? 'var(--neon-dim)' : t.status === 'Open' ? 'var(--red-dim)' : 'var(--yellow-dim)', color: t.status === 'Done' ? 'var(--neon)' : t.status === 'Open' ? 'var(--red)' : 'var(--yellow)' }}>{t.status}</span>
                  </td>
                  <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{t.date}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <button onClick={() => handleViewTicket(t.id)} style={{ padding: '4px 10px', borderRadius: 5, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', fontSize: 11, cursor: 'pointer' }}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default React.memo(TicketManagement);
