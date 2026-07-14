import React from 'react';

const ApprovalsList = ({
  approvalsStats,
  pendingApprovals,
  handleApprove,
  handleReviewDocs,
  openRejectModal
}) => {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {(approvalsStats || []).map((s) => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 9.5, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--head)', fontSize: 30, color: s.color, lineHeight: 1 }}>{s.val}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(pendingApprovals || []).map((a, i) => (
          <div key={`${a.id || 'approval'}-${i}`} style={{
            background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10,
            padding: '16px 18px', display: 'flex', gap: 16, alignItems: 'center',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 12, background: 'var(--bg3)',
              border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, flexShrink: 0,
            }}>{a.img}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 3 }}>{a.id}</div>
              <div style={{ fontFamily: 'var(--head)', fontSize: 18, letterSpacing: .5, marginBottom: 4 }}>{a.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <span>Type: {a.type}</span>
                <span>Service: {a.service}</span>
                <span>Docs: {a.docs}</span>
                <span>Date: {a.date}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                className="btn btn-neon"
                onClick={() => handleApprove(a.id)}
                style={{ cursor: 'pointer', minWidth: 86, fontWeight: 700, transition: 'transform .15s ease, opacity .15s ease', backgroundColor: 'green', padding: '5px', borderRadius: '5px' }}
              >
                Approve
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => handleReviewDocs(a)}
                style={{ cursor: 'pointer', minWidth: 86, fontWeight: 700, transition: 'transform .15s ease, opacity .15s ease', backgroundColor: 'grey', padding: '5px', borderRadius: '5px' }}
              >
                Review
              </button>
              <button
                className="btn btn-danger"
                onClick={() => openRejectModal(a.id)}
                style={{ cursor: 'pointer', minWidth: 86, fontWeight: 700, transition: 'transform .15s ease, opacity .15s ease', backgroundColor: 'red', padding: '5px', borderRadius: '5px' }}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default React.memo(ApprovalsList);
