import React from 'react';

const SkeletonLoader = ({ type = 'table', count = 5 }) => {
  if (type === 'dashboard') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
        {/* Stat Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="skeleton-box" style={{ width: 32, height: 32, borderRadius: '50%' }} />
              <div className="skeleton-box" style={{ width: '60%', height: 12 }} />
              <div className="skeleton-box" style={{ width: '40%', height: 26 }} />
            </div>
          ))}
        </div>

        {/* Large Table placeholder */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="skeleton-box" style={{ width: 140, height: 18 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="skeleton-box" style={{ width: '15%', height: 14 }} />
                <div className="skeleton-box" style={{ width: '35%', height: 14 }} />
                <div className="skeleton-box" style={{ width: '25%', height: 14 }} />
                <div className="skeleton-box" style={{ width: '25%', height: 14 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, width: '100%' }}>
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="skeleton-box" style={{ width: '100%', height: 130, borderRadius: 8 }} />
            <div className="skeleton-box" style={{ width: '80%', height: 16 }} />
            <div className="skeleton-box" style={{ width: '50%', height: 12 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="skeleton-box" style={{ width: '30%', height: 20 }} />
              <div className="skeleton-box" style={{ width: '35%', height: 26, borderRadius: 6 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default: Table list loader
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="skeleton-box" style={{ width: 160, height: 20 }} />
        <div className="skeleton-box" style={{ width: 90, height: 28, borderRadius: 6 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border2)' }}>
            <div className="skeleton-box" style={{ width: '10%', height: 14 }} />
            <div className="skeleton-box" style={{ width: '30%', height: 14 }} />
            <div className="skeleton-box" style={{ width: '20%', height: 14 }} />
            <div className="skeleton-box" style={{ width: '15%', height: 14 }} />
            <div className="skeleton-box" style={{ width: '25%', height: 14 }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(SkeletonLoader);
