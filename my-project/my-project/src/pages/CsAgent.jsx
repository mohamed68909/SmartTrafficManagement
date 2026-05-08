// CsAgent page
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import TopBar from '../components/TopBar';
import UserDetailModal from '../components/UserDetailModal';
import useModal from '../hooks/useModal';
import { useTranslation } from '../i18n/LanguageContext';
import * as csService from '../api/services/csService';
import * as authService from '../api/services/authService';

const CsAgent = () => {
  const showToast = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState('tickets');
  const [activeTicket, setActiveTicket] = useState(0);
  const [composeMode, setComposeMode] = useState('reply');
  const [searchQuery, setSearchQuery] = useState('');
  const [driverQuery, setDriverQuery] = useState('');
  const [agentStatus, setAgentStatus] = useState(true);
  const [ctxTab, setCtxTab] = useState('driver');

  const [tickets, setTickets] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [messagesCache, setMessagesCache] = useState({});
  const [ticketsStats, setTicketsStats] = useState({});
  const [driverLookup, setDriverLookup] = useState(null);   
  const [driverLookupList, setDriverLookupList] = useState([]); 
  const [lookupLoading, setLookupLoading] = useState(false);
  const [reports, setReports] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [ticketSearchLoading, setTicketSearchLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const messagesEndRef = useRef(null);

  const { isOpen: isUserModalOpen, selected: selectedUser, openModal: openUserModal, closeModal: closeUserModal } = useModal();

  useEffect(() => {
    const loadAll = async () => {
      setDataLoading(true);
      try {
        const safe = (fn, fb) => fn().catch(() => fb);
        const [me, stats] = await Promise.all([
          safe(() => authService.getMe(), null),
          safe(() => csService.getTicketsStats(), {}),
        ]);

        setTickets([]);
        setTicketsStats(stats);
        setMyTickets([]);
        setReports(stats);
        setCurrentUser(csService.mapAgentProfile(me) || { id: 'AGT-001', name: 'Sarah Kamal', role: 'CS Agent', email: 'cs@test.com', phone: '+20 100 111 2222', status: 'Active', date: 'January 2025', initials: 'SK' });
      } catch {
        showToast('Failed to load data', 'err');
      } finally {
        setDataLoading(false);
      }
    };
    loadAll();
  }, []);

  // ── Action handlers ──

  const handleSelectTicket = async (index) => {
    setActiveTicket(index);
    const ticket = (activeView === 'my-tickets' ? myTickets : tickets)[index];
    if (!ticket?.id || ticket.id === '—') return;

    const tid = ticket.id;

    if (messagesCache[tid]) return;

    setChatLoading(true);
    try {
      const history = await csService.getChatHistory(tid);
      setMessagesCache(prev => ({ ...prev, [tid]: history }));
    } catch {
      setMessagesCache(prev => ({ ...prev, [tid]: [] }));
    } finally {
      setChatLoading(false);
    }
  };

  const [composeText, setComposeText] = useState('');

  const handleSendReply = async () => {
    const text = composeText.trim();
    if (!text) return;
    if (!currentTicket.id || currentTicket.id === '—') {
      showToast('Select a ticket first', 'err');
      return;
    }

    const tid = currentTicket.id;
    const msgType = composeMode === 'note' ? 2 : 1;

    const optimistic = {
      id:             `opt-${Date.now()}`,
      text,
      from:           'agent',
      type:           composeMode === 'note' ? 'note' : 'reply',
      senderName:     currentUser?.name || 'CS Agent',
      initials:       currentUser?.initials || 'CS',
      profilePicture: currentUser?.profilePicture || null,
      date:           new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time:           new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessagesCache(prev => ({ ...prev, [tid]: [...(prev[tid] || []), optimistic] }));
    setComposeText('');
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    setSendingMessage(true);
    try {
      const saved = await csService.sendChatMessage(tid, text, msgType);
      setMessagesCache(prev => ({
        ...prev,
        [tid]: (prev[tid] || []).map(m => m.id === optimistic.id ? (saved || optimistic) : m),
      }));
      showToast(composeMode === 'note' ? 'Note saved ✓' : 'Message sent ✓', 'ok');
    } catch (err) {
      // Rollback
      setMessagesCache(prev => ({
        ...prev,
        [tid]: (prev[tid] || []).filter(m => m.id !== optimistic.id),
      }));
      setComposeText(text);
      showToast(err?.message || 'Failed to send', 'err');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleEscalate = async (id) => {
    if (!id || id === '—') {
      showToast('Select a ticket first', 'err');
      return;
    }
    if (escalating) return;

    setEscalating(true);
    setTickets(prev => prev.map(t =>
      String(t.id) === String(id)
        ? { ...t, status: 'Escalated', statusNum: 2 }
        : t
    ));

    try {
      await csService.escalateTicket(id);
      const sysMsg = {
        id:   `sys-${Date.now()}`,
        type: 'system',
        text: `⬆️ Ticket escalated by ${currentUser?.name || 'CS Agent'}`,
        from: 'system',
      };
      setMessagesCache(prev => ({ ...prev, [id]: [...(prev[id] || []), sysMsg] }));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      showToast('Ticket escalated ✓', 'ok');
    } catch (err) {
      
      setTickets(prev => prev.map(t =>
        String(t.id) === String(id)
          ? { ...t, status: 'Open', statusNum: 1 }
          : t
      ));
      showToast(err?.message || 'Failed to escalate', 'err');
    } finally {
      setEscalating(false);
    }
  };

  const handleToggleAgentStatus = async () => {
    const newStatus = !agentStatus;
    try { await csService.toggleAgentStatus(newStatus); setAgentStatus(newStatus); showToast(newStatus ? 'You are now online' : 'You are now offline', 'ok'); } catch { showToast('Failed', 'err'); }
  };

  const handleSearchDrivers = async (query) => {
    if (!query.trim()) return;
    setLookupLoading(true);
    setDriverLookup(null);
    setDriverLookupList([]);
    try {
      const drivers = await csService.searchDrivers(query); 
      setDriverLookupList(drivers);
      if (drivers.length === 0) showToast('No drivers found', 'err');
    } catch { showToast('Search failed', 'err'); }
    finally { setLookupLoading(false); }
  };

  const handleBlockDriver = async (id) => {
    try {
      await csService.blockDriver(id);
      showToast('Driver blocked ✓', 'ok');
      if (driverQuery.trim()) {
        setLookupLoading(true);
        setDriverLookup(null);
        try {
          const fresh = await csService.searchDrivers(driverQuery.trim());
          setDriverLookupList(fresh);
        } catch {
          setDriverLookupList(prev =>
            prev.map(d => d.id === id ? { ...d, isActive: false } : d)
          );
        } finally {
          setLookupLoading(false);
        }
      } else {
        setDriverLookup(prev => prev ? { ...prev, isActive: false } : prev);
        setDriverLookupList(prev =>
          prev.map(d => d.id === id ? { ...d, isActive: false } : d)
        );
      }
    } catch (err) {
      showToast(err?.message || 'Failed to block driver', 'err');
    }
  };

  const handleSearchTicket = async () => {
    const query = searchQuery.trim();
    if (!query) {
      setTickets([]);
      setActiveTicket(0);
      return;
    }

    setTicketSearchLoading(true);
    try {
      const results = await csService.searchTickets(query);
      setTickets(results);
      setActiveTicket(0);
      if (results.length > 0 && results[0].id && !messagesCache[results[0].id]) {
        setChatLoading(true);
        csService.getChatHistory(results[0].id)
          .then(history => setMessagesCache(prev => ({ ...prev, [results[0].id]: history })))
          .catch(() => setMessagesCache(prev => ({ ...prev, [results[0].id]: [] })))
          .finally(() => setChatLoading(false));
      }
      if (results.length === 0) showToast('No tickets found', 'err');
    } catch (err) {
      setTickets([]);
      setActiveTicket(0);
      showToast(err?.message || 'No tickets found', 'err');
    } finally {
      setTicketSearchLoading(false);
    }
  };
  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  const views = [
    { key: 'tickets',    label: t('cs.tabs.tickets'),  count: tickets.length || null, icon: '💬' },
    { key: 'lookup',     label: t('cs.tabs.drivers'),  icon: '🔍' },
    { key: 'reports',    label: t('cs.tabs.reports'),  icon: '📊' },
  ];

  const sourceTickets = activeView === 'my-tickets' ? myTickets : tickets;
  const filteredTickets = sourceTickets;
  const currentTicket = filteredTickets[activeTicket] || {};
  const messages = messagesCache[currentTicket.id] || [];

  return (
    <>
      <TopBar
            title={<h1 style={{fontFamily: 'var(--head), sans-serif', fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: 700, margin: 0, color: 'var(--text)'}}>{t('cs.title')}</h1>}
          onLogout={handleLogout}
          showLogout={true}
          profileUser={currentUser}
          onProfileClick={() => currentUser && openUserModal(currentUser)}
          profileDirect={true}
        />
      <div style={{ display: 'grid', gridTemplateRows: '52px 1fr', height: '100vh', overflow: 'hidden', marginTop: 'clamp(52px, 6vw, 70px)' }}>
        {/* TOP NAV */}
        <div style={{
          background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', padding: '0 18px', gap: 14,
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, paddingInlineEnd: 18, borderInlineEnd: '1px solid var(--border)' }}>
          <div style={{
            width: 30, height: 30, background: 'var(--neon)', borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--head)', fontWeight: 800, fontSize: 18, color: '#000',
            boxShadow: '0 0 12px var(--neon-glow)',
          }}>ST</div>
          <div>
            <h2 style={{ fontFamily: 'var(--head)', fontSize: 'clamp(1.2rem,2.5vw,1.7rem)', fontWeight: 700, margin: 0, color: 'var(--text)' }}>Smart Traffic</h2>
            <div style={{ fontSize: 11, color: 'var(--neon)', fontFamily: 'var(--mono)', letterSpacing: 2 }}>CS PORTAL</div>
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

 
      </div>

      {/* BODY */}
      <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
        {activeView === 'tickets' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 280px', height: '100%', overflow: 'hidden', width: '100%' }}>
            {/* TICKET LIST */}
            <div style={{ background: 'var(--bg2)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                <h3 style={{ fontFamily: 'var(--head)', fontSize: 'clamp(1.1rem,2vw,1.3rem)', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, color: 'var(--text)' }}>
                  Queue
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, background: 'var(--red)', color: '#fff', padding: '2px 8px', borderRadius: 20 }}>
                    {filteredTickets.length}
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
                  }} />
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
                ) : filteredTickets.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 12 }}>
                    <div style={{ fontSize: 28, marginBottom: 10 }}>📭</div>
                    Search by ticket ID or user name
                  </div>
                ) : filteredTickets.map((t, i) => {
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
                      Ticket {currentTicket.id ? currentTicket.id.slice(0,8) + '…' : '—'}
                    </h2>
                    <div style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>{currentTicket.subject}</div>
                  </div>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}>
                {chatLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTop: '3px solid var(--neon)', animation: 'spin 0.8s linear infinite' }} />
                    Loading chat history...
                  </div>
                ) : messages.length === 0 && currentTicket.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8, color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 12 }}>
                    <div style={{ fontSize: 28 }}>💬</div>
                    No messages yet
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8, color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 12 }}>
                    <div style={{ fontSize: 28 }}>🎫</div>
                    Select a ticket to view conversation
                  </div>
                ) : (
                  <>
                    {messages.map((msg, i) => {
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
                      >{currentTicket.initials}</div>
                      <div style={{ fontFamily: 'var(--head)', fontSize: 16, fontWeight: 700 }}>{currentTicket.name || 'No user selected'}</div>
                     
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, width: '100%' }}>
                        {[
                          { val: currentTicket.status || '—', label: 'Status' },
                          { val: currentTicket.priority || '—', label: 'Priority' },
                        ].map(c => (
                          <div key={c.label} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 8px', textAlign: 'center' }}>
                            <div style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 500 }}>{c.val}</div>
                            <div style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{c.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {[
                     
                      { label: 'Ticket ID', val: currentTicket.id || '—' },
                      { label: 'Subject', val: currentTicket.subject || '—' },
                      { label: 'Description', val: currentTicket.description || currentTicket._raw?.description || '—' },
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
                      { label: 'Ticket ID', val: currentTicket.id ? currentTicket.id.slice(0,8) + '…' : '—' },
                      { label: 'Status',    val: currentTicket.status },
                      { label: 'Date',      val: currentTicket.date },
                      { label: 'Time',      val: currentTicket.time },
                      { label: 'Subject',   val: currentTicket.subject },
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
                    {/* Escalate button */}
                    {(() => {
                      const alreadyEscalated = currentTicket.status === 'Escalated';
                      const canEscalate = !!currentTicket.id && currentTicket.id !== '—' && !alreadyEscalated && !escalating;
                      return (
                        <button
                          type="button"
                          onClick={() => handleEscalate(currentTicket.id)}
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
        ) : activeView === 'lookup' ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 9, padding: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 18, color: 'var(--text3)' }}>🔍</span>
              <input
                type="text"
                placeholder="Search by name..."
                value={driverQuery}
                onChange={e => setDriverQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearchDrivers(driverQuery)}
                style={{
                  background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: 'inherit', fontSize: 15, flex: 1, direction: 'ltr',
                }} />
              <button className="btn btn-neon" onClick={() => handleSearchDrivers(driverQuery)}>Search</button>
            </div>
            {/* Loading spinner */}
            {lookupLoading && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--border)', borderTop: '3px solid var(--neon)', animation: 'spin 0.8s linear infinite' }} />
              </div>
            )}

            {/* Empty state — no search yet */}
            {!lookupLoading && driverLookupList.length === 0 && !driverLookup && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 9, padding: 40, textAlign: 'center', color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
                Search for a driver by name
              </div>
            )}

            {/* Results list */}
            {!lookupLoading && driverLookupList.length > 0 && !driverLookup && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 9, overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: 1 }}>RESULTS</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, background: 'var(--neon-dim)', color: 'var(--neon)', padding: '2px 8px', borderRadius: 20 }}>{driverLookupList.length}</span>
                </div>
                {driverLookupList.map((d, i) => (
                  <div key={d.id} onClick={() => setDriverLookup(d)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                    borderBottom: i < driverLookupList.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer', transition: 'background .12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                      background: d.isActive ? 'linear-gradient(135deg,var(--neon),#44ff88)' : 'var(--bg3)',
                      border: d.isActive ? 'none' : '1px solid var(--border2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 13, color: d.isActive ? '#000' : 'var(--text3)',
                    }}>{d.initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.email}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {d.phone !== '—' && <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{d.phone}</span>}
                      <span style={{
                        fontSize: 10, fontFamily: 'var(--mono)', padding: '2px 8px', borderRadius: 20, fontWeight: 600,
                        background: d.isActive ? 'rgba(170,255,0,.12)' : 'rgba(255,45,72,.10)',
                        color: d.isActive ? 'var(--neon)' : 'var(--red)',
                        border: `1px solid ${d.isActive ? 'rgba(170,255,0,.2)' : 'rgba(255,45,72,.2)'}`,
                      }}>{d.isActive ? 'Active' : 'Inactive'}</span>
                      <span style={{ color: 'var(--text3)', fontSize: 13 }}>›</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Driver detail card — shown after selecting from list */}
            {!lookupLoading && driverLookup && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 9, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Back button */}
                <button className="btn btn-ghost" style={{ alignSelf: 'flex-start', fontSize: 12 }} onClick={() => setDriverLookup(null)}>← Back to results</button>

                {/* Header */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                    background: driverLookup.isActive ? 'linear-gradient(135deg,var(--neon),#44ff88)' : 'var(--bg3)',
                    border: driverLookup.isActive ? 'none' : '1px solid var(--border2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 20, color: driverLookup.isActive ? '#000' : 'var(--text3)',
                  }}>{driverLookup.initials}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--head)', fontSize: 20, fontWeight: 700, marginBottom: 3 }}>{driverLookup.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)', marginBottom: 6 }}>{driverLookup.email}</div>
                    <span style={{
                      fontSize: 10, fontFamily: 'var(--mono)', padding: '3px 10px', borderRadius: 20, fontWeight: 600,
                      background: driverLookup.isActive ? 'rgba(170,255,0,.12)' : 'rgba(255,45,72,.10)',
                      color: driverLookup.isActive ? 'var(--neon)' : 'var(--red)',
                      border: `1px solid ${driverLookup.isActive ? 'rgba(170,255,0,.2)' : 'rgba(255,45,72,.2)'}`,
                    }}>{driverLookup.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>

                {/* Fields — only show what API actually returns */}
                {[
                  { label: 'Phone', val: driverLookup.phone },
                  { label: 'Email', val: driverLookup.email },
                  { label: 'Driver ID', val: driverLookup.id ? driverLookup.id.slice(0, 8).toUpperCase() + '…' : '—' },
                  { label: 'Status', val: driverLookup.isActive ? 'Active' : 'Inactive' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{row.val}</span>
                  </div>
                ))}

                <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} onClick={() => handleBlockDriver(driverLookup.id)}>
                  🚫 Block Driver
                </button>
              </div>
            )}
          </div>
        ) : activeView === 'reports' ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              {[
                { icon: '📬', label: 'Open',             val: ticketsStats?.open             ?? '—', color: 'var(--neon)',  delta: 'Currently open' },
                { icon: '🔒', label: 'Closed',           val: ticketsStats?.closed           ?? '—', color: 'var(--text2)', delta: 'Resolved tickets' },
                { icon: '⏳', label: 'Pending',          val: ticketsStats?.pending          ?? '—', color: 'var(--amber)', delta: 'Awaiting response' },
                { icon: '⚡', label: 'Avg Response (h)', val: ticketsStats?.avgResponseHours ?? '—', color: 'var(--blue)',  delta: 'Hours to first reply' },
              ].map(s => (
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
              <h2 style={{ fontFamily: 'var(--head)', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Weekly Tickets</h2>
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
          <div />
        )}
      </div>
      </div>
      <UserDetailModal open={isUserModalOpen} onClose={closeUserModal} user={selectedUser} />
    </>
  );
};

export default CsAgent;