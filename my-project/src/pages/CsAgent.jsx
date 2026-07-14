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
import signalrService from '../api/services/signalrService';
import CsTicketWorkspace from './CsAgent/CsTicketWorkspace';
import CsDriverLookup from './CsAgent/CsDriverLookup';
import CsReports from './CsAgent/CsReports';

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

  // Connect to SignalR and register message listener
  useEffect(() => {
    signalrService.startConnection();

    const onMessage = (m) => {
      const tid = m.ticketId || m.TicketId;
      const senderId = m.senderId || m.SenderId;
      const text = m.message || m.Message;

      if (senderId !== currentUser?.id) {
        const mapped = {
          id:             m.sentOnUtc || m.SentOnUtc || `msg-${Date.now()}`,
          text,
          from:           'client',
          type:           'reply',
          senderName:     'Driver',
          initials:       'DR',
          date:           new Date(m.sentOnUtc || m.SentOnUtc).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          time:           new Date(m.sentOnUtc || m.SentOnUtc).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };

        setMessagesCache(prev => {
          const currentList = prev[tid] || [];
          if (currentList.some(msg => msg.id === mapped.id)) return prev;
          return {
            ...prev,
            [tid]: [...currentList, mapped]
          };
        });

        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      }
    };

    signalrService.registerMessageListener(onMessage);

    return () => {
      signalrService.unregisterMessageListener(onMessage);
    };
  }, [currentUser]);

  // Join SignalR ticket room when current active ticket changes
  useEffect(() => {
    const currentTicket = (activeView === 'my-tickets' ? myTickets : tickets)[activeTicket] || {};
    if (currentTicket?.id && currentTicket.id !== '—') {
      signalrService.joinTicketRoom(currentTicket.id);
    }
  }, [activeTicket, tickets, myTickets, activeView]);

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
          <CsTicketWorkspace
            filteredTickets={filteredTickets}
            tickets={tickets}
            ticketsStats={ticketsStats}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearchTicket={handleSearchTicket}
            ticketSearchLoading={ticketSearchLoading}
            dataLoading={dataLoading}
            activeTicket={activeTicket}
            handleSelectTicket={handleSelectTicket}
            currentTicket={currentTicket}
            chatLoading={chatLoading}
            messages={messages}
            currentUser={currentUser}
            openUserModal={openUserModal}
            composeText={composeText}
            setComposeText={setComposeText}
            composeMode={composeMode}
            setComposeMode={setComposeMode}
            sendingMessage={sendingMessage}
            handleSendReply={handleSendReply}
            ctxTab={ctxTab}
            setCtxTab={setCtxTab}
            escalating={escalating}
            handleEscalate={handleEscalate}
            messagesEndRef={messagesEndRef}
          />
        ) : activeView === 'lookup' ? (
          <CsDriverLookup
            driverQuery={driverQuery}
            setDriverQuery={setDriverQuery}
            handleSearchDrivers={handleSearchDrivers}
            lookupLoading={lookupLoading}
            driverLookupList={driverLookupList}
            driverLookup={driverLookup}
            setDriverLookup={setDriverLookup}
            handleBlockDriver={handleBlockDriver}
          />
        ) : activeView === 'reports' ? (
          <CsReports
            ticketsStats={ticketsStats}
            reports={reports}
          />
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