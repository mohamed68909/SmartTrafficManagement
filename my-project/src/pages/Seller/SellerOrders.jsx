import React from 'react';

const SellerOrders = ({
  orderTabStats,
  orders,
  tabLoading
}) => {
  const hasItems   = (orders || []).some(o => o.items !== '?' && o.items != null);
  const hasAddress = (orders || []).some(o => o.address && o.address !== '?');
  const hasPhone   = (orders || []).some(o => o.phone && o.phone !== '?');
  const hasNote    = (orders || []).some(o => o.note && o.note !== '');

  const cols = [
    { key: 'id',       label: 'ID',        show: true },
    { key: 'items',    label: 'Items',    show: hasItems },
    { key: 'total',    label: 'Total',    show: true },
    { key: 'status',   label: 'Status',   show: true },
    { key: 'address',  label: 'Address',  show: hasAddress },
    { key: 'phone',    label: 'Phone',    show: hasPhone },
    { key: 'note',     label: 'Note',     show: hasNote },
  ].filter(c => c.show);

  return (
    <>
      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        {(orderTabStats || []).map(s => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 9.5, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--head)', fontSize: 30, lineHeight: 1, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Orders table */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 16 }}>All Orders</div>
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--card)', fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-normal)' }}>
            <thead>
              <tr style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
                {cols.map(c => (
                  <th key={c.key} style={{ padding: '12px 14px', textAlign: 'center', fontFamily: 'var(--head)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text)' }}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(orders || []).map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--border2)', transition: 'background 0.15s ease' }}>
                  {cols.map(c => {
                    if (c.key === 'id')       return <td key="id"       style={{ padding: '12px 14px', textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{o.id}</td>;
                    if (c.key === 'items')    return <td key="items"    style={{ padding: '12px 14px', textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{o.items}</td>;
                    if (c.key === 'total')    return <td key="total"    style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--neon)', fontFamily: 'var(--mono)', fontWeight: 'var(--font-weight-semibold)' }}>{o.total} EGP</td>;
                    if (c.key === 'status')   return <td key="status"   style={{ padding: '12px 14px', textAlign: 'center' }}><span className="badge" style={{ background: `${o.color}22`, color: o.color, border: `1px solid ${o.color}44`, padding: '4px 8px', borderRadius: 12, fontSize: 'var(--font-size-xs)' }}>{o.status}</span></td>;
                    if (c.key === 'address')  return <td key="address"  style={{ padding: '12px 14px', textAlign: 'center', fontSize: 12, color: 'var(--text2)', maxWidth: 140, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.address}</td>;
                    if (c.key === 'phone')    return <td key="phone"    style={{ padding: '12px 14px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text2)' }}>{o.phone}</td>;
                    if (c.key === 'note')     return <td key="note"     style={{ padding: '12px 14px', textAlign: 'center', fontSize: 12, color: 'var(--text3)', maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.note}</td>;
                    return null;
                  })}
                </tr>
              ))}
              {(orders || []).length === 0 && !tabLoading && (
                <tr><td colSpan={cols.length} style={{ padding: 32, textAlign: 'center', color: 'var(--text3)' }}>No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default React.memo(SellerOrders);
