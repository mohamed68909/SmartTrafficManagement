import React from 'react';

const UserManagement = ({
  usersData,
  activeUserTab,
  setActiveUserTab,
  openUserModal,
  openEditUser,
  setShowAddUserModal
}) => {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Manage <span style={{ color: 'var(--neon)' }}>Users</span></h2>
          <div style={{ fontSize: 11.5, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 3 }}>Users · Sellers · Providers</div>
        </div>
        <button onClick={() => setShowAddUserModal(true)} style={{
          padding: '8px 18px', borderRadius: 8, background: 'var(--neon)', color: '#000',
          border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)',
        }}>+ Add User</button>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'scroll' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 16px' }}>
          {[
            { key: 'user', label: 'Normal Users', count: usersData?.user?.length || 0 },
            { key: 'seller', label: 'Sellers', count: usersData?.seller?.length || 0 },
            { key: 'provider', label: 'Providers', count: usersData?.provider?.length || 0 },
          ].map(tab => (
            <div key={tab.key} onClick={() => setActiveUserTab(tab.key)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '11px 14px', cursor: 'pointer',
              fontSize: 12.5, fontWeight: 600,
              color: activeUserTab === tab.key ? 'var(--neon)' : 'var(--text3)',
              borderBottom: activeUserTab === tab.key ? '2px solid var(--neon)' : '2px solid transparent',
              marginBottom: -1,
            }}>
              {tab.label}
              <span style={{ fontSize: 10, fontFamily: 'var(--mono)', background: 'var(--bg3)', border: '1px solid var(--border2)', padding: '1px 6px', borderRadius: 10, color: 'var(--text3)' }}>{tab.count}</span>
            </div>
          ))}
        </div>

        {activeUserTab === 'user' && (
          <div style={{ maxHeight: 480 }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: 90 }} /><col style={{ width: 160 }} /><col style={{ width: 210 }} /><col style={{ width: 130 }} /><col style={{ width: 90 }} /><col style={{ width: 110 }} /><col style={{ width: 80 }} /><col style={{ width: 110 }} />
              </colgroup>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}><tr style={{ background: 'var(--bg3)' }}>
                {['ID', 'User', 'Email', 'Phone', 'Status', 'Joined', 'Points', 'Action'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'center', fontWeight: 500, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', background: 'var(--bg3)' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {(usersData?.user || []).map((u, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', wordBreak: 'break-all' }}>{u.id}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => openUserModal(u)}
                          onKeyDown={(e) => e.key === 'Enter' && openUserModal(u)}
                          aria-label={`View details for ${u.name}`}
                          title={`View details for ${u.name}`}
                          style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,var(--blue),var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0, cursor: 'pointer' }}
                        >
                          {u.initials}
                        </div>
                        <span style={{ fontSize: 13 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</td>
                    <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap' }}>{u.phone}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'var(--mono)', background: u.status === 'Active' ? 'var(--neon-dim)' : u.status === 'Pending' ? 'var(--yellow-dim)' : 'var(--red-dim)', color: u.status === 'Active' ? 'var(--neon)' : u.status === 'Pending' ? 'var(--yellow)' : 'var(--red)' }}>{u.status}</span>
                    </td>
                    <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{u.date || '—'}</td>
                    <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--neon)' }}>{u.points ?? 0}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button onClick={() => openUserModal(u)} style={{ padding: '4px 10px', borderRadius: 5, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', fontSize: 11, cursor: 'pointer' }}>View</button>
                        <button onClick={() => openEditUser(u)} style={{ padding: '4px 10px', borderRadius: 5, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', fontSize: 11, cursor: 'pointer' }}>Edit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeUserTab === 'seller' && (
          <div style={{ maxHeight: 480 }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: 90 }} /><col style={{ width: 160 }} /><col style={{ width: 210 }} /><col style={{ width: 130 }} /><col style={{ width: 90 }} /><col style={{ width: 110 }} /><col style={{ width: 80 }} /><col style={{ width: 110 }} />
              </colgroup>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}><tr style={{ background: 'var(--bg3)' }}>
                {['ID', 'Store', 'Email', 'Phone', 'Status', 'Joined', 'Points', 'Action'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'center', fontWeight: 500, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', background: 'var(--bg3)' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {(usersData?.seller || []).map((u, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', wordBreak: 'break-all' }}>{u.id}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => openUserModal(u)}
                          onKeyDown={(e) => e.key === 'Enter' && openUserModal(u)}
                          aria-label={`View details for ${u.name}`}
                          title={`View details for ${u.name}`}
                          style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,var(--purple),var(--pink))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0, cursor: 'pointer' }}
                        >
                          {u.initials}
                        </div>
                        <span style={{ fontSize: 13 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</td>
                    <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap' }}>{u.phone}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'var(--mono)', background: u.status === 'Active' ? 'var(--neon-dim)' : 'var(--yellow-dim)', color: u.status === 'Active' ? 'var(--neon)' : u.status === 'yellow' ? 'var(--yellow)' : 'var(--text3)' }}>{u.status}</span>
                    </td>
                    <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{u.date || '—'}</td>
                    <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--blue)' }}>{u.points ?? 0}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button onClick={() => openUserModal(u)} style={{ padding: '4px 10px', borderRadius: 5, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', fontSize: 11, cursor: 'pointer' }}>View</button>
                        <button onClick={() => openEditUser(u)} style={{ padding: '4px 10px', borderRadius: 5, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', fontSize: 11, cursor: 'pointer' }}>Edit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeUserTab === 'provider' && (
          <div style={{ maxHeight: 480 }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: 90 }} /><col style={{ width: 160 }} /><col style={{ width: 210 }} /><col style={{ width: 130 }} /><col style={{ width: 90 }} /><col style={{ width: 80 }} /><col style={{ width: 110 }} />
              </colgroup>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}><tr style={{ background: 'var(--bg3)' }}>
                {['ID', 'Provider', 'Email', 'Phone', 'Status', 'Points', 'Action'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'center', fontWeight: 500, borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {(usersData?.provider || []).map((u, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', wordBreak: 'break-all' }}>{u.id}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => openUserModal(u)}
                          onKeyDown={(e) => e.key === 'Enter' && openUserModal(u)}
                          aria-label={`View details for ${u.name}`}
                          title={`View details for ${u.name}`}
                          style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,var(--cyan),var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0, cursor: 'pointer' }}
                        >
                          {u.initials}
                        </div>
                        <span style={{ fontSize: 13 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap' }}>{u.phone}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'var(--mono)', background: u.status === 'Active' ? 'var(--neon-dim)' : 'var(--yellow-dim)', color: u.status === 'Active' ? 'var(--neon)' : 'var(--yellow)' }}>{u.status}</span>
                    </td>
                    <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--neon)' }}>{u.points ?? 0}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button onClick={() => openUserModal(u)} style={{ padding: '4px 10px', borderRadius: 5, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', fontSize: 11, cursor: 'pointer' }}>View</button>
                        <button onClick={() => openEditUser(u)} style={{ padding: '4px 10px', borderRadius: 5, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', fontSize: 11, cursor: 'pointer' }}>Edit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default React.memo(UserManagement);
