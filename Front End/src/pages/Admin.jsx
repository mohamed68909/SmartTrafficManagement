// STEP 5/6 DONE — Admin.jsx (Arabic RTL) — API-driven
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import TopBar from '../components/TopBar';
import UserDetailModal from '../components/UserDetailModal';
import useModal from '../hooks/useModal';
import * as adminService from '../api/services/adminService';
import * as authService from '../api/services/authService';

/* ── Inline SVG icon components (above Admin function) ── */
const DashIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
const BarIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const CheckIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><polyline points="20 6 9 17 4 12"/></svg>;
const MapIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
const InfoIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const WarnIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const GearIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
const UserIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
const TickIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
const PhoneIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .82h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91A16 16 0 0015.09 17.9l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 18.92z"/></svg>;
const StarIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;

const Admin = () => {
  const showToast = useToast();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [clock, setClock] = useState('');

  /* ── UI STATE ── */
  const [activeUserTab, setActiveUserTab]   = useState('user');
  const [activeOpTab, setActiveOpTab]       = useState('rescue');
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [showAddUserModal, setShowAddUserModal]   = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showUrgentModal, setShowUrgentModal]     = useState(false);
  const [urgentProvider, setUrgentProvider]       = useState('');
  const [urgentNote, setUrgentNote]               = useState('');
  const [selectedUrgent, setSelectedUrgent]       = useState(null);
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);
  const [addUserForm, setAddUserForm]             = useState({ role: 'user', firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [editUserForm, setEditUserForm]           = useState({ firstName: '', lastName: '', email: '', phone: '', status: 'Active' });
  const [editingUserId, setEditingUserId]         = useState(null);
  const [addAgentForm, setAddAgentForm]           = useState({ firstName: '', lastName: '', email: '', code: '', password: '' });
  const { isOpen: isUserModalOpen, selected: selectedUser, openModal: openUserModal, closeModal: closeUserModal } = useModal();
  // eslint-disable-next-line no-unused-vars
  const [mapVisible, setMapVisible]               = useState(false);

  /* ── DATA STATE (service-driven) ── */
  const [dashboardData, setDashboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [sensors, setSensors] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [urgentRequests, setUrgentRequests] = useState([]);
  const [usersData, setUsersData] = useState({ user: [], seller: [], provider: [] });
  const [tickets, setTickets] = useState([]);
  const [csAgents, setCsAgents] = useState([]);
  const [ratingsData, setRatingsData] = useState([]);
  const [opsData, setOpsData] = useState({ rescue: [], fuel: [], products: [], returns: [] });
  const [aboutData, setAboutData] = useState(null);
  const [trafficData, setTrafficData] = useState(null);
  const [ratingsOverview, setRatingsOverview] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [approvalsStats, setApprovalsStats] = useState([]);
  const [ticketsStats, setTicketsStats] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  /* ── LOAD DATA FROM SERVICE ── */
  useEffect(() => {
    const loadAll = async () => {
      setDataLoading(true);
      try {
        const [dash, analytics, sens, approvals, urgent, usrUser, usrSeller, usrProvider,
               tix, agents, ratings, ops, about, traffic, ratOverview, notifs, aprStats, tixStats] = await Promise.all([
          adminService.getDashboard(),
          adminService.getAnalytics(),
          adminService.getSensors(),
          adminService.getApprovals(),
          adminService.getUrgent(),
          adminService.getUsers('user'),
          adminService.getUsers('seller'),
          adminService.getUsers('provider'),
          adminService.getTickets(),
          adminService.getCsAgents(),
          adminService.getRatings(),
          adminService.getOperations('all'),
          adminService.getAbout(),
          adminService.getTraffic(),
          adminService.getRatings(),
          adminService.getNotifications(),
          adminService.getApprovalsStats(),
          adminService.getTicketsStats(),
        ]);
        const me = await authService.getMe();
        setDashboardData(dash);
        setAnalyticsData(analytics);
        setSensors(sens);
        setPendingApprovals(approvals);
        setUrgentRequests(urgent);
        setUsersData({ user: usrUser, seller: usrSeller, provider: usrProvider });
        setTickets(tix);
        setCsAgents(agents);
        setRatingsData(ratings?.list || []);
        setOpsData(ops);
        setAboutData(about);
        setTrafficData(traffic);
        setRatingsOverview(ratOverview);
        setNotifications(notifs);
        setApprovalsStats(aprStats);
        setTicketsStats(tixStats);
        setCurrentUser(me || {
          id: 'ADM-001',
          name: 'System Admin',
          role: 'System Administrator',
          email: 'admin@smarttraffic.io',
          phone: '+20 100 111 2222',
          status: 'Active',
          date: 'January 2025',
          orders: '—',
          initials: 'AD',
          avatarGrad: 'linear-gradient(135deg,var(--neon),#2eff80)',
          avatarColor: '#000',
          notes: 'This information belongs to the current admin account.',
        });
      } catch (err) {
        showToast('Failed to load data', 'err');
      } finally {
        setDataLoading(false);
      }
    };
    loadAll();
  }, []);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-US'));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* ── ACTION HANDLERS ── */
  const handleApprove = async (id) => {
    try { await adminService.approveApplication(id); showToast('Approved ✓', 'ok'); } catch { showToast('Failed', 'err'); }
  };
  const handleReviewDocs = async (id) => {
    try { await adminService.reviewDocs(id); showToast('Loading documents...', 'ok'); } catch { showToast('Failed to load documents', 'err'); }
  };
  const handleReject = async (id) => {
    try { await adminService.rejectApplication(id); showToast('Rejected', 'ok'); } catch { showToast('Failed', 'err'); }
  };
  const handleTrackUrgent = async (id) => {
    try { await adminService.trackUrgent(id); showToast('Tracking request...', 'ok'); } catch { showToast('Tracking failed', 'err'); }
  };
  const handleViewTicket = async (id) => {
    try { await adminService.getTicketById(id); showToast(`Viewing ticket ${id}`, 'ok'); } catch { showToast('Failed to load ticket details', 'err'); }
  };
  const handleAddUser = async (data) => {
    try { await adminService.addUser(data); showToast('User created ✓', 'ok'); setShowAddUserModal(false); setAddUserForm({ role: 'user', firstName: '', lastName: '', email: '', phone: '', password: '' }); } catch { showToast('Failed', 'err'); }
  };
  const handleEditUser = async (id, data) => {
    try { await adminService.editUser(id, data); showToast('Saved ✓', 'ok'); setShowEditUserModal(false); setEditingUserId(null); setEditUserForm({ firstName: '', lastName: '', email: '', phone: '', status: 'Active' }); } catch { showToast('Failed', 'err'); }
  };
  const handleAssignUrgent = async (id, providerId, note) => {
    try { await adminService.assignUrgent(id, providerId, note); showToast('Assigned ✓', 'ok'); setShowUrgentModal(false); } catch { showToast('Failed', 'err'); }
  };
  const handleConfirmUrgentAssign = async () => {
    if (!selectedUrgent) return;
    if (!urgentProvider) { showToast('Please select a provider first', 'err'); return; }
    await handleAssignUrgent(selectedUrgent.id, urgentProvider, urgentNote);
    setSelectedUrgent(null);
    setUrgentProvider('');
    setUrgentNote('');
  };
  const handleViewUrgent = async (id) => {
    try { await adminService.trackUrgent(id); showToast(`Viewing request ${id}`, 'ok'); } catch { showToast('Failed to view request status', 'err'); }
  };
  const openEditUser = (user) => {
    setEditingUserId(user.id);
    const [firstName, ...lastNameParts] = (user.name || '').split(' ');
    setEditUserForm({
      firstName: firstName || '',
      lastName: lastNameParts.join(' ') || '',
      email: user.email || '',
      phone: user.phone || '',
      status: user.status || 'Active',
    });
    setShowEditUserModal(true);
  };
  const handleAddAgent = async (data) => {
    try { await adminService.addCsAgent(data); showToast('Agent created ✓', 'ok'); setShowAddAgentModal(false); setAddAgentForm({ firstName: '', lastName: '', email: '', code: '', password: '' }); } catch { showToast('Failed', 'err'); }
  };
  const handleActivateAgent = async (id) => {
    try { await adminService.activateCsAgent(id); showToast('Activated', 'ok'); } catch { showToast('Failed', 'err'); }
  };
  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  /* ── SIDEBAR ITEMS ── */
  const sidebarItems = [
    { key: 'dashboard',  label: 'Dashboard',        icon: <DashIcon /> },
    { key: 'analytics',  label: 'Analytics',         icon: <BarIcon />  },
    { key: 'approvals',  label: 'Approvals',         icon: <CheckIcon />, badge: pendingApprovals.length || 8, badgeColor: 'var(--amber)' },
    { key: 'traffic',    label: 'Traffic Map',       icon: <MapIcon />  },
    { key: 'about',      label: 'System Info',       icon: <InfoIcon /> },
    { key: 'urgent',     label: 'Urgent Requests',   icon: <WarnIcon />, badge: urgentRequests.length || 3, badgeColor: 'var(--red)' },
    { key: 'operations', label: 'Operations',        icon: <GearIcon /> },
    { key: 'users',      label: 'Users',             icon: <UserIcon />, badge: '4.8K' },
    { key: 'tickets',    label: 'Support Tickets',   icon: <TickIcon />, badge: tickets.length || 5 },
    { key: 'cs',         label: 'CS Agents',         icon: <PhoneIcon />},
    { key: 'ratings',    label: 'Ratings',            icon: <StarIcon /> },
  ];


  /* ── MODAL STYLES ── */
  const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(4,7,12,0.88)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
  const modalStyle   = { background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 12, width: 480, maxWidth: '90vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' };
  const mHeadStyle   = { padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' };
  const mBodyStyle   = { padding: '18px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 };
  const mFootStyle   = { padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 };
  const inpStyle     = { width: '100%', background: 'var(--input-bg, var(--bg3))', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 13, padding: '8px 12px', outline: 'none', direction: 'ltr', boxSizing: 'border-box' };
  const lblStyle     = { fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 };
  const btnPrimary   = { padding: '8px 20px', borderRadius: 8, background: 'var(--neon)', color: '#000', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)' };
  const btnGhost     = { padding: '8px 20px', borderRadius: 8, background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)' };

  return (
    <>
      <TopBar
          title={<h1 style={{fontFamily: 'Cairo, var(--head), sans-serif', fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: 700, margin: 0, color: 'var(--text)'}}>Admin Dashboard</h1>}
        onLogout={handleLogout}
        showLogout={true}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', height: '100vh', overflow: 'hidden', direction: 'ltr', marginTop: 'clamp(52px, 6vw, 70px)' }}>
        {/* SIDEBAR */}
        <aside style={{
          background: 'var(--bg2)', borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 38, height: 38, background: 'var(--neon)', borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--head)', fontSize: 20, color: '#000',
              boxShadow: '0 0 18px var(--neon-glow)',
            }}>AD</div>
            <div>
              <div style={{ fontFamily: 'var(--head)', fontSize: 17 }}>SmartTraffic</div>
              <div style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--neon)', letterSpacing: 2 }}>ADMIN PANEL</div>
            </div>
          </div>

          <div style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
            {sidebarItems.map(item => (
              <div key={item.key} onClick={() => setActiveView(item.key)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                borderRadius: 7, cursor: 'pointer', transition: 'all .15s', position: 'relative',
                background: activeView === item.key ? 'var(--neon-dim)' : 'transparent',
                color: activeView === item.key ? 'var(--neon)' : 'var(--text2)',
              }}>
                <span style={{ fontSize: 18, display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{
                    background: item.badgeColor || 'var(--border2)',
                    color: item.badgeColor ? '#000' : 'var(--text3)',
                    fontSize: 9.5, fontFamily: 'var(--mono)', padding: '1px 7px', borderRadius: 20,
                  }}>{item.badge}</span>
                )}
                {activeView === item.key && <div style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  width: 3, height: '60%', background: 'var(--neon)', borderRadius: '0 2px 2px 0',
                }} />}
              </div>
            ))}
          </div>

          <div style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: 'var(--bg3)', borderRadius: 8 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'linear-gradient(135deg,var(--red),var(--amber))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 11, color: '#fff',
              }}>AD</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>System Admin</div>
                <div style={{ fontSize: 9, color: 'var(--neon)', fontFamily: 'var(--mono)' }}>ADMIN-001</div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* TOPBAR */}
          <div style={{
            height: 54, minHeight: 54, background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', padding: '0 20px', gap: 14,
            position: 'relative',
          }}>
            <h1 style={{ fontFamily: 'var(--head)', fontSize: 20, letterSpacing: .5, flex: 1, margin: 0 }}>
              {sidebarItems.find(s => s.key === activeView)?.label}
            </h1>

            {/* Notification Bell */}
            <div
              onClick={() => { setShowNotifPanel(p => !p); setShowProfilePanel(false); }}
              style={{
                width: 36, height: 36, borderRadius: 7,
                background: 'var(--bg3)', border: '1px solid var(--border2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', position: 'relative', flexShrink: 0,
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ color: 'var(--text2)' }}>
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              <div style={{
                position: 'absolute', top: 5, right: 5,
                width: 7, height: 7, background: 'var(--red)',
                borderRadius: '50%', border: '1.5px solid var(--bg2)',
              }} />
            </div>

            {/* Profile Avatar */}
            <div
              onClick={() => { setShowProfilePanel(p => !p); setShowNotifPanel(false); }}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg,var(--neon),#2eff80)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 13, color: '#000',
                cursor: 'pointer', flexShrink: 0,
              }}
            >AD</div>

            <button onClick={handleLogout} style={{
              padding: '8px 14px', borderRadius: 8, border: 'none',
              background: 'var(--red-dim)', color: 'var(--red)',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              flexShrink: 0,
            }}>🚪 Logout</button>

            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{clock}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'var(--neon-dim)', border: '1px solid rgba(170,255,0,.2)', borderRadius: 20, fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--neon)' }}>
              <div style={{ width: 6, height: 6, background: 'var(--neon)', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
              All Systems Operational
            </div>

            {/* Notification Panel */}
            {showNotifPanel && (
              <div style={{
                position: 'absolute', top: 62, right: 60,
                width: 320, background: 'var(--card2)',
                border: '1px solid var(--border2)', borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 200, overflow: 'hidden',
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Notifications</span>
                  <span style={{ fontSize: 10, fontFamily: 'var(--mono)', background: 'var(--red)', color: '#fff', padding: '2px 6px', borderRadius: 10 }}>{notifications.length}</span>
                </div>
                {(notifications || []).map((n, i) => (
                  <div key={i} onClick={() => { showToast(n.title, 'ok'); setShowNotifPanel(false); }} style={{
                    padding: '10px 16px', borderBottom: '1px solid var(--border)',
                    display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer',
                  }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: n.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{n.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.3 }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{n.sub}</div>
                      <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', marginTop: 3 }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Profile Panel */}
            {showProfilePanel && (
              <div style={{
                position: 'absolute', top: 62, right: 20,
                width: 220, background: 'var(--card2)',
                border: '1px solid var(--border2)', borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 200, overflow: 'hidden',
              }}>
                <div style={{ padding: 16, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,var(--neon),#2eff80)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, color: '#000', flexShrink: 0 }}>AD</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>System Admin</div>
                    <div style={{ fontSize: 10.5, color: 'var(--text3)' }}>Administrator</div>
                  </div>
                </div>
                {[
                  { label: 'Profile', msg: 'Open profile' },
                ].map((item, i) => (
                  <div key={i} onClick={() => {
                    if (item.label === 'Profile') {
                      if (currentUser) {
                        openUserModal(currentUser);
                      } else {
                        showToast('Could not load profile', 'err');
                      }
                    } else {
                      showToast(item.msg, 'ok');
                    }
                    setShowProfilePanel(false);
                  }} style={{
                    padding: '9px 16px', fontSize: 12.5, color: 'var(--text2)', cursor: 'pointer',
                  }}>{item.label}</div>
                ))}
                <div onClick={async () => { await authService.logout(); setShowProfilePanel(false); window.location.href = '/'; }} style={{
                  padding: '9px 16px', fontSize: 12.5, color: 'var(--red)', cursor: 'pointer',
                  borderTop: '1px solid var(--border)',
                }}>Sign Out</div>
              </div>
            )}
          </div>

          {/* CONTENT */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ── DASHBOARD ── */}
            {activeView === 'dashboard' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                  {(dashboardData?.stats || []).map(s => (
                    <div key={s.label} style={{
                      background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px',
                      transition: 'all .18s', cursor: 'default',
                    }}>
                      <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
                      <div style={{ fontSize: 9.5, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontFamily: 'var(--head)', fontSize: 28, letterSpacing: 1, lineHeight: 1, color: s.color, marginBottom: 4 }}>{s.val}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.delta}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
                  {/* Traffic Overview */}
                  <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h2 style={{ fontFamily: 'var(--head)', fontSize: 16, margin: 0 }}>🗺️ Traffic Overview</h2>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {['Cairo', 'Giza', 'Regional'].map(r => (
                          <span key={r} style={{
                            padding: '3px 10px', borderRadius: 4, fontSize: 10, fontFamily: 'var(--mono)',
                            border: '1px solid var(--border)', color: 'var(--text3)', cursor: 'pointer',
                          }}>{r}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{
                      height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative', overflow: 'hidden', background: 'var(--bg3)',
                      backgroundImage: 'linear-gradient(rgba(170,255,0,.02) 1px,transparent 1px), linear-gradient(90deg,rgba(170,255,0,.02) 1px,transparent 1px)',
                      backgroundSize: '20px 20px',
                    }}>
                      {(dashboardData?.trafficMap || []).map((m, i) => (
                        <div key={i} style={{
                          position: 'absolute', top: m.top, left: m.left,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer',
                        }} title={`${m.label}: ${m.density}% density`}>
                          <div style={{
                            width: 12, height: 12, borderRadius: '50%', background: m.color,
                            boxShadow: `0 0 10px ${m.color}`, animation: 'pulse 2s infinite',
                          }} />
                          <span style={{ fontSize: 8, fontFamily: 'var(--mono)', color: m.color, marginTop: 3 }}>{m.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* System Status */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                      <h2 style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 16, margin: 0 }}>⚙️ System Status</h2>
                      {(dashboardData?.systemStatus || []).map((s, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                          <span style={{ flex: 1, fontSize: 13 }}>{s.name}</span>
                          <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: s.color }}>{s.status}</span>
                          <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{s.uptime}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{
                      background: 'var(--neon-faint)', border: '1px solid rgba(170,255,0,.12)',
                      borderRadius: 10, padding: '14px 16px',
                    }}>
                      <div style={{ fontSize: 9.5, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 6 }}>PENDING APPROVALS</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontFamily: 'var(--head)', fontSize: 36, color: 'var(--amber)', lineHeight: 1 }}>{pendingApprovals.length}</span>
                        <span style={{ fontSize: 12, color: 'var(--text2)' }}>applications pending review</span>
                      </div>
                      <button className="btn btn-neon btn-sm" style={{ marginTop: 10, width: '100%', justifyContent: 'center' }} onClick={() => setActiveView('approvals')}>Review Now</button>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  <h2 style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 16, margin: 0 }}>📋 Recent Activity</h2>
                  {(dashboardData?.recentActivity || []).map((a, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background .12s' }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{a.icon}</div>
                      <div style={{ flex: 1, fontSize: 13 }}>{a.text}</div>
                      <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', whiteSpace: 'nowrap' }}>{a.time}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── ANALYTICS (5A) ── */}
            {activeView === 'analytics' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Analytics <span style={{ color: 'var(--neon)' }}>& Statistics</span></h2>
                    <div style={{ fontSize: 11.5, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 3 }}>Monthly and weekly performance data</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                  {(analyticsData?.stats || []).map(s => (
                    <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
                      <div style={{ fontSize: 9.5, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontFamily: 'var(--head)', fontSize: 26, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.val}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.delta}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  <h2 style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 16, margin: 0 }}>📈 Monthly Orders — 2025</h2>
                  <div style={{ padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160 }}>
                      {(analyticsData?.monthlyChart || []).map(d => {
                        const max = Math.max(...(analyticsData?.monthlyChart || []).map(x => x.v), 1);
                        return (
                          <div key={d.m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                            <span style={{ fontSize: 8, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{(d.v/1000).toFixed(0)}K</span>
                            <div style={{ width: '100%', height: `${(d.v/max)*100}%`, borderRadius: '3px 3px 0 0', background: 'var(--neon)', opacity: (d.v/max)*0.5+0.5, minHeight: 3 }} />
                            <span style={{ fontSize: 8, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{d.m.slice(0,3)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontFamily: 'var(--head)', fontSize: 16, margin: 0 }}>User Activity Trend</h2>
                    <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', border: '1px solid var(--border)', padding: '3px 10px', borderRadius: 20 }}>7 days</span>
                  </div>
                  <div style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
                      {(analyticsData?.userActivity || [55,72,60,88,75,95,82]).map((h, i) => (
                        <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: '3px 3px 0 0', background: `rgba(0,170,255,${0.4+h/200})`, minHeight: 4 }} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                      {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                        <div key={d} style={{ flex: 1, textAlign: 'center', fontSize: 8, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{d}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── APPROVALS (existing) ── */}
            {activeView === 'approvals' && (
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
                  {pendingApprovals.map(a => (
                    <div key={a.id} style={{
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
                          <span>📋 {a.type}</span>
                          <span>🔧 {a.service}</span>
                          <span>📄 {a.docs} docs</span>
                          <span>📅 {a.date}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <button className="btn btn-neon" onClick={() => handleApprove(a.id)}>✅ Approve</button>
                        <button className="btn btn-ghost" onClick={() => handleReviewDocs(a.id)}>📄 Review</button>
                        <button className="btn btn-danger" onClick={() => handleReject(a.id)}>❌ Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── TRAFFIC (existing) ── */}
            {activeView === 'traffic' && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontFamily: 'var(--head)', fontSize: 18, margin: 0 }}>🗺️ Live Traffic Map</h2>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span className="badge b-active">🟢 Clear: 4</span>
                    <span className="badge b-high">🟡 Moderate: 2</span>
                    <span className="badge b-urgent">🔴 Heavy: 1</span>
                  </div>
                </div>
                <div style={{
                  height: 450, position: 'relative', overflow: 'hidden', background: 'var(--bg3)',
                  backgroundImage: 'linear-gradient(rgba(170,255,0,.02) 1px,transparent 1px), linear-gradient(90deg,rgba(170,255,0,.02) 1px,transparent 1px)',
                  backgroundSize: '30px 30px',
                }}>
                  <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                    <line x1="10%" y1="30%" x2="90%" y2="30%" stroke="rgba(170,255,0,.15)" strokeWidth="3" />
                    <line x1="10%" y1="60%" x2="90%" y2="60%" stroke="rgba(170,255,0,.15)" strokeWidth="3" />
                    <line x1="30%" y1="10%" x2="30%" y2="90%" stroke="rgba(170,255,0,.15)" strokeWidth="2" />
                    <line x1="60%" y1="10%" x2="60%" y2="90%" stroke="rgba(170,255,0,.15)" strokeWidth="2" />
                    <line x1="15%" y1="15%" x2="85%" y2="85%" stroke="rgba(255,45,72,.2)" strokeWidth="3" strokeDasharray="8,4" />
                  </svg>
                  {(trafficData?.markers || []).map((m, i) => (
                    <div key={i} style={{
                      position: 'absolute', top: m.top, left: m.left,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', zIndex: 2,
                    }}>
                      <div style={{
                        width: m.size, height: m.size, borderRadius: '50%', background: m.color,
                        boxShadow: `0 0 ${m.size}px ${m.color}`, animation: m.color !== 'var(--text3)' ? 'pulse 2s infinite' : 'none',
                      }} />
                      <span style={{ fontSize: 9, fontFamily: 'var(--mono)', color: m.color, marginTop: 4, whiteSpace: 'nowrap', background: 'rgba(4,6,8,.7)', padding: '1px 5px', borderRadius: 3 }}>{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── ABOUT (5B) ── */}
            {activeView === 'about' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>About <span style={{ color: 'var(--neon)' }}>System</span> & Event Log</h2>
                    <div style={{ fontSize: 11.5, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 3 }}>Technical information, platform stats & full event log</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                  {(aboutData?.cards || []).map((c, i) => (
                    <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', marginBottom: 4 }}>{c.title}</div>
                      <div style={{ fontFamily: 'var(--head)', fontSize: 22, color: c.valColor, marginBottom: 4 }}>{c.val}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{c.sub}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  <h2 style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 16, margin: 0 }}>⏱ Full Event Log</h2>
                  {(aboutData?.eventLog || []).map((ev, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: ev.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{ev.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{ev.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{ev.sub}</div>
                      </div>
                      <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', whiteSpace: 'nowrap' }}>{ev.time}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  <h2 style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 16, margin: 0 }}>Technical Information</h2>
                  <div style={{ padding: 16 }}>
                    {(aboutData?.techInfo || []).map((r, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                        <span style={{ color: 'var(--text3)', fontSize: 12 }}>{r.label}</span>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: r.color }}>{r.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── URGENT (5C) ── */}
            {activeView === 'urgent' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Urgent <span style={{ color: 'var(--neon)' }}>Requests</span></h2>
                    <div style={{ fontSize: 11.5, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 3 }}>Cases requiring immediate action</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--neon-dim)', border: '1px solid rgba(170,255,0,.22)', borderRadius: 20, padding: '3px 11px', fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--neon)' }}>
                    <div style={{ width: 6, height: 6, background: 'var(--neon)', borderRadius: '50%', animation: 'pulse 1.8s infinite' }} />
                    LIVE
                  </div>
                </div>

                <div style={{ background: 'var(--card)', border: '1px solid rgba(255,61,87,.3)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <WarnIcon />
                    <span style={{ color: 'var(--red)', fontWeight: 700 }}>3 Active Urgent Requests</span>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg3)' }}>
                          {['#', 'User', 'Request Type', 'Location', 'Wait Time', 'Status', 'Action'].map(h => (
                            <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'left', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {urgentRequests.map((r, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i === 0 ? 'rgba(255,61,87,.03)' : 'transparent' }}>
                            <td style={{ padding: '12px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{r.id}</td>
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{r.initials}</div>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
                                  <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{r.phone}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '12px 14px', color: 'var(--red)', fontWeight: 700, fontSize: 13 }}>{r.type}</td>
                            <td style={{ padding: '12px 14px', fontSize: 11.5 }}>{r.location}</td>
                            <td style={{ padding: '12px 14px', fontFamily: 'var(--mono)', fontWeight: 700, color: r.waitColor }}>{r.wait}</td>
                            <td style={{ padding: '12px 14px' }}>
                              <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'var(--mono)', background: r.statusColor === 'var(--amber)' ? 'var(--yellow-dim)' : 'var(--neon-dim)', color: r.statusColor, border: `1px solid ${r.statusColor}40` }}>{r.status}</span>
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              {r.action === 'assign' && (
                                <button onClick={() => { setSelectedUrgent(r); setUrgentProvider(''); setUrgentNote(''); setShowUrgentModal(true); }} style={{ padding: '5px 12px', borderRadius: 6, background: 'var(--neon)', color: '#000', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Assign Provider</button>
                              )}
                              {r.action === 'track' && (
                                <button onClick={() => handleTrackUrgent(r.id)} style={{ padding: '5px 12px', borderRadius: 6, background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)', fontSize: 12, cursor: 'pointer' }}>Track</button>
                              )}
                              {r.action === 'view' && (
                                <button onClick={() => handleViewUrgent(r.id)} style={{ padding: '5px 12px', borderRadius: 6, background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)', fontSize: 12, cursor: 'pointer' }}>View</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* ── OPERATIONS (5E — upgraded with 4 tabs) ── */}
            {activeView === 'operations' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Live <span style={{ color: 'var(--neon)' }}>Operations</span></h2>
                    <div style={{ fontSize: 11.5, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 3 }}>Active requests, shipments and returns</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                  {(opsData?.stats || []).map(s => (
                    <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
                      <div style={{ fontSize: 9.5, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontFamily: 'var(--head)', fontSize: 28, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.val}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.delta}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', gap: 6, padding: '12px 16px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                    {[
                      { key: 'rescue',   label: '🚗 Rescue' },
                      { key: 'fuel',     label: '⛽ Fuel' },
                      { key: 'products', label: '📦 Products' },
                      { key: 'returns',  label: '🔄 Returns' },
                    ].map(tab => (
                      <div key={tab.key} onClick={() => setActiveOpTab(tab.key)} style={{
                        padding: '5px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                        background: activeOpTab === tab.key ? 'var(--neon-dim)' : 'transparent',
                        color: activeOpTab === tab.key ? 'var(--neon)' : 'var(--text3)',
                        border: `1px solid ${activeOpTab === tab.key ? 'rgba(170,255,0,.3)' : 'var(--border)'}`,
                      }}>{tab.label}</div>
                    ))}
                  </div>

                  {activeOpTab === 'rescue' && (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ background: 'var(--bg3)' }}>
                          {['#', 'User', 'Issue Type', 'Provider', 'Location', 'Status', 'Time'].map(h => (
                            <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'left', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>
                          {opsData.rescue.map((r, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{r.id}</td>
                              <td style={{ padding: '11px 14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{r.initials}</div>
                                  <span style={{ fontSize: 13 }}>{r.user}</span>
                                </div>
                              </td>
                              <td style={{ padding: '11px 14px', color: 'var(--red)', fontWeight: 700, fontSize: 12 }}>{r.type}</td>
                              <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text2)' }}>{r.provider}</td>
                              <td style={{ padding: '11px 14px', fontSize: 11.5 }}>{r.location}</td>
                              <td style={{ padding: '11px 14px' }}>
                                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'var(--mono)', background: r.status === 'Completed' ? 'var(--neon-dim)' : r.status === 'En Route' ? 'var(--yellow-dim)' : 'var(--red-dim)', color: r.status === 'Completed' ? 'var(--neon)' : r.status === 'En Route' ? 'var(--yellow)' : 'var(--red)' }}>{r.status}</span>
                              </td>
                              <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{r.time}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeOpTab === 'fuel' && (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ background: 'var(--bg3)' }}>
                          {['#', 'User', 'Quantity', 'Provider', 'Location', 'Status', 'Time'].map(h => (
                            <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'left', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>
                          {opsData.fuel.map((r, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{r.id}</td>
                              <td style={{ padding: '11px 14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{r.initials}</div>
                                  <span style={{ fontSize: 13 }}>{r.user}</span>
                                </div>
                              </td>
                              <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--yellow)' }}>{r.liters}</td>
                              <td style={{ padding: '11px 14px', fontSize: 12 }}>{r.provider}</td>
                              <td style={{ padding: '11px 14px', fontSize: 11.5 }}>{r.location}</td>
                              <td style={{ padding: '11px 14px' }}>
                                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'var(--mono)', background: r.status === 'En Route' ? 'var(--yellow-dim)' : 'var(--red-dim)', color: r.status === 'En Route' ? 'var(--yellow)' : 'var(--red)' }}>{r.status}</span>
                              </td>
                              <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{r.time}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeOpTab === 'products' && (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ background: 'var(--bg3)' }}>
                          {['#', 'Seller', 'Product', 'Quantity', 'Buyer', 'Status', 'ETA'].map(h => (
                            <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'left', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>
                          {opsData.products.map((r, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{r.id}</td>
                              <td style={{ padding: '11px 14px', fontSize: 13 }}>{r.seller}</td>
                              <td style={{ padding: '11px 14px', fontSize: 12 }}>{r.item}</td>
                              <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--blue)' }}>{r.qty}</td>
                              <td style={{ padding: '11px 14px', fontSize: 12 }}>{r.buyer}</td>
                              <td style={{ padding: '11px 14px' }}>
                                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'var(--mono)', background: r.status === 'En Route' ? 'var(--yellow-dim)' : 'var(--neon-dim)', color: r.status === 'En Route' ? 'var(--yellow)' : 'var(--neon)' }}>{r.status}</span>
                              </td>
                              <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{r.eta}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeOpTab === 'returns' && (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ background: 'var(--bg3)' }}>
                          {['#', 'User', 'Product', 'Amount', 'Status', 'Date'].map(h => (
                            <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'left', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>
                          {opsData.returns.map((r, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{r.id}</td>
                              <td style={{ padding: '11px 14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{r.initials}</div>
                                  <span style={{ fontSize: 13 }}>{r.user}</span>
                                </div>
                              </td>
                              <td style={{ padding: '11px 14px', fontSize: 12 }}>{r.item}</td>
                              <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--yellow)' }}>{r.amount}</td>
                              <td style={{ padding: '11px 14px' }}>
                                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'var(--mono)', background: r.status === 'Returned' ? 'var(--neon-dim)' : 'var(--yellow-dim)', color: r.status === 'Returned' ? 'var(--neon)' : 'var(--yellow)' }}>{r.status}</span>
                              </td>
                              <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{r.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── USERS (5D — upgraded with 3 tabs) ── */}
            {activeView === 'users' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>User <span style={{ color: 'var(--neon)' }}>Management</span></h2>
                    <div style={{ fontSize: 11.5, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 3 }}>Users · Sellers · Providers</div>
                  </div>
                  <button onClick={() => setShowAddUserModal(true)} style={{
                    padding: '8px 18px', borderRadius: 8, background: 'var(--neon)', color: '#000',
                    border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)',
                  }}>+ Add User</button>
                </div>

                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 16px' }}>
                    {[
                      { key: 'user',     label: 'Users',    count: usersData.user.length },
                      { key: 'seller',   label: 'Sellers',  count: usersData.seller.length },
                      { key: 'provider', label: 'Providers', count: usersData.provider.length },
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
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ background: 'var(--bg3)' }}>
                          {['ID', 'User', 'Email', 'Phone', 'Status', 'Joined', 'Orders', 'Action'].map(h => (
                            <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'left', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>
                          {usersData.user.map((u, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{u.id}</td>
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
                              <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text2)' }}>{u.email}</td>
                              <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{u.phone}</td>
                              <td style={{ padding: '11px 14px' }}>
                                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'var(--mono)', background: u.status === 'Active' ? 'var(--neon-dim)' : u.status === 'Pending' ? 'var(--yellow-dim)' : 'var(--red-dim)', color: u.status === 'Active' ? 'var(--neon)' : u.status === 'Pending' ? 'var(--yellow)' : 'var(--red)' }}>{u.status}</span>
                              </td>
                              <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{u.date}</td>
                              <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--neon)' }}>{u.orders}</td>
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
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ background: 'var(--bg3)' }}>
                          {['ID', 'Store', 'Email', 'Phone', 'Status', 'Joined', 'Orders', 'Action'].map(h => (
                            <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'left', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>
                          {usersData.seller.map((u, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{u.id}</td>
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
                              <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text2)' }}>{u.email}</td>
                              <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{u.phone}</td>
                              <td style={{ padding: '11px 14px' }}>
                                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'var(--mono)', background: u.status === 'Active' ? 'var(--neon-dim)' : 'var(--yellow-dim)', color: u.status === 'Active' ? 'var(--neon)' : 'var(--yellow)' }}>{u.status}</span>
                              </td>
                              <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{u.date}</td>
                              <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--blue)' }}>{u.orders}</td>
                              <td style={{ padding: '11px 14px' }}>
                                <button onClick={() => openUserModal(u)} style={{ padding: '4px 10px', borderRadius: 5, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', fontSize: 11, cursor: 'pointer' }}>View</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeUserTab === 'provider' && (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ background: 'var(--bg3)' }}>
                          {['ID', 'Provider', 'Email', 'Phone', 'Status', 'Rating', 'Action'].map(h => (
                            <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'left', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>
                          {usersData.provider.map((u, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{u.id}</td>
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
                              <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text2)' }}>{u.email}</td>
                              <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{u.phone}</td>
                              <td style={{ padding: '11px 14px' }}>
                                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'var(--mono)', background: u.status === 'Active' ? 'var(--neon-dim)' : 'var(--yellow-dim)', color: u.status === 'Active' ? 'var(--neon)' : 'var(--yellow)' }}>{u.status}</span>
                              </td>
                              <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--yellow)' }}>★ {u.rating}</td>
                              <td style={{ padding: '11px 14px' }}>
                                <button onClick={() => openUserModal(u)} style={{ padding: '4px 10px', borderRadius: 5, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', fontSize: 11, cursor: 'pointer' }}>View</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── TICKETS (5F) ── */}
            {activeView === 'tickets' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Support <span style={{ color: 'var(--neon)' }}>Tickets</span></h2>
                    <div style={{ fontSize: 11.5, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 3 }}>Help requests from users</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                  {(ticketsStats || []).map(s => (
                    <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
                      <div style={{ fontSize: 9.5, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontFamily: 'var(--head)', fontSize: 30, color: s.color, lineHeight: 1 }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead><tr style={{ background: 'var(--bg3)' }}>
                        {['#', 'Subject', 'User', 'Agent', 'Status', 'Date', 'Action'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'left', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {tickets.map((t, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{t.id}</td>
                            <td style={{ padding: '11px 14px', fontSize: 12.5, maxWidth: 180 }}>{t.subject}</td>
                            <td style={{ padding: '11px 14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{t.initials}</div>
                                <span style={{ fontSize: 13 }}>{t.user}</span>
                              </div>
                            </td>
                            <td style={{ padding: '11px 14px', fontSize: 12 }}>{t.agent}</td>
                            <td style={{ padding: '11px 14px' }}>
                              <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'var(--mono)', background: t.status === 'Resolved' ? 'var(--neon-dim)' : t.status === 'Open' ? 'var(--red-dim)' : 'var(--yellow-dim)', color: t.status === 'Resolved' ? 'var(--neon)' : t.status === 'Open' ? 'var(--red)' : 'var(--yellow)' }}>{t.status}</span>
                            </td>
                            <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{t.date}</td>
                            <td style={{ padding: '11px 14px' }}>
                              <button onClick={() => handleViewTicket(t.id)} style={{ padding: '4px 10px', borderRadius: 5, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', fontSize: 11, cursor: 'pointer' }}>View</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* ── CS / CUSTOMER SERVICE (5G) ── */}
            {activeView === 'cs' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Customer <span style={{ color: 'var(--neon)' }}>Service</span></h2>
                    <div style={{ fontSize: 11.5, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 3 }}>Support agents</div>
                  </div>
                  <button onClick={() => setShowAddAgentModal(true)} style={{ padding: '8px 18px', borderRadius: 8, background: 'var(--neon)', color: '#000', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)' }}>+ Add Agent</button>
                </div>

                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  <h2 style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 16, margin: 0 }}>📞 CS Agents</h2>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead><tr style={{ background: 'var(--bg3)' }}>
                        {['#', 'Agent', 'Employee Code', 'Open Tickets', 'Resolved Today', 'Status', 'Action'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'left', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {csAgents.map((a, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{a.id}</td>
                            <td style={{ padding: '11px 14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 30, height: 30, borderRadius: '50%', background: a.avatarGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: a.avatarColor, flexShrink: 0 }}>{a.initials}</div>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 600 }}>{a.name}</div>
                                  <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{a.email}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 12 }}>{a.code}</td>
                            <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 13, color: a.open > 0 ? 'var(--yellow)' : 'var(--text3)' }}>{a.open}</td>
                            <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 13, color: a.done > 0 ? 'var(--neon)' : 'var(--text3)' }}>{a.done}</td>
                            <td style={{ padding: '11px 14px' }}>
                              <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'var(--mono)', background: a.status === 'Active' ? 'var(--neon-dim)' : 'var(--bg3)', color: a.status === 'Active' ? 'var(--neon)' : 'var(--text3)' }}>{a.status}</span>
                            </td>
                            <td style={{ padding: '11px 14px' }}>
                              {a.status === 'Inactive'
                                ? <button onClick={() => handleActivateAgent(a.id)} style={{ padding: '4px 10px', borderRadius: 5, background: 'var(--neon)', color: '#000', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Activate</button>
                                : <button onClick={() => openUserModal(a)} style={{ padding: '4px 10px', borderRadius: 5, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', fontSize: 11, cursor: 'pointer' }}>View</button>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* ── RATINGS (5H) ── */}
            {activeView === 'ratings' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}><span style={{ color: 'var(--neon)' }}>Ratings</span> & Reviews</h2>
                    <div style={{ fontSize: 11.5, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 3 }}>User ratings for service providers</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                  {(ratingsOverview?.stats || []).map(s => (
                    <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
                      <div style={{ fontSize: 9.5, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontFamily: 'var(--head)', fontSize: 28, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.val}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.delta}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                    <h2 style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 16, margin: 0 }}>Star Distribution</h2>
                    <div style={{ padding: 16 }}>
                      {(ratingsOverview?.starDistribution || []).map(r => (
                        <div key={r.stars} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', minWidth: 22, textAlign: 'left' }}>{r.stars}</span>
                          <div style={{ flex: 1, height: 6, background: 'var(--border2)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${r.pct}%`, background: r.color, borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', minWidth: 28 }}>{r.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                    <h2 style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 16, margin: 0 }}>Top Rated Providers</h2>
                    <div style={{ padding: '8px 0' }}>
                      {(ratingsOverview?.topProviders || []).map((p, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: i < (ratingsOverview?.topProviders?.length || 1) - 1 ? '1px solid var(--border)' : 'none' }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: p.color, flexShrink: 0 }}>{p.initials}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                            <div style={{ fontSize: 10, color: 'var(--text3)' }}>{p.sub}</div>
                          </div>
                          <span style={{ color: 'var(--yellow)', fontWeight: 700, fontSize: 14 }}>{p.rating} ★</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 16 }}>★ All Ratings</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead><tr style={{ background: 'var(--bg3)' }}>
                        {['#', 'User', 'Provider', 'Rating', 'Comment', 'Order', 'Date'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'left', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {ratingsData.map((r, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{r.id}</td>
                            <td style={{ padding: '11px 14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{r.userInitials}</div>
                                <span style={{ fontSize: 13 }}>{r.userName}</span>
                              </div>
                            </td>
                            <td style={{ padding: '11px 14px', fontSize: 12.5 }}>{r.provider}</td>
                            <td style={{ padding: '11px 14px' }}>
                              <span style={{ color: r.stars >= 4 ? 'var(--yellow)' : 'var(--red)', letterSpacing: 2, fontSize: 12 }}>
                                {'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}
                              </span>
                              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: r.stars >= 4 ? 'var(--text3)' : 'var(--red)', marginRight: 4 }}>{r.stars}</span>
                            </td>
                            <td style={{ padding: '11px 14px', fontSize: 11.5, color: r.stars < 3 ? 'var(--red)' : 'var(--text2)' }}>{r.comment}</td>
                            <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{r.order}</td>
                            <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{r.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>

      {/* ══ MODALS (Step 6) ══ */}

      {/* 6A — Add User Modal */}
      {showAddUserModal && (
        <div style={overlayStyle} onClick={() => setShowAddUserModal(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={mHeadStyle}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Add New User</span>
              <button onClick={() => setShowAddUserModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 18, cursor: 'pointer', padding: '2px 6px', borderRadius: 4 }}>✕</button>
            </div>
            <div style={mBodyStyle}>
              <div><div style={lblStyle}>Account Type</div>
                <select style={inpStyle} value={addUserForm.role} onChange={(e) => setAddUserForm(prev => ({ ...prev, role: e.target.value }))}>
                  <option value="user">User</option>
                  <option value="seller">Seller</option>
                  <option value="provider">Provider</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><div style={lblStyle}>First Name</div><input style={inpStyle} value={addUserForm.firstName} onChange={(e) => setAddUserForm(prev => ({ ...prev, firstName: e.target.value }))} placeholder="John"/></div>
                <div><div style={lblStyle}>Last Name</div><input style={inpStyle} value={addUserForm.lastName} onChange={(e) => setAddUserForm(prev => ({ ...prev, lastName: e.target.value }))} placeholder="Doe"/></div>
              </div>
              <div><div style={lblStyle}>Email</div><input type="email" style={inpStyle} value={addUserForm.email} onChange={(e) => setAddUserForm(prev => ({ ...prev, email: e.target.value }))} placeholder="user@smarttraffic.io"/></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><div style={lblStyle}>Phone</div><input style={inpStyle} value={addUserForm.phone} onChange={(e) => setAddUserForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="01X XXXX XXXX"/></div>
                <div><div style={lblStyle}>Password</div><input type="password" style={inpStyle} value={addUserForm.password} onChange={(e) => setAddUserForm(prev => ({ ...prev, password: e.target.value }))} placeholder="••••••••"/></div>
              </div>
            </div>
            <div style={mFootStyle}>
              <button style={btnPrimary} onClick={() => handleAddUser(addUserForm)}>Create</button>
              <button style={btnGhost}   onClick={() => setShowAddUserModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <UserDetailModal open={isUserModalOpen} onClose={closeUserModal} user={selectedUser} />

      {/* 6B — Edit User Modal */}
      {showEditUserModal && (
        <div style={overlayStyle} onClick={() => setShowEditUserModal(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={mHeadStyle}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Edit User</span>
              <button onClick={() => setShowEditUserModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 18, cursor: 'pointer', padding: '2px 6px', borderRadius: 4 }}>✕</button>
            </div>
            <div style={mBodyStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><div style={lblStyle}>First Name</div><input style={inpStyle} value={editUserForm.firstName} onChange={(e) => setEditUserForm(prev => ({ ...prev, firstName: e.target.value }))} /></div>
                <div><div style={lblStyle}>Last Name</div><input style={inpStyle} value={editUserForm.lastName} onChange={(e) => setEditUserForm(prev => ({ ...prev, lastName: e.target.value }))} /></div>
              </div>
              <div><div style={lblStyle}>Email</div><input style={inpStyle} value={editUserForm.email} onChange={(e) => setEditUserForm(prev => ({ ...prev, email: e.target.value }))} /></div>
              <div><div style={lblStyle}>Phone</div><input style={inpStyle} value={editUserForm.phone} onChange={(e) => setEditUserForm(prev => ({ ...prev, phone: e.target.value }))} /></div>
              <div><div style={lblStyle}>Status</div>
                <select style={inpStyle} value={editUserForm.status} onChange={(e) => setEditUserForm(prev => ({ ...prev, status: e.target.value }))}>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
            </div>
            <div style={mFootStyle}>
              <button style={btnPrimary} onClick={() => handleEditUser(editingUserId, editUserForm)}>Save Changes</button>
              <button style={btnGhost}   onClick={() => setShowEditUserModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* 6C — Urgent Assign Modal */}
      {showUrgentModal && (
        <div style={overlayStyle} onClick={() => { setShowUrgentModal(false); setSelectedUrgent(null); setUrgentProvider(''); setUrgentNote(''); }}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={mHeadStyle}>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>Assign Provider — Request #{selectedUrgent?.id || '---'}</span>
              <button onClick={() => { setShowUrgentModal(false); setSelectedUrgent(null); setUrgentProvider(''); setUrgentNote(''); }} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 18, cursor: 'pointer', padding: '2px 6px', borderRadius: 4 }}>✕</button>
            </div>
            <div style={mBodyStyle}>
              <div><div style={lblStyle}>User</div><input style={{ ...inpStyle, background: 'var(--bg3)', color: 'var(--text3)' }} value={selectedUrgent ? `${selectedUrgent.name} — ${selectedUrgent.type}` : '...'} readOnly/></div>
              <div><div style={lblStyle}>Location</div><input style={{ ...inpStyle, background: 'var(--bg3)', color: 'var(--text3)' }} value={selectedUrgent?.location || '...'} readOnly/></div>
              <div><div style={lblStyle}>Assign Service Provider</div>
                <select style={inpStyle} value={urgentProvider} onChange={(e) => setUrgentProvider(e.target.value)}>
                  <option value="">-- Select Provider --</option>
                  <option value="quickrescue">QuickRescue LLC ★4.9</option>
                  <option value="autofix">AutoFix Pro ★4.3</option>
                  <option value="megarecovery">MegaRecovery ★3.1</option>
                </select>
              </div>
              <div><div style={lblStyle}>Internal Note</div><textarea value={urgentNote} onChange={(e) => setUrgentNote(e.target.value)} style={{ ...inpStyle, resize: 'vertical', minHeight: 72 }} placeholder="Note for the team..."/></div>
            </div>
            <div style={mFootStyle}>
              <button style={btnPrimary} onClick={handleConfirmUrgentAssign}>Confirm Assignment</button>
              <button style={btnGhost}   onClick={() => setShowUrgentModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* 6D — Add Agent Modal */}
      {showAddAgentModal && (
        <div style={overlayStyle} onClick={() => setShowAddAgentModal(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={mHeadStyle}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Add CS Agent</span>
              <button onClick={() => setShowAddAgentModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 18, cursor: 'pointer', padding: '2px 6px', borderRadius: 4 }}>✕</button>
            </div>
            <div style={mBodyStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><div style={lblStyle}>First Name</div><input style={inpStyle} value={addAgentForm.firstName} onChange={(e) => setAddAgentForm(prev => ({ ...prev, firstName: e.target.value }))} placeholder="Sarah"/></div>
                <div><div style={lblStyle}>Last Name</div><input style={inpStyle} value={addAgentForm.lastName} onChange={(e) => setAddAgentForm(prev => ({ ...prev, lastName: e.target.value }))} placeholder="Jones"/></div>
              </div>
              <div><div style={lblStyle}>Email</div><input type="email" style={inpStyle} value={addAgentForm.email} onChange={(e) => setAddAgentForm(prev => ({ ...prev, email: e.target.value }))} placeholder="agent@smarttraffic.io"/></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><div style={lblStyle}>Employee Code</div><input style={inpStyle} value={addAgentForm.code} onChange={(e) => setAddAgentForm(prev => ({ ...prev, code: e.target.value }))} placeholder="EMP-2404"/></div>
                <div><div style={lblStyle}>Password</div><input type="password" style={inpStyle} value={addAgentForm.password} onChange={(e) => setAddAgentForm(prev => ({ ...prev, password: e.target.value }))} placeholder="••••••••"/></div>
              </div>
            </div>
            <div style={mFootStyle}>
              <button style={btnPrimary} onClick={() => handleAddAgent(addAgentForm)}>Create</button>
              <button style={btnGhost}   onClick={() => setShowAddAgentModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Admin;
