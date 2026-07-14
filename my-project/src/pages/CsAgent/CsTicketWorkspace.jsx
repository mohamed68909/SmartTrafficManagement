import React from 'react';

const CsTicketWorkspace = ({
  filteredTickets,
  tickets,
  ticketsStats,
  searchQuery,
  setSearchQuery,
  handleSearchTicket,
  ticketSearchLoading,
  dataLoading,
  activeTicket,
  handleSelectTicket,
  currentTicket,
  chatLoading,
  messages,
  currentUser,
  openUserModal,
  composeText,
  setComposeText,
  composeMode,
  setComposeMode,
  sendingMessage,
  handleSendReply,
  ctxTab,
  setCtxTab,
  escalating,
  handleEscalate,
  messagesEndRef
}) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 280px', height: '100%', overflow: 'hidden', width: '100%' }}>
      {/* TICKET LIST */}
      <div style={{ background: 'var(--bg2)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <h3 style={{ fontFamily: 'var(--head)', fontSize: 'clamp(1.1rem,2vw,1.3rem)', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, color: 'var(--text)' }}>
            Queue
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, background: 'var(--red)', color: '#fff', padding: '2px 8px', borderRadius: 20 }}>
              {filteredTickets?.length || 0}
            </span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 8 }}>
            {[
              { val: ticketsStats?.open    ?? '—', label: 'Open',    color: 'var(--red)'  },
              { val: ticketsStats?.pending ?? '—', label: 'Pending', color: 'var(--amber)' },
              { val: ticketsStats?.closed  ?? '—', label: 'Closed',  color: 'var(--neon)'  },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 15, fontWeight: 500, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--mono)', letterSpacing: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '0 10px',
          }}>
            <span style={{ color: 'var(--text3)' }}>🔍</span>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearchTicket()}
              type="text"
              placeholder="Search by ID..."
              style={{
                background: 'none', border: 'none', outline: 'none', color: 'var(--text)',
                fontFamily: 'inherit', fontSize: 12, padding: '6px 0', width: '100%', direction: 'ltr',
              }}
            />
            <button
              type="button"
              onClick={handleSearchTicket}
              disabled={ticketSearchLoading}
              style={{
                border: 'none',
                background: 'transparent',
                color: ticketSearchLoading ? 'var(--text3)' : 'var(--neon)',
                fontSize: 11,
                fontFamily: 'var(--mono)',
                cursor: ticketSearchLoading ? 'wait' : 'pointer',
                padding: '4px 0',
              }}
            >
              {ticketSearchLoading ? '...' : 'GO'}
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {dataLoading || ticketSearchLoading ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 12 }}>
              {ticketSearchLoading ? 'Searching ticket...' : 'Loading...'}
            </div>
          ) : (filteredTickets || []).length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 12 }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>📭</div>
              Search by ticket ID or user name
            </div>
          ) : (filteredTickets || []).map((t, i) => {
            const isActive = activeTicket === i;
            const statusColor = t.statusNum === 1 ? 'var(--neon)' : t.statusNum === 2 ? 'var(--amber)' : 'var(--text3)';
            return (
              <div key={t.id} onClick={() => handleSelectTicket(i)} style={{
                padding: '12px 14px 10px 14px',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'background .12s',
                position: 'relative',
                background: isActive ? 'rgba(170,255,0,.06)' : 'transparent',
                borderRight: isActive ? '3px solid var(--neon)' : '3px solid transparent',
              }}>
                {/* Status accent bar (left) */}
                <div style={{
                  position: 'absolute', left: 0, top: 8, bottom: 8, width: 3,
                  borderRadius: 2, background: statusColor,
                }} />

                {/* Row 1 — short ID + date */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, paddingLeft: 8 }}>
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
                    color: 'var(--text3)', letterSpacing: 0.5,
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    padding: '1px 6px', borderRadius: 4,
                  }}>#{t.id.slice(0, 6).toUpperCase()}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)' }}>
                    {t.date} · {t.time}
                  </span>
                </div>

                {/* Row 2 — subject */}
                <div style={{
                  fontSize: 13, fontWeight: 700, paddingLeft: 8,
                  marginBottom: 7, overflow: 'hidden', textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap', color: isActive ? 'var(--neon)' : 'var(--text)',
                  lineHeight: 1.3,
                }}>{t.subject}</div>

                <div style={{
                  paddingLeft: 8,
                  marginBottom: 7,
                  fontSize: 11,
                  color: 'var(--text3)',
                  fontFamily: 'var(--mono)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {t.userName || t.name}
                </div>

                {/* Row 3 — status badge + unread dot */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 8 }}>
                  <span style={{
                    fontSize: 10, fontFamily: 'var(--mono)', fontWeight: 600,
                    padding: '2px 8px', borderRadius: 20,
                    background: t.statusNum === 1 ? 'rgba(170,255,0,.12)'
                              : t.statusNum === 2 ? 'rgba(255,180,0,.12)'
                              : 'rgba(120,120,120,.12)',
                    color: statusColor,
                    border: `1px solid ${statusColor}33`,
                  }}>{t.status}</span>
                  {t.unread && (
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--neon)',
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--neon)', boxShadow: '0 0 5px var(--neon-glow)' }} />
                      NEW
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CONVERSATION */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
        <div style={{
          padding: '12px 18px', borderBottom: '1px solid var(--border)',
          background: 'var(--bg2)', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg,var(--neon),#44ff88)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 13, color: '#000',
            }}>🎫</div>
            <div>
              <h2 style={{ fontFamily: 'var(--head)', fontSize: 17, fontWeight: 700 }}>
                Ticket {currentTicket?.id ? currentTicket.id.slice(0,8) + '…' : '—'}
              </h2>
              <div style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>{currentTicket?.subject}</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}>
          {chatLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTop: '3px solid var(--neon)', animation: 'spin 0.8s linear infinite' }} />
              Loading chat history...
            </div>
          ) : (messages || []).length === 0 && currentTicket?.id ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8, color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 12 }}>
              <div style={{ fontSize: 28 }}>💬</div>
              No messages yet
            </div>
          ) : (messages || []).length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8, color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 12 }}>
              <div style={{ fontSize: 28 }}>🎫</div>
              Select a ticket to view conversation
            </div>
          ) : (
            <>
              {(messages || []).map((msg, i) => {
                if (msg.type === 'note') {
                  return (
                    <div key={i} style={{
                      background: 'rgba(255,180,0,.06)', border: '1px solid rgba(255,180,0,.15)',
                      borderRadius: 6, padding: '10px 14px', margin: '0 18px',
                      fontSize: 12, color: 'var(--amber)', display: 'flex', gap: 8, alignItems: 'flex-start',
                    }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 1.5, background: 'var(--amber-dim)', color: 'var(--amber)', padding: '2px 7px', borderRadius: 3, whiteSpace: 'nowrap', flexShrink: 0 }}>Internal Note</span>
                      <div>{msg.text}</div>
                    </div>
                  );
                }
                if (msg.type === 'system') {
                  return <div key={i} style={{ textAlign: 'center', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', padding: '4px 0' }}>{msg.text}</div>;
                }
                const isMine = msg.from === 'agent';
                const avatarSrc = isMine
                  ? (currentUser?.profilePicture || null)
                  : (msg.profilePicture || currentTicket?.profilePicture || currentTicket?._raw?.profilePicture || null);
                const avatarInitials = isMine
                  ? (currentUser?.initials || 'CS')
                  : (msg.initials || currentTicket?.initials || 'U');
                const avatarBg = isMine
                  ? 'linear-gradient(135deg,var(--neon),#44ff88)'
                  : 'linear-gradient(135deg,#00b8ff,#0066ff)';
                const avatarColor = isMine ? '#000' : '#fff';

                return (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexDirection: isMine ? 'row-reverse' : 'row' }}>
                    <div
                      onClick={() => {
                        if (isMine && currentUser) {
                          openUserModal(currentUser);
                        } else if (!isMine) {
                          openUserModal({
                            name: msg.senderName || currentTicket?.name || currentTicket?.userName || 'User',
                            initials: avatarInitials,
                            profilePicture: avatarSrc,
                            role: 'Customer',
                            email: currentTicket?.email || '—',
                            phone: currentTicket?.phone || '—',
                            status: currentTicket?.status || '—',
                            id: currentTicket?.userId || currentTicket?.id || '—',
                          });
                        }
                      }}
                      title={isMine ? 'View agent profile' : 'View user details'}
                      style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        background: avatarBg, overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700, color: avatarColor,
                        border: isMine ? '1.5px solid rgba(170,255,0,.35)' : '1.5px solid rgba(0,184,255,.3)',
                        boxShadow: isMine ? '0 0 8px rgba(170,255,0,.2)' : '0 0 8px rgba(0,184,255,.15)',
                        cursor: 'pointer',
                        transition: 'transform .15s, box-shadow .15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.boxShadow = isMine ? '0 0 14px rgba(170,255,0,.45)' : '0 0 14px rgba(0,184,255,.4)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = isMine ? '0 0 8px rgba(170,255,0,.2)' : '0 0 8px rgba(0,184,255,.15)'; }}
                    >
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt={avatarInitials}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                          onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                        />
                      ) : null}
                      <span style={{
                        display: avatarSrc ? 'none' : 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        width: '100%', height: '100%',
                      }}>{avatarInitials}</span>
                    </div>
                    <div>
                      <div style={{
                        maxWidth: '70%', padding: '10px 14px', borderRadius: 12,
                        fontSize: 13, lineHeight: 1.5,
                        background: isMine ? 'var(--neon-dim)' : 'var(--card2)',
                        border: `1px solid ${isMine ? 'rgba(170,255,0,.15)' : 'var(--border2)'}`,
                      }}>{msg.text}</div>
                      <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 4, textAlign: isMine ? 'left' : 'right' }}>
                        {msg.time} {isMine && <span style={{ color: 'var(--neon)' }}>✓✓</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Quick Replies */}
        <div style={{ padding: '8px 16px 0', borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            {[
              { label: '👋 Greeting',       text: 'Hello! Thank you for reaching out. How can I assist you today?' },
              { label: '🔍 Investigating',  text: 'I am currently investigating this issue and will get back to you shortly.' },
              { label: '✅ Resolved',        text: 'Your issue has been resolved. Please let us know if you need any further assistance.' },
              { label: '⬆️ Escalate',       text: 'I am escalating this ticket to a senior agent for further review.' },
              { label: '⏱️ Wait Time',      text: 'Thank you for your patience. Our estimated response time is 24 hours.' },
            ].map(qr => (
              <div key={qr.label} onClick={() => setComposeText(prev => prev ? `${prev} ${qr.text}` : qr.text)} style={{
                padding: '4px 11px', border: '1px solid var(--border2)', borderRadius: 20,
                fontSize: 11, cursor: 'pointer', color: 'var(--text2)', transition: 'all .15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--neon)'; e.currentTarget.style.color = 'var(--neon)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text2)'; }}
              >{qr.label}</div>
            ))}
          </div>
        </div>

        {/* Compose */}
        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg2)', padding: '12px 16px' }}>
          <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
            {[
              { key: 'reply', label: 'Reply' },
              { key: 'note', label: 'Note' },
            ].map(tab => (
              <div key={tab.key} onClick={() => setComposeMode(tab.key)} style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 11, fontFamily: 'var(--mono)',
                cursor: 'pointer', transition: 'all .15s',
                color: composeMode === tab.key ? 'var(--neon)' : 'var(--text3)',
                background: composeMode === tab.key ? 'var(--neon-dim)' : 'transparent',
              }}>{tab.label}</div>
            ))}
          </div>
          <div style={{
            background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 9, padding: '10px 12px',
          }}>
            <textarea value={composeText} onChange={e => setComposeText(e.target.value)} placeholder={composeMode === 'reply' ? 'Type your reply...' : 'Type an internal note...'} style={{
              background: 'none', border: 'none', outline: 'none', color: 'var(--text)',
              fontFamily: 'inherit', fontSize: 13, resize: 'none', lineHeight: 1.5,
              minHeight: 50, width: '100%', direction: 'ltr',
            }} />
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 8 }}>
              <button className={composeMode === 'reply' ? 'btn btn-neon' : 'btn btn-amber'} style={{ fontSize: 12.5, opacity: sendingMessage ? 0.6 : 1 }} onClick={handleSendReply} disabled={sendingMessage}>
                {sendingMessage ? '⏳ Sending...' : composeMode === 'reply' ? '📤 Send' : '📝 Save Note'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTEXT PANEL */}
      <div style={{ background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          {[
            { key: 'driver', label: 'Driver' },
            { key: 'ticket', label: 'Ticket' },
            { key: 'actions', label: 'Actions' },
          ].map(tab => (
            <div key={tab.key} onClick={() => setCtxTab(tab.key)} style={{
              flex: 1, padding: '10px 0', textAlign: 'center', fontSize: 11, fontFamily: 'var(--mono)',
              cursor: 'pointer', transition: 'all .15s', letterSpacing: .5,
              color: ctxTab === tab.key ? 'var(--neon)' : 'var(--text3)',
              borderBottom: `2px solid ${ctxTab === tab.key ? 'var(--neon)' : 'transparent'}`,
            }}>{tab.label}</div>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ctxTab === 'driver' && (
            <>
              <div style={{
                background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 9,
                padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center',
              }}>
                <div
                  onClick={() => currentTicket?.id && openUserModal({
                    name: currentTicket.name || currentTicket.userName || 'User',
                    initials: currentTicket.initials || 'U',
                    profilePicture: currentTicket.profilePicture || currentTicket?._raw?.profilePicture || null,
                    role: 'Customer',
                    email: currentTicket.email || '—',
                    phone: currentTicket.phone || '—',
                    status: currentTicket.status || '—',
                    id: currentTicket.userId || currentTicket.id || '—',
                  })}
                  title="View user details"
                  style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#00b8ff,#0066ff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 18, color: '#fff',
                    border: '2px solid rgba(0,184,255,.3)', boxShadow: '0 0 16px rgba(0,184,255,.2)',
                    cursor: currentTicket?.id ? 'pointer' : 'default',
                    transition: 'transform .15s, box-shadow .15s',
                  }}
                  onMouseEnter={e => { if (currentTicket?.id) { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(0,184,255,.45)'; }}}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(0,184,255,.2)'; }}
                >{currentTicket?.initials}</div>
                <div style={{ fontFamily: 'var(--head)', fontSize: 16, fontWeight: 700 }}>{currentTicket?.name || 'No user selected'}</div>
               
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, width: '100%' }}>
                  {[
                    { val: currentTicket?.status || '—', label: 'Status' },
                    { val: currentTicket?.priority || '—', label: 'Priority' },
                  ].map(c => (
                    <div key={c.label} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 8px', textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 500 }}>{c.val}</div>
                      <div style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{c.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              {[
                { label: 'Ticket ID', val: currentTicket?.id || '—' },
                { label: 'Subject', val: currentTicket?.subject || '—' },
                { label: 'Description', val: currentTicket?.description || currentTicket?._raw?.description || '—' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{row.label}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 500 }}>{row.val}</span>
                </div>
              ))}
            </>
          )}
          {ctxTab === 'ticket' && (
            <>
              {[
                { label: 'Ticket ID', val: currentTicket?.id ? currentTicket.id.slice(0,8) + '…' : '—' },
                { label: 'Status',    val: currentTicket?.status },
                { label: 'Date',      val: currentTicket?.date },
                { label: 'Time',      val: currentTicket?.time },
                { label: 'Subject',   val: currentTicket?.subject },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{row.label}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 500, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>{row.val}</span>
                </div>
              ))}
            </>
          )}
          {ctxTab === 'actions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(() => {
                const alreadyEscalated = currentTicket?.status === 'Escalated';
                const canEscalate = !!currentTicket?.id && currentTicket.id !== '—' && !alreadyEscalated && !escalating;
                return (
                  <button
                    type="button"
                    onClick={() => handleEscalate(currentTicket?.id)}
                    disabled={!canEscalate}
                    style={{
                      width: '100%',
                      border: `1px solid ${alreadyEscalated ? 'rgba(120,120,120,.2)' : 'rgba(255,180,0,.35)'}`,
                      background: alreadyEscalated ? 'var(--bg3)' : canEscalate ? 'rgba(255,180,0,.10)' : 'var(--bg3)',
                      color: alreadyEscalated ? 'var(--text3)' : canEscalate ? 'var(--amber)' : 'var(--text3)',
                      borderRadius: 7,
                      padding: '10px 12px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: canEscalate ? 'pointer' : 'not-allowed',
                      opacity: escalating ? 0.7 : 1,
                      transition: 'all .15s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    }}
                  >
                    {escalating ? (
                      <>
                        <div style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid var(--amber)', borderTop: '2px solid transparent', animation: 'spin 0.7s linear infinite' }} />
                        Escalating...
                      </>
                    ) : alreadyEscalated ? (
                      '✓ Already Escalated'
                    ) : (
                      '⬆️ Escalate Ticket'
                    )}
                  </button>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CsTicketWorkspace);
