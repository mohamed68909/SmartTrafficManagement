// STEP 5/6 DONE — CsAgent.jsx (Arabic RTL) — API-driven
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import TopBar from '../components/TopBar';
import UserDetailModal from '../components/UserDetailModal';
import useModal from '../hooks/useModal';
import * as csService from '../api/services/csService';
import * as authService from '../api/services/authService';

const CsAgent = () => {
  const showToast = useToast();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('tickets');
  const [activeTicket, setActiveTicket] = useState(0);
  const [composeMode, setComposeMode] = useState('reply');
  const [searchQuery, setSearchQuery] = useState('');
  const [agentStatus, setAgentStatus] = useState(true);
  const [ctxTab, setCtxTab] = useState('driver');

  // ── Data state (service-driven) ──
  const [tickets, setTickets] = useState([]);
  const [messages, setMessages] = useState([]);
  const [ticketsStats, setTicketsStats] = useState({});
  const [driverContext, setDriverContext] = useState(null);
  const [driverLookup, setDriverLookup] = useState(null);
  const [reports, setReports] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  const { isOpen: isUserModalOpen, selected: selectedUser, openModal: openUserModal, closeModal: closeUserModal } = useModal();

  // ── Load data from service ──
  useEffect(() => {
    const loadAll = async () => {
      setDataLoading(true);
      try {
        const [tix, stats, msgs, ctx, reps] = await Promise.all([
          csService.getTickets(),
          csService.getTicketsStats(),
          csService.getMessages(1045),
          csService.getDriverById('USR-001'),
          csService.getReports(),
        ]);
        setTickets(tix);
        setTicketsStats(stats);
        setMessages(msgs);
        setDriverContext(ctx);
        setReports(reps);
        const me = await authService.getMe();
        setCurrentUser(me || { id: 'AGT-001', name: 'Sarah Kamal', role: 'Customer support agent', email: 'cs@test.com', phone: '+20 100 111 2222', status: 'Active', date: 'January 2025', initials: 'SK' });
      } catch (err) {
        showToast('Failed to load data', 'err');
      } finally {
        setDataLoading(false);
      }
    };
    loadAll();
  }, []);

  // ── Action handlers ──
  const handleSendReply = async (ticketId, text) => {
    try { await csService.sendReply(ticketId, text); showToast('Reply sent ✓', 'ok'); } catch { showToast('Failed to send', 'err'); }
  };
  const handleSaveNote = async (ticketId, text) => {
    try { await csService.saveNote(ticketId, text); showToast('Note saved ✓', 'ok'); } catch { showToast('Failed', 'err'); }
  };
  const handleResolveTicket = async (ticketId) => {
    try { await csService.resolveTicket(ticketId); showToast('Ticket resolved ✓', 'ok'); } catch { showToast('Failed', 'err'); }
  };
  const handleEscalate = async (ticketId) => {
    try { await csService.escalateTicket(ticketId); showToast('Ticket escalated ✓', 'ok'); } catch { showToast('Failed', 'err'); }
  };
  const handleToggleAgentStatus = async () => {
    const newStatus = !agentStatus;
    try { await csService.toggleAgentStatus(newStatus); setAgentStatus(newStatus); showToast(newStatus ? 'You are connected now' : 'You are offline', 'ok'); } catch { showToast('Failed', 'err'); }
  };
  const handleSearchDrivers = async (query) => {
    try { const result = await csService.searchDrivers(query); setDriverLookup(result); } catch { showToast('Search failed', 'err'); }
  };
  const handleBlockDriver = async (id) => {
    try { await csService.blockDriver(id); showToast('Driver blocked ✓', 'ok'); } catch { showToast('Failed', 'err'); }
  };
  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  const views = [
    { key: 'tickets', label: 'Ticket list', count: tickets.length || 8, icon: '💬' },
    { key: 'my-tickets', label: 'My tickets', count: 5, icon: '👤' },
    { key: 'lookup', label: 'Search drivers', icon: '🔍' },
    { key: 'reports', label: 'Reports', icon: '📊' },
  ];

  const currentTicket = tickets[activeTicket] || {};
  const filteredTickets = tickets.filter(t =>
    t.name?.includes(searchQuery) || t.subject?.includes(searchQuery) || searchQuery === ''
  );

  return (
    <>
      <TopBar
            title={<h1 style={{fontFamily: 'Cairo, var(--head), sans-serif', fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: 700, margin: 0, color: 'var(--text)'}}>Customer Support Portal</h1>}
          onLogout={handleLogout}
          showLogout={true}
          profileUser={currentUser}
          onProfileClick={() => currentUser && openUserModal(currentUser)}
        />
      <div style={{ display: 'grid', gridTemplateRows: '52px 1fr', height: '100vh', overflow: 'hidden', direction: 'ltr', marginTop: 'clamp(52px, 6vw, 70px)' }}>
        {/* TOP NAV */}
        <div style={{
          background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', padding: '0 18px', gap: 14,
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, paddingLeft: 18, borderLeft: '1px solid var(--border)' }}>
          <div style={{
            width: 30, height: 30, background: 'var(--neon)', borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--head)', fontWeight: 800, fontSize: 18, color: '#000',
            boxShadow: '0 0 12px var(--neon-glow)',
          }}>ST</div>
          <div>
            <h2 style={{ fontFamily: 'var(--head)', fontSize: 'clamp(1.2rem,2.5vw,1.7rem)', fontWeight: 700, margin: 0, color: 'var(--text)' }}>Smart Traffic</h2>
            <div style={{ fontSize: 11, color: 'var(--neon)', fontFamily: 'var(--mono)', letterSpacing: 2 }}>Customer Support Portal</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          {views.map(v => (
            <div key={v.key} onClick={() => setActiveView(v.key)} style={{
              padding: '6px 16px', borderRadius: 6, cursor: 'pointer',
              fontSize: 13, fontWeight: 500, transition: 'all .15s',
              display: 'flex', alignItems: 'center', gap: 7,
              color: activeView === v.key ? 'var(--neon)' : 'var(--text2)',
              background: activeView === v.key ? 'var(--neon-dim)' : 'transparent',
            }}>
              {v.icon} {v.label}
              {v.count && (
                <span style={{
                  background: v.key === 'tickets' ? 'var(--red)' : 'var(--amber)',
                  color: v.key === 'tickets' ? '#fff' : '#000',
                  fontSize: 9.5, fontFamily: 'var(--mono)', padding: '1px 5px', borderRadius: 20,
                }}>{v.count}</span>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 'auto' }}>
          <div onClick={() => { setAgentStatus(!agentStatus); showToast(agentStatus ? 'Offline' : 'Connected now', agentStatus ? 'err' : 'ok'); }} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: agentStatus ? 'var(--neon-dim)' : 'var(--red-dim)',
            border: `1px solid ${agentStatus ? 'rgba(170,255,0,.2)' : 'rgba(255,45,72,.2)'}`,
            borderRadius: 20, padding: '4px 12px', cursor: 'pointer',
            fontSize: 11, fontFamily: 'var(--mono)', color: agentStatus ? 'var(--neon)' : 'var(--red)',
          }}>
            <div style={{ width: 6, height: 6, background: agentStatus ? 'var(--neon)' : 'var(--red)', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            {agentStatus ? 'Connected' : 'Offline'}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '0 8px 0 4px',
            background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 20,
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: 'linear-gradient(135deg,var(--neon),#44ff88)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, color: '#000',
            }}>SK</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Sarah Kamal</div>
              <div style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>EMP-2401</div>
            </div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
        {activeView === 'tickets' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 280px', height: '100%', overflow: 'hidden', width: '100%' }}>
            {/* TICKET LIST */}
            <div style={{ background: 'var(--bg2)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                <h3 style={{ fontFamily: 'var(--head)', fontSize: 'clamp(1.1rem,2vw,1.3rem)', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, color: 'var(--text)' }}>
                  Ticket queue
                  <button className="btn btn-neon" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => showToast('New ticket', 'ok')}>+ New</button>
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 8 }}>
                  {[
                    { val: ticketsStats?.urgent ?? 3, label: 'Urgent', color: 'var(--red)' },
                    { val: ticketsStats?.inProgress ?? 5, label: 'In progress', color: 'var(--amber)' },
                    { val: ticketsStats?.resolved ?? 12, label: 'Resolved', color: 'var(--neon)' },
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
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} type="text" placeholder="Search tickets..." style={{
                    background: 'none', border: 'none', outline: 'none', color: 'var(--text)',
                    fontFamily: 'inherit', fontSize: 12, padding: '6px 0', width: '100%', direction: 'ltr',
                  }} />
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
                {filteredTickets.map((t, i) => (
                  <div key={t.id} onClick={() => setActiveTicket(i)} style={{
                    padding: '18px 18px 14px 18px', borderBottom: '1px solid var(--border)',
                    cursor: 'pointer', transition: 'background .12s', position: 'relative',
                    background: activeTicket === i ? 'rgba(170,255,0,.06)' : 'transparent',
                    borderRight: activeTicket === i ? '2px solid var(--neon)' : 'none',
                    marginBottom: 2,
                  }}>
                    {/* Remove blue point: set to transparent for medium */}
                    <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 3, borderRadius: 0,
                      background: t.pClass === 'p-urgent' ? 'var(--red)' : t.pClass === 'p-high' ? 'var(--amber)' : t.pClass === 'p-medium' ? 'transparent' : 'var(--text3)',
                    }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>#{t.id}</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', fontWeight: 500 }}>{t.time}</span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>{t.subject}</div>
                    <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8, fontWeight: 500 }}>{t.name}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                      <span className={`badge b-${t.priority === 'عاجل' ? 'urgent' : t.priority === 'عالي' ? 'high' : t.priority === 'متوسط' ? 'medium' : 'low'}`}>{t.priority === 'عاجل' ? 'Urgent' : t.priority === 'عالي' ? 'High' : t.priority === 'متوسط' ? 'Medium' : 'Low'}</span>
                      <span className={`badge b-${t.status === 'مفتوح' ? 'open' : 'inprog'}`}>{t.status === 'مفتوح' ? 'Open' : t.status === 'منجز' ? 'Resolved' : 'In progress'}</span>
                    </div>
                    {t.unread && <div style={{ position: 'absolute', top: 18, left: 18, width: 7, height: 7, background: 'var(--neon)', borderRadius: '50%', boxShadow: '0 0 6px var(--neon-glow)' }} />}
                  </div>
                ))}
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
                    background: 'linear-gradient(135deg,#00b8ff,#0066ff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 13, color: '#fff',
                  }}>{currentTicket.initials}</div>
                  <div>
                    <h2 style={{ fontFamily: 'var(--head)', fontSize: 17, fontWeight: 700 }}>{currentTicket.name} — Ticket #{currentTicket.id}</h2>
                    <div style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>{currentTicket.subject}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 7 }}>
                  <button className="btn btn-ghost" style={{ fontSize: 11.5 }} onClick={() => showToast('Update status', 'ok')}>Update status</button>
                  <button className="btn btn-neon" style={{ fontSize: 11.5 }} onClick={() => showToast('Ticket resolved!', 'ok')}>✓ Resolve</button>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ textAlign: 'center', fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', padding: '6px 0', letterSpacing: 1.5 }}>Today — March 15, 2026</div>
                {messages.map((msg, i) => {
                  if (msg.type === 'note') {
                    return (
                      <div key={i} style={{
                        background: 'rgba(255,180,0,.06)', border: '1px solid rgba(255,180,0,.15)',
                        borderRadius: 6, padding: '10px 14px', margin: '0 18px',
                        fontSize: 12, color: 'var(--amber)', display: 'flex', gap: 8, alignItems: 'flex-start',
                      }}>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 1.5, background: 'var(--amber-dim)', color: 'var(--amber)', padding: '2px 7px', borderRadius: 3, whiteSpace: 'nowrap', flexShrink: 0 }}>Internal note</span>
                        <div>{msg.text}</div>
                      </div>
                    );
                  }
                  if (msg.type === 'system') {
                    return <div key={i} style={{ textAlign: 'center', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', padding: '4px 0' }}>{msg.text}</div>;
                  }
                  const isMine = msg.from === 'agent';
                  return (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexDirection: isMine ? 'row-reverse' : 'row' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        background: isMine ? 'linear-gradient(135deg,var(--neon),#44ff88)' : 'linear-gradient(135deg,#00b8ff,#0066ff)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700, color: isMine ? '#000' : '#fff',
                      }}>{msg.initials}</div>
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
              </div>

              {/* Quick Replies */}
              <div style={{ padding: '8px 16px 0', borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {['👋 Greeting', '🔍 Searching', '✅ Resolved', '⬆️ Escalate', '⏱️ Waiting time'].map(qr => (
                    <div key={qr} onClick={() => showToast('Quick reply inserted', 'ok')} style={{
                      padding: '4px 11px', border: '1px solid var(--border2)', borderRadius: 20,
                      fontSize: 11, cursor: 'pointer', color: 'var(--text2)', transition: 'all .15s',
                    }}>{qr}</div>
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
                  <textarea placeholder={composeMode === 'reply' ? 'Write your reply...' : 'Write an internal note...'} style={{
                    background: 'none', border: 'none', outline: 'none', color: 'var(--text)',
                    fontFamily: 'inherit', fontSize: 13, resize: 'none', lineHeight: 1.5,
                    minHeight: 50, width: '100%', direction: 'ltr',
                  }} />
                  <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 8 }}>
                    <button className={composeMode === 'reply' ? 'btn btn-neon' : 'btn btn-amber'} style={{ fontSize: 12.5 }} onClick={() => showToast('Sent', 'ok')}>
                      {composeMode === 'reply' ? '📤 Send' : '📝 Save note'}
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
                      <div style={{
                        width: 52, height: 52, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#00b8ff,#0066ff)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 18, color: '#fff',
                        border: '2px solid rgba(0,184,255,.3)', boxShadow: '0 0 16px rgba(0,184,255,.2)',
                      }}>{currentTicket.initials}</div>
                      <div style={{ fontFamily: 'var(--head)', fontSize: 16, fontWeight: 700 }}>{currentTicket.name}</div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--neon)', background: 'var(--neon-dim)', padding: '3px 10px', borderRadius: 4 }}>{driverContext?.plate || 'ABC - 2345'}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, width: '100%' }}>
                        {[
                          { val: driverContext?.rating || '—', label: 'Rating' },
                          { val: driverContext?.ticketCount || '—', label: 'Tickets' },
                        ].map(c => (
                          <div key={c.label} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 8px', textAlign: 'center' }}>
                            <div style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 500 }}>{c.val}</div>
                            <div style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{c.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {[
                      { label: 'Phone number', val: driverContext?.phone || '—' },
                      { label: 'Email', val: driverContext?.email || '—' },
                      { label: 'Subscription', val: driverContext?.subscription === 'بريميوم' ? 'Premium' : (driverContext?.subscription || '—'), cls: 'green' },
                      { label: 'Registration date', val: driverContext?.since || '—' },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{row.label}</span>
                        <span style={{ fontSize: 12.5, fontWeight: 500, color: row.cls === 'green' ? 'var(--neon)' : 'inherit' }}>{row.val}</span>
                      </div>
                    ))}
                  </>
                )}
                {ctxTab === 'ticket' && (
                  <>
                    {[
                      { label: 'Ticket ID', val: `#${currentTicket.id}` },
                      { label: 'Priority', val: currentTicket.priority === 'عاجل' ? 'Urgent' : currentTicket.priority === 'عالي' ? 'High' : currentTicket.priority === 'متوسط' ? 'Medium' : currentTicket.priority === 'منخفض' ? 'Low' : currentTicket.priority },
                      { label: 'Status', val: currentTicket.status === 'مفتوح' ? 'Open' : currentTicket.status === 'قيد المعالجة' ? 'In progress' : currentTicket.status === 'منجز' ? 'Resolved' : currentTicket.status },
                      { label: 'Created at', val: 'March 15, 2026 10:42 AM' },
                      { label: 'Assigned to', val: 'Sarah Kamal' },
                      { label: 'Department', val: 'Payments' },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{row.label}</span>
                        <span style={{ fontSize: 12.5, fontWeight: 500 }}>{row.val}</span>
                      </div>
                    ))}
                  </>
                )}
                {ctxTab === 'actions' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <button className="btn btn-neon" style={{ width: '100%', justifyContent: 'center' }} onClick={() => showToast('Ticket resolved', 'ok')}>✅ Resolve ticket</button>
                    <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => showToast('Ticket escalated', 'ok')}>⬆️ Escalate</button>
                    <button className="btn btn-amber" style={{ width: '100%', justifyContent: 'center' }} onClick={() => showToast('Ticket re-assigned', 'ok')}>🔄 Reassign</button>
                    <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }} onClick={() => showToast('Driver blocked', 'err')}>🚫 Block driver</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeView === 'lookup' ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 9, padding: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 18, color: 'var(--text3)' }}>🔍</span>
              <input type="text" placeholder="Search by name, phone number, or email..." style={{
                background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: 'inherit', fontSize: 15, flex: 1, direction: 'ltr',
              }} />
              <button className="btn btn-neon">Search</button>
            </div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 9, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'linear-gradient(135deg,var(--neon),#44ff88)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 20, color: '#000',
                }}>MH</div>
                <div>
                  <div style={{ fontFamily: 'var(--head)', fontSize: 20, fontWeight: 700, marginBottom: 2 }}>Mohamed Hassan</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--mono)', marginBottom: 6 }}>mohamed.hassan@example.com</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span className="badge b-active">Active</span>
                    <span className="badge b-completed">Premium</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Phone', val: driverLookup?.phone || '+20 112 345 6789' },
                  { label: 'Vehicle', val: driverLookup?.vehicle || 'Toyota Camry 2023' },
                  { label: 'Plate', val: driverLookup?.plate || 'ABC - 2345' },
                  { label: 'Rating', val: driverLookup?.rating || '4.8 / 5.0' },
                ].map(c => (
                  <div key={c.label} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 11px' }}>
                    <div style={{ fontSize: 9.5, color: 'var(--text3)', fontFamily: 'var(--mono)', letterSpacing: 1, marginBottom: 3 }}>{c.label}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{c.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeView === 'reports' ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              {(reports?.stats || []).map(s => (
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
              <h2 style={{ fontFamily: 'var(--head)', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Weekly tickets</h2>
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
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px 0 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: 700, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', padding: '32px 28px 24px 28px', marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'var(--head)', fontSize: 'clamp(1.2rem,2.5vw,1.7rem)', marginBottom: 24, color: 'var(--text)', textAlign: 'center', letterSpacing: 0.5 }}>Assigned tickets</h2>
              <div style={{ overflowX: 'auto', borderRadius: 8, background: 'var(--bg3)', padding: '8px 0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg2)' }}>
                      <th style={{ padding: '12px 10px', fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--text3)', fontWeight: 600 }}>#</th>
                      <th style={{ padding: '12px 10px', fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--text3)', fontWeight: 600 }}>Driver</th>
                      <th style={{ padding: '12px 10px', fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--text3)', fontWeight: 600 }}>Subject</th>
                      <th style={{ padding: '12px 10px', fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--text3)', fontWeight: 600 }}>Priority</th>
                      <th style={{ padding: '12px 10px', fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--text3)', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '12px 10px', fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--text3)', fontWeight: 600 }}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.slice(0, 5).map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ fontFamily: 'var(--mono)', color: 'var(--text3)', padding: '10px 8px', textAlign: 'center' }}>#{t.id}</td>
                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>{t.name}</td>
                        <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '10px 8px', textAlign: 'center' }}>{t.subject}</td>
                        <td style={{ padding: '10px 8px', textAlign: 'center' }}><span className={`badge b-${t.priority === 'عاجل' ? 'urgent' : t.priority === 'عالي' ? 'high' : 'medium'}`}>{t.priority === 'عاجل' ? 'Urgent' : t.priority === 'عالي' ? 'High' : 'Medium'}</span></td>
                        <td style={{ padding: '10px 8px', textAlign: 'center' }}><span className={`badge b-${t.status === 'مفتوح' ? 'open' : 'inprog'}`}>{t.status === 'مفتوح' ? 'Open' : 'In progress'}</span></td>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', padding: '10px 8px', textAlign: 'center' }}>{t.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
      <UserDetailModal open={isUserModalOpen} onClose={closeUserModal} user={selectedUser} />
    </>
  );
};

export default CsAgent;
