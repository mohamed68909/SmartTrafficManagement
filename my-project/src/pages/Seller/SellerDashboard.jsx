import React from 'react';

const SellerDashboard = ({
  dashboardStats,
  orders,
  handleTabChange,
  products,
  openRestockModal
}) => {
  return (
    <>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        {(dashboardStats || []).map(s => (
          <div key={s.label} style={{
            background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px',
            transition: 'all .18s', cursor: 'default',
          }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 9.5, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 4 }}>{s.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: 'var(--head)', fontSize: 30, letterSpacing: 1, lineHeight: 1, color: s.color }}>{s.val}</span>
              {s.unit && <span style={{ fontSize: 13, color: 'var(--text3)' }}>{s.unit}</span>}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{s.delta}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--head)', fontSize: 16 }}>Recent Orders</span>
          <button className="btn btn-ghost btn-sm" onClick={() => handleTabChange('orders')}>View All</button>
        </div>
        <div className="table-responsive">
          {(() => {
            const slice = (orders || []).slice(0, 4);
            const hasItems = slice.some(o => o.items !== '?' && o.items != null);
            const dashCols = [
              { key: 'id',       label: 'ID' },
              hasItems && { key: 'items', label: 'Items' },
              { key: 'total',    label: 'Total' },
              { key: 'status',   label: 'Status' },
            ].filter(Boolean);
            return (
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--card)', fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-normal)' }}>
                <thead>
                  <tr style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
                    {dashCols.map(c => (
                      <th key={c.key} style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--head)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text)' }}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slice.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--border2)', transition: 'background 0.15s ease' }}>
                      {dashCols.map(c => {
                        if (c.key === 'id')       return <td key="id"       style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{o.id}</td>;
                        if (c.key === 'items')    return <td key="items"    style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{o.items}</td>;
                        if (c.key === 'total')    return <td key="total"    style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--neon)', fontFamily: 'var(--mono)', fontWeight: 'var(--font-weight-medium)' }}>{o.total} EGP</td>;
                        if (c.key === 'status')   return <td key="status"   style={{ padding: '10px 12px', textAlign: 'center' }}><span className="badge" style={{ background: `${o.color}22`, color: o.color, border: `1px solid ${o.color}44` }}>{o.status}</span></td>;
                        return null;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })()}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 16 }}>Best Sellers</div>
          {(products || []).slice(0, 3).map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
              <div style={{ fontSize: 28, width: 40, textAlign: 'center' }}>{p.img}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{p.sold} sold · ★{p.rating}</div>
              </div>
              <div style={{ fontFamily: 'var(--head)', fontSize: 18, color: 'var(--neon)' }}>{p.price}</div>
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 16 }}>Low Stock</div>
          {(products || []).filter(p => p.stock < 15).map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
              <div style={{ fontSize: 28, width: 40, textAlign: 'center' }}>{p.img}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--red)', fontFamily: 'var(--mono)' }}>Only {p.stock} left</div>
              </div>
              <button className="btn btn-amber btn-sm" onClick={() => openRestockModal(p)}>Restock</button>
            </div>
          ))}
          {(products || []).filter(p => p.stock < 15).length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>All products well stocked</div>
          )}
        </div>
      </div>
    </>
  );
};

export default React.memo(SellerDashboard);
