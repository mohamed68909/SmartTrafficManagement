import React from 'react';

const SellerProducts = ({
  products,
  tabLoading,
  openAddProduct,
  getProductCategoryName,
  openEditProduct,
  openRestockModal,
  setDeleteProductTarget,
  removingProductId
}) => {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--head)', fontSize: 20 }}>Product Catalog ({products?.length || 0})</div>
        <button
          className="btn btn-neon"
          onClick={openAddProduct}
          style={{
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 12px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            boxShadow: 'none',
          }}
        >
          <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
          Add Product
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {(products || []).map((p, i) => (
          <div key={p.id || i} style={{
            background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10,
            overflow: 'hidden', transition: 'all .2s', cursor: 'pointer',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(170,255,0,.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{
              height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg3)', fontSize: 52, borderBottom: '1px solid var(--border)',
            }}>
              {p.img && p.img.startsWith('http')
                ? <img src={p.img} alt={p.name} style={{ maxHeight: 100, objectFit: 'contain' }} />
                : p.img}
            </div>
            <div style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1 }}>{getProductCategoryName(p)}</div>
                <div
                  title={`Product ID: ${p.id}`}
                  style={{
                    maxWidth: 116,
                    padding: '3px 7px',
                    borderRadius: 999,
                    background: 'rgba(170,255,0,.08)',
                    border: '1px solid rgba(170,255,0,.2)',
                    color: 'var(--neon)',
                    fontSize: 9,
                    fontFamily: 'var(--mono)',
                    letterSpacing: .3,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  #{String(p.id).replace(/^#/, '')}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, lineHeight: 1.3 }}>{p.name}</div>
              <div
                title={p.description || 'No description'}
                style={{
                  minHeight: 34,
                  marginBottom: 8,
                  color: 'var(--text3)',
                  fontSize: 11,
                  lineHeight: 1.45,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {p.description || 'No description'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontFamily: 'var(--head)', fontSize: 22, color: 'var(--neon)' }}>{p.price} <small style={{ fontSize: 12, color: 'var(--text3)' }}>EGP</small></div>
                <div style={{ fontSize: 11, color: 'var(--amber)' }}>★ {p.rating}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                <span>Stock: {p.stock}</span>
                <span>Sold: {p.sold}</span>
              </div>
              {/* Status badge */}
              <div style={{ marginTop: 8 }}>
                <span style={{
                  fontSize: 10, fontFamily: 'var(--mono)', padding: '2px 8px', borderRadius: 10,
                  background: p.stock > 0 ? 'rgba(0,229,160,.08)' : 'rgba(255,45,72,.08)',
                  color: p.stock > 0 ? 'var(--emerald)' : 'var(--red)',
                  border: `1px solid ${p.stock > 0 ? 'var(--emerald)' : 'var(--red)'}44`,
                }}>{p.status}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); openEditProduct(p); }}
                  style={{
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text2)',
                    borderRadius: 6,
                    padding: '6px 9px',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); openRestockModal(p); }}
                  style={{
                    border: '1px solid rgba(170,255,0,.28)',
                    background: 'rgba(170,255,0,.07)',
                    color: 'var(--neon)',
                    borderRadius: 6,
                    padding: '6px 9px',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  + Stock
                </button>
                <button
                  type="button"
                  disabled={removingProductId === p.id}
                  onClick={(e) => { e.stopPropagation(); setDeleteProductTarget(p); }}
                  style={{
                    border: '1px solid rgba(255,77,109,.28)',
                    background: 'transparent',
                    color: 'var(--red)',
                    borderRadius: 6,
                    padding: '6px 9px',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: removingProductId === p.id ? 'wait' : 'pointer',
                    opacity: removingProductId === p.id ? .65 : 1,
                  }}
                >
                  {removingProductId === p.id ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </div>
          </div>
        ))}
        {products?.length === 0 && !tabLoading && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text3)' }}>No products found</div>
        )}
      </div>
    </>
  );
};

export default React.memo(SellerProducts);
