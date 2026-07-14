// Admin
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import TopBar from '../components/TopBar';
import UserDetailModal from '../components/UserDetailModal';
import useModal from '../hooks/useModal';
import { useTranslation } from '../i18n/LanguageContext';
import * as adminService from '../api/services/adminService';
import * as authService from '../api/services/authService';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import LiveClock from '../components/ui/LiveClock';
import {
  DashIcon,
  BarIcon,
  CheckIcon,
  MapIcon,
  InfoIcon,
  WarnIcon,
  GearIcon,
  UserIcon,
  TickIcon,
  PhoneIcon,
  StarIcon
} from '../components/ui/Icons';
import AdminDashboard from './Admin/AdminDashboard';
import UserManagement from './Admin/UserManagement';
import TicketManagement from './Admin/TicketManagement';
import ApprovalsList from './Admin/ApprovalsList';
import SkeletonLoader from '../components/ui/SkeletonLoader';

const Admin = () => {
  const showToast = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState(() =>
    sessionStorage.getItem('adminTab') || 'dashboard'
  );

  /* -- UI STATE -- */
  const [activeUserTab, setActiveUserTab] = useState('user');
  const [activeOpTab, setActiveOpTab] = useState('rescue');
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showUrgentModal, setShowUrgentModal] = useState(false);
  const [urgentProvider, setUrgentProvider] = useState('');
  const [urgentNote, setUrgentNote] = useState('');
  const [selectedUrgent, setSelectedUrgent] = useState(null);
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);
  const [addUserForm, setAddUserForm] = useState({ role: 'user', firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [editUserForm, setEditUserForm] = useState({ firstName: '', lastName: '', email: '', phone: '', status: 'Active' });
  const [editingUserId, setEditingUserId] = useState(null);
  const [addAgentForm, setAddAgentForm] = useState({ firstName: '', lastName: '', email: '', code: '', password: '' });
  const { isOpen: isUserModalOpen, selected: selectedUser, openModal: openUserModal, closeModal: closeUserModal } = useModal();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectReasonError, setRejectReasonError] = useState('');
  const [showApprovalReviewModal, setShowApprovalReviewModal] = useState(false);
  const [selectedApprovalReview, setSelectedApprovalReview] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [mapVisible, setMapVisible] = useState(false);

  /* -- DATA STATE (service-driven) -- */
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
  const [tabLoading, setTabLoading] = useState(false);
  const [tabError, setTabError] = useState('');
  const [tabErrorsByView, setTabErrorsByView] = useState({});
  const [sectionErrors, setSectionErrors] = useState({});
  const loadedTabs = React.useRef(new Set());
  const [ticketDetail, setTicketDetail] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [addUserErrors, setAddUserErrors] = useState({});
  const [editUserErrors, setEditUserErrors] = useState({});

  /* -- LOAD DATA PER TAB (cached) -- */
  const SectionError = ({ section }) => {
    const msg = sectionErrors[section];
    if (!msg) return null;
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(255,61,87,0.08)', border: '1px solid rgba(255,61,87,0.35)',
        borderRadius: 7, padding: '7px 12px', gap: 8, marginBottom: 4
      }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--red)' }}>
          ⚠ <strong>{section}:</strong> {msg}
        </span>
        <div style={{ display: 'flex', gap: 5 }}>
          <button onClick={() => { loadedTabs.current.delete(activeView); fetchTab(activeView); }}
            style={{ padding: '2px 8px', borderRadius: 5, background: 'var(--neon)', color: '#000', border: 'none', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>Retry</button>
          <button onClick={() => setSectionErrors(p => { const n = { ...p }; delete n[section]; return n; })}
            style={{ padding: '2px 6px', borderRadius: 5, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text3)', fontSize: 10, cursor: 'pointer' }}>✕</button>
        </div>
      </div>
    );
  };

  const fetchTab = async (view, force = false) => {
    if (!force && loadedTabs.current.has(view)) return;
    setTabLoading(true);
    setTabError('');
    const localErrors = {};
    const safe = async (section, fn, fallback) => {
      try {
        const data = await fn();
        setSectionErrors(p => { const n = { ...p }; delete n[section]; return n; });
        return data;
      } catch (e) {
        const is500 = e?.status === 500 || (e?.message && e.message.includes('500'));
        const msg = is500
          ? `Server error 500 — ${section} API failed`
          : (e?.message || 'Failed to load');
        localErrors[section] = msg;
        setSectionErrors(p => ({ ...p, [section]: msg }));
        return fallback;
      }
    };

    if (view === 'dashboard') {
      const [dash, act, meRaw, sysStatus] = await Promise.all([
        safe('Dashboard Summary', () => adminService.getDashboard(), {}),
        safe('Recent Activity', () => adminService.getActivity(), []),
        safe('Profile', () => authService.getMe(), null),
        safe('System Status', () => adminService.getAbout(), {}),
      ]);
      setDashboardData({ ...dash, recentActivity: act || [], systemStatus: sysStatus?.systemStatus ?? [] });
      const me = meRaw?.data ?? meRaw;
      if (me) {
        const fn = me?.firstName ?? me?.name?.split(' ')[0] ?? 'System';
        const ln = me?.lastName ?? me?.name?.split(' ')[1] ?? 'Admin';
        setCurrentUser({
          id: me?.id ?? 'ADM-001', name: `${fn} ${ln}`.trim(), role: me?.role ?? 'Admin',
          email: me?.email ?? '—', phone: me?.phoneNumber ?? '—', status: 'Active',
          initials: fn[0]?.toUpperCase() ?? 'A', avatarGrad: 'linear-gradient(135deg,var(--neon),#2eff80)',
          avatarColor: '#000', points: me?.points ?? 0
        });
      }
    } else if (view === 'analytics') {
      const d = await safe('Analytics', () => adminService.getAnalytics(), {});
      setAnalyticsData(d);
    } else if (view === 'approvals') {
      const [ap, st] = await Promise.all([
        safe('Approvals List', () => adminService.getApprovals(), []),
        safe('Approvals Stats', () => adminService.getApprovalsStats(), []),
      ]);
      setPendingApprovals(ap); setApprovalsStats(st);
    } else if (view === 'traffic') {
      const d = await safe('Traffic', () => adminService.getTraffic(), {});
      setTrafficData(d);
    } else if (view === 'about') {
      const d = await safe('System Status', () => adminService.getAbout(), {});
      setAboutData(d);
    } else if (view === 'urgent') {
      const d = await safe('Urgent Requests', () => adminService.getUrgent(), []);
      setUrgentRequests(d);
    } else if (view === 'operations') {
      const d = await safe('Operations', () => adminService.getOperations(), []);
      setOpsData(d);
    } else if (view === 'users') {
      const [u, s, p] = await Promise.all([
        safe('Normal Users (Drivers)', () => adminService.getUsers('user'), []),
        safe('Sellers', () => adminService.getUsers('seller'), []),
        safe('Providers', () => adminService.getUsers('provider'), []),
      ]);
      setUsersData({ user: u, seller: s, provider: p });
    } else if (view === 'tickets') {
      const [tix, st] = await Promise.all([
        safe('Tickets List', () => adminService.getTickets(), []),
        safe('Tickets Stats', () => adminService.getTicketsStats(), []),
      ]);
      setTickets(tix); setTicketsStats(st);
    } else if (view === 'cs') {
      const d = await safe('CS Agents', () => adminService.getCsAgents(), []);
      setCsAgents(d);
    } else if (view === 'ratings') {
      const d = await safe('Ratings', () => adminService.getRatings(), { list: [] });
      setRatingsData(d?.list || []);
    }

    loadedTabs.current.add(view);
    const firstError = Object.values(localErrors)[0] || '';
    setTabErrorsByView(prev => ({ ...prev, [view]: firstError }));
    if (activeView === view) setTabError(firstError);
    setTabLoading(false); 
  };

  const loadTab = (view) => {
    if (loadedTabs.current.has(view)) return;
    fetchTab(view);
  };

  useEffect(() => {
    const saved = sessionStorage.getItem('adminTab') || 'dashboard';
    fetchTab(saved);
  }, []);

  /* -- ACTION HANDLERS -- */
  const handleApprove = async (id) => {
    if (!id || id === '—') { showToast('Invalid approval id', 'err'); return; }
    try {
      await adminService.approveApplication(id);
      setPendingApprovals(prev => prev.filter(a => a.id !== id));
      setApprovalsStats(prev => prev.map(s =>
        s.label === 'PENDING' ? { ...s, val: Math.max(0, (s.val ?? 1) - 1) } :
        s.label === 'APPROVED' ? { ...s, val: (s.val ?? 0) + 1 } : s
      ));
      showToast('Approved ✓', 'ok');
      loadedTabs.current.delete('approvals');
      fetchTab('approvals');
    } catch (err) { showToast(err?.message || 'Approve failed', 'err'); }
  };
  const openRejectModal = (id) => {
    if (!id || id === '—') { showToast('Invalid approval id', 'err'); return; }
    setRejectingId(id);
    setRejectReason('');
    setRejectReasonError('');
    setShowRejectModal(true);
  };
  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) { setRejectReasonError('Reason is required'); return; }
    setRejectReasonError('');
    try {
      await adminService.rejectApplication(rejectingId, rejectReason.trim());
      setPendingApprovals(prev => prev.filter(a => a.id !== rejectingId));
      setApprovalsStats(prev => prev.map(s =>
        s.label === 'PENDING' ? { ...s, val: Math.max(0, (s.val ?? 1) - 1) } :
        s.label === 'REJECTED' ? { ...s, val: (s.val ?? 0) + 1 } : s
      ));
      showToast('Rejected', 'ok');
      setShowRejectModal(false);
      setRejectingId(null);
      setRejectReason('');
      loadedTabs.current.delete('approvals');
      fetchTab('approvals');
    } catch (err) { showToast(err?.message || 'Reject failed', 'err'); }
  };
  const handleReviewDocs = async (approval) => {
    setSelectedApprovalReview(approval);
    setShowApprovalReviewModal(true);
    if (!approval?.id || approval.id === '—') return;
    try { await adminService.reviewDocs(approval.id); } catch { /* optional side request */ }
  };
  const handleTrackUrgent = async (id) => {
    try { await adminService.trackUrgent(id); showToast('Tracking request...', 'ok'); } catch { showToast('Tracking failed', 'err'); }
  };
  const handleViewTicket = async (id) => {
    try {
      const detail = await adminService.getTicketById(id);
      setTicketDetail(detail);
      setShowTicketModal(true);
    } catch { showToast('Failed to fetch ticket', 'err'); }
  };
  const validateAddUser = (d) => {
    const errs = {};
    if (!d.firstName?.trim()) errs.firstName = 'First name is required';
    if (!d.lastName?.trim()) errs.lastName = 'Last name is required';
    if (!d.email?.trim()) errs.email = 'Email is required';
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(d.email)) errs.email = 'Invalid email';
    if (!d.phone?.trim()) errs.phone = 'Phone is required';
    if (!d.password?.trim()) errs.password = 'Password is required';
    else if (d.password.length < 8) errs.password = 'Min 8 characters';
    else if (!/[A-Z]/.test(d.password)) errs.password = 'Must contain uppercase (A-Z)';
    else if (!/[0-9]/.test(d.password)) errs.password = 'Must contain a number';
    else if (!/[^A-Za-z0-9]/.test(d.password)) errs.password = 'Must contain special char e.g. @#$';
    return errs;
  };

  const handleAddUser = async (data) => {
    const errs = validateAddUser(data);
    if (Object.keys(errs).length > 0) { setAddUserErrors(errs); return; }
    setAddUserErrors({});
    try {
      const res = await adminService.addUser(data);
      const r = res ?? {};
      const newUser = {
        id: r.id ?? Date.now().toString(),
        name: r.fullName?.trim() || r.name?.trim() || `${data.firstName} ${data.lastName}`.trim(),
        email: r.email?.trim() || data.email,
        phone: r.phoneNumber?.trim() || r.phone?.trim() || data.phone || '—',
        status: r.status?.trim() ? r.status : (r.isActive ? 'Active' : 'Inactive'),
        role: (r.role ?? data.role ?? 'user').toLowerCase(),
        points: r.points ?? 0,
        initials: data.firstName?.[0]?.toUpperCase() ?? 'U',
        avatarGrad: 'linear-gradient(135deg,var(--neon),#2eff80)', avatarColor: '#000',
      };
      const role = newUser.role;
      setUsersData(prev => ({
        user: ['client', 'driver', 'user'].includes(role) ? [...prev.user, newUser] : prev.user,
        seller: role === 'seller' ? [...prev.seller, newUser] : prev.seller,
        provider: role === 'provider' ? [...prev.provider, newUser] : prev.provider,
      }));
      showToast('User created ✓', 'ok');
      setShowAddUserModal(false);
      setAddUserForm({ role: 'user', firstName: '', lastName: '', email: '', phone: '', password: '' });
      loadedTabs.current.delete('users');
      fetchTab('users');
    } catch (err) {
      showToast(err?.message || 'Failed to create user', 'err');
    }
  };
  const validateEditUser = (d) => {
    const errs = {};
    if (!d.firstName?.trim()) errs.firstName = 'First name is required';
    if (!d.lastName?.trim()) errs.lastName = 'Last name is required';
    if (!d.email?.trim()) errs.email = 'Email is required';
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(d.email)) errs.email = 'Invalid email';
    return errs;
  };

  const handleEditUser = async (id, data) => {
    const errs = validateEditUser(data);
    if (Object.keys(errs).length > 0) { setEditUserErrors(errs); return; }
    setEditUserErrors({});
    try {
      await adminService.editUser(id, data);
      const updatedName = `${data.firstName} ${data.lastName}`.trim();
      const patch = (list) => list.map(u => u.id === id
        ? {
          ...u, name: updatedName, email: data.email,
          status: data.isActive === false ? 'Inactive' : 'Active',
          initials: (data.firstName?.[0] ?? 'U').toUpperCase()
        }
        : u);
      setUsersData(prev => ({ user: patch(prev.user), seller: patch(prev.seller), provider: patch(prev.provider) }));
      showToast('Saved ✓', 'ok');
      setShowEditUserModal(false);
      setEditingUserId(null);
      setEditUserForm({ firstName: '', lastName: '', email: '', phone: '', status: 'Active' });
      loadedTabs.current.delete('users');
      fetchTab('users');
    } catch (err) {
      showToast(err?.message || 'Failed to save changes', 'err');
    }
  };
  const handleAssignUrgent = async (id, providerId, note) => {
    try { await adminService.assignUrgent(id, providerId, note); showToast('Assigned ✓', 'ok'); setShowUrgentModal(false); } catch { showToast('Failed', 'err'); }
  };
  const handleConfirmUrgentAssign = async () => {
    if (!selectedUrgent) return;
    if (!urgentProvider) { showToast('Select a provider first', 'err'); return; }
    await handleAssignUrgent(selectedUrgent.id, urgentProvider, urgentNote);
    setSelectedUrgent(null);
    setUrgentProvider('');
    setUrgentNote('');
  };
  const handleViewUrgent = async (id) => {
    try { await adminService.trackUrgent(id); showToast(`Viewing request status ${id}`, 'ok'); } catch { showToast('Failed to view status', 'err'); }
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
  const validateAddAgent = (d) => {
    const errs = {};
    const name = `${d.firstName ?? ''} ${d.lastName ?? ''}`.trim();
    if (!name) errs.name = 'Name is required';
    if (!d.email?.trim()) errs.email = 'Email is required';
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(d.email)) errs.email = 'Invalid email';
    if (!d.password?.trim()) errs.password = 'Password is required';
    else if (d.password.length < 8) errs.password = 'Min 8 characters';
    else if (!/[A-Z]/.test(d.password)) errs.password = 'Must contain uppercase (A-Z)';
    else if (!/[0-9]/.test(d.password)) errs.password = 'Must contain a number';
    else if (!/[^A-Za-z0-9]/.test(d.password)) errs.password = 'Must contain special char e.g. @#$';
    return errs;
  };
  const [addAgentErrors, setAddAgentErrors] = useState({});
  const handleAddAgent = async (data) => {
    const errs = validateAddAgent(data);
    if (Object.keys(errs).length > 0) { setAddAgentErrors(errs); return; }
    setAddAgentErrors({});
    try {
      const res = await adminService.addCsAgent(data);
      const r = res ?? {};
      const fullName = `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim();
      const newAgent = {
        id:       r.id      ?? Date.now().toString(),
        name:     r.name?.trim() || fullName || 'Unknown',
        email:    r.email?.trim() || data.email || '—',
        status:   r.isActive !== undefined ? (r.isActive ? 'Active' : 'Inactive') : 'Active',
        tickets:  r.assignedTickets ?? 0,
        initials: (fullName[0] ?? 'A').toUpperCase(),
        _raw:     r,
      };
      setCsAgents(prev => [...prev, newAgent]);
      showToast('Agent created ✓', 'ok');
      setShowAddAgentModal(false);
      setAddAgentForm({ firstName: '', lastName: '', email: '', code: '', password: '' });
      loadedTabs.current.delete('cs');
      fetchTab('cs');
    } catch (err) {
      showToast(err?.message || 'Failed to create agent', 'err');
    }
  };
  const handleActivateAgent = async (id) => {
    try { await adminService.activateCsAgent(id); showToast('Activated', 'ok'); } catch { showToast('Failed', 'err'); }
  };
  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  /* -- SIDEBAR ITEMS -- */
  const sidebarItems = [
    { key: 'dashboard', label: t('admin.tabs.dashboard'), icon: <DashIcon /> },
    { key: 'analytics', label: t('admin.tabs.analytics'), icon: <BarIcon /> },
    { key: 'approvals', label: t('admin.tabs.approvals'), icon: <CheckIcon />, badge: pendingApprovals.length || undefined, badgeColor: 'var(--amber)' },
    { key: 'traffic', label: t('admin.tabs.traffic'), icon: <MapIcon /> },
    { key: 'about', label: t('admin.tabs.system'), icon: <InfoIcon /> },
    { key: 'urgent', label: t('admin.tabs.urgent'), icon: <WarnIcon />, badge: urgentRequests.length || undefined , badgeColor: 'var(--red)' },
    { key: 'users', label: t('admin.tabs.users'), icon: <UserIcon />, badge: (usersData.user.length + usersData.seller.length + usersData.provider.length) || undefined },
    { key: 'tickets', label: t('admin.tabs.tickets'), icon: <TickIcon />, badge: tickets.length || undefined },
    { key: 'cs', label: t('admin.tabs.csAgents'), icon: <PhoneIcon /> },
    { key: 'ratings', label: t('admin.tabs.ratings'), icon: <StarIcon /> },
  ];


  /* -- MODAL STYLES -- */
  const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(4,7,12,0.88)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
  const modalStyle = { background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 12, width: 480, maxWidth: '90vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' };
  const mHeadStyle = { padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' };
  const mBodyStyle = { padding: '18px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 };
  const mFootStyle = { padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 };
  const inpStyle = { width: '100%', background: 'var(--input-bg, var(--bg3))', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 13, padding: '8px 12px', outline: 'none', boxSizing: 'border-box' };
  const lblStyle = { fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 };
  const btnPrimary = { padding: '8px 20px', borderRadius: 8, background: 'var(--neon)', color: '#000', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)' };
  const btnGhost = { padding: '8px 20px', borderRadius: 8, background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)' };

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', height: '100vh', overflow: 'hidden' }}>
        {/* SIDEBAR */}
        <aside style={{
          background: 'var(--bg2)', borderInlineEnd: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 38, height: 38, background: 'var(--neon)', borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--head)', fontSize: 20, color: '#000',
              boxShadow: '0 0 18px var(--neon-glow)',
            }}>ST</div>
            <div>
              <div style={{ fontFamily: 'var(--head)', fontSize: 17 }}>Smart Traffic</div>
              <div style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--neon)', letterSpacing: 2 }}>ADMIN PANEL</div>
            </div>
          </div>

          <div style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
            {sidebarItems.map(item => (
              <div key={item.key} onClick={() => { setActiveView(item.key); setSectionErrors({}); setTabError(tabErrorsByView[item.key] || ''); loadTab(item.key); }} style={{
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
                  position: 'absolute', insetInlineStart: 0, top: '50%', transform: 'translateY(-50%)',
                  width: 3, height: '60%', background: 'var(--neon)', borderStartEndRadius: 2, borderEndEndRadius: 2,
                }} />}
              </div>
            ))}
          </div>

          <div style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <LanguageToggle />
              <ThemeToggle />
            </div>

          </div>
        </aside>

        {/* MAIN */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'scroll' }}>
          {/* TOPBAR */}
          <div style={{
            height: 54, minHeight: 54, background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', padding: '0 20px', gap: 14,
            position: 'relative',
          }}>
            <h1 style={{ fontFamily: 'var(--head)', fontSize: 20, letterSpacing: .5, flex: 1, margin: 0 }}>
              {sidebarItems.find(s => s.key === activeView)?.label}
            </h1>



            {/* Profile Avatar */}
            <div
              onClick={() => {
                if (currentUser) { openUserModal(currentUser); }
                else { showToast('Profile not loaded yet', 'err'); }
                setShowNotifPanel(false);
                setShowProfilePanel(false);
              }}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg,var(--neon),#2eff80)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 13, color: '#000',
                cursor: 'pointer', flexShrink: 0,
                title: currentUser?.email ?? '',
              }}
              title={currentUser?.email ?? ''}
            >{currentUser?.email ? currentUser.email.slice(0, 2).toUpperCase() : 'AD'}</div>

            <button onClick={handleLogout} style={{
              padding: '8px 14px', borderRadius: 8, border: 'none',
              background: 'var(--red-dim)', color: 'var(--red)',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              flexShrink: 0,
            }}>{t('common.logout')}</button>

            <LiveClock />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'var(--neon-dim)', border: '1px solid rgba(170,255,0,.2)', borderRadius: 20, fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--neon)' }}>
              <div style={{ width: 6, height: 6, background: 'var(--neon)', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
              All Systems Operational
            </div>

            {/* Notification Panel */}
            {showNotifPanel && (
              <div style={{
                position: 'absolute', top: 62, left: 60,
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
                position: 'absolute', top: 62, left: 20,
                width: 220, background: 'var(--card2)',
                border: '1px solid var(--border2)', borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 200, overflow: 'hidden',
              }}>
                <div style={{ padding: 16, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,var(--neon),#2eff80)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, color: '#000', flexShrink: 0 }}>MA</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>Main Administrator</div>
                    <div style={{ fontSize: 10.5, color: 'var(--text3)' }}>System Admin</div>
                  </div>
                </div>
                {[
                  { label: 'Profile', msg: 'Opening Profile' },
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
                }}>Log Out</div>
              </div>
            )}
          </div>

          {/* CONTENT */}
          <div style={{ flex: 1, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>

            {/* -- TAB LOADING SPINNER -- REMOVED IN FAVOR OF SKELETONS */}

            {tabError && !tabLoading && (
              <div style={{
                position: 'absolute', top: 12, right: 12, zIndex: 60,
                width: 300, display: 'flex', flexDirection: 'column', gap: 10,
                background: 'var(--card2)', border: '1px solid var(--border2)',
                borderRadius: 10, padding: 12, boxShadow: '0 10px 26px rgba(0,0,0,.45)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>⚠</span>
                  <span style={{ color: 'var(--red)', fontFamily: 'var(--mono)', fontSize: 12 }}>{tabError}</span>
                </div>
                <button
                  className="btn btn-neon"
                  onClick={() => { loadedTabs.current.delete(activeView); fetchTab(activeView, true); }}
                  style={{ cursor: 'pointer' }}
                >
                  Retry
                </button>
              </div>
            )}



            {tabLoading ? (
              <SkeletonLoader type={activeView === 'dashboard' ? 'dashboard' : 'table'} />
            ) : (
              <>
                {/* -- DASHBOARD -- */}
                {activeView === 'dashboard' && (
              <AdminDashboard
                dashboardData={dashboardData}
                pendingApprovals={pendingApprovals}
                setActiveView={setActiveView}
                setSectionErrors={setSectionErrors}
                setTabError={setTabError}
                tabErrorsByView={tabErrorsByView}
                loadTab={loadTab}
              />
            )}

            {/* -- ANALYTICS (5A) -- */}
            {activeView === 'analytics' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Analytics <span style={{ color: 'var(--neon)' }}>& Insights</span></h2>
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
                  <h2 style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 16, margin: 0 }}>Monthly Orders — 2025</h2>
                  <div style={{ padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160 }}>
                      {(analyticsData?.monthlyChart || []).map(d => {
                        const max = Math.max(...(analyticsData?.monthlyChart || []).map(x => x.v), 1);
                        return (
                          <div key={d.m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                            <span style={{ fontSize: 8, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{(d.v / 1000).toFixed(0)}K</span>
                            <div style={{ width: '100%', height: `${(d.v / max) * 100}%`, borderRadius: '3px 3px 0 0', background: 'var(--neon)', opacity: (d.v / max) * 0.5 + 0.5, minHeight: 3 }} />
                            <span style={{ fontSize: 8, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{d.m.slice(0, 3)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontFamily: 'var(--head)', fontSize: 16, margin: 0 }}>User Activity Trend</h2>
                    <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', border: '1px solid var(--border)', padding: '3px 10px', borderRadius: 20 }}>7 Days</span>
                  </div>
                  <div style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
                      {(analyticsData?.userActivity || [55, 72, 60, 88, 75, 95, 82]).map((h, i) => (
                        <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: '3px 3px 0 0', background: `rgba(0,170,255,${0.4 + h / 200})`, minHeight: 4 }} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} style={{ flex: 1, textAlign: 'center', fontSize: 8, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{d}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* -- APPROVALS (existing) -- */}
            {activeView === 'approvals' && (
              <ApprovalsList
                approvalsStats={approvalsStats}
                pendingApprovals={pendingApprovals}
                handleApprove={handleApprove}
                handleReviewDocs={handleReviewDocs}
                openRejectModal={openRejectModal}
              />
            )}

            {/* -- TRAFFIC (existing) -- */}
            {activeView === 'traffic' && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontFamily: 'var(--head)', fontSize: 18, margin: 0 }}>Live Traffic Map</h2>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span className="badge b-active">🟢 Smooth: 4</span>
                    <span className="badge b-high">🟡 Moderate: 2</span>
                    <span className="badge b-urgent">🔴 Congested: 1</span>
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

            {/* -- ABOUT (5B) -- */}
            {activeView === 'about' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>About <span style={{ color: 'var(--neon)' }}>System</span> & Event Log</h2>
                    <div style={{ fontSize: 11.5, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 3 }}>Technical info, platform stats + comprehensive log</div>
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
                  <h2 style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 16, margin: 0 }}>📜 Comprehensive Event Log</h2>
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

            {/* -- URGENT (5C) -- */}
            {activeView === 'urgent' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Urgent <span style={{ color: 'var(--neon)' }}>Requests</span></h2>
                    <div style={{ fontSize: 11.5, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 3 }}>Cases requiring immediate intervention</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--neon-dim)', border: '1px solid rgba(170,255,0,.22)', borderRadius: 20, padding: '3px 11px', fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--neon)' }}>
                    <div style={{ width: 6, height: 6, background: 'var(--neon)', borderRadius: '50%', animation: 'pulse 1.8s infinite' }} />
                    Live
                  </div>
                </div>

                <div style={{ background: 'var(--card)', border: '1px solid rgba(255,61,87,.3)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <WarnIcon />
                    <span style={{ color: 'var(--red)', fontWeight: 700 }}>Urgent Requests</span>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg3)' }}>
                          {['ID', 'User', 'Request Type', 'Location', 'Wait Time', 'Status'].map(h => (
                            <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'center', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>{h}</th>
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}



            {/* -- USERS (5D — upgraded with 3 tabs) -- */}
            {activeView === 'users' && (
              <UserManagement
                usersData={usersData}
                activeUserTab={activeUserTab}
                setActiveUserTab={setActiveUserTab}
                openUserModal={openUserModal}
                openEditUser={openEditUser}
                setShowAddUserModal={setShowAddUserModal}
              />
            )}

            {/* -- TICKETS (5F) -- */}
            {activeView === 'tickets' && (
              <TicketManagement
                tickets={tickets}
                ticketsStats={ticketsStats}
                handleViewTicket={handleViewTicket}
              />
            )}

            {/* -- CS / CUSTOMER SERVICE (5G) -- */}
            {activeView === 'cs' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Customer <span style={{ color: 'var(--neon)' }}>Service</span></h2>
                    <div style={{ fontSize: 11.5, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 3 }}>Technical Support Agents</div>
                  </div>
                  <button onClick={() => setShowAddAgentModal(true)} style={{ padding: '8px 18px', borderRadius: 8, background: 'var(--neon)', color: '#000', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)' }}>+ Add Agent</button>
                </div>

                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  <h2 style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 16, margin: 0 }}>Customer Service Agents</h2>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <colgroup>
                        <col style={{ width: 170 }} /><col style={{ width: 220 }} /><col style={{ width: 120 }} /><col style={{ width: 90 }} /><col style={{ width: 120 }} />
                      </colgroup>
                      <thead><tr style={{ background: 'var(--bg3)' }}>
                        {['Id', 'Agent', 'Assigned Tickets', 'Status', 'Action'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'center', fontWeight: 500, borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {csAgents.map((a, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', textAlign: 'center' }}>{a.id ?? '—'}</td>
                            <td style={{ padding: '11px 14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--neon-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--neon)', flexShrink: 0 }}>{a.initials}</div>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 600 }}>{a.name ?? '—'}</div>
                                  <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{a.email ?? '—'}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 13, color: (a.tickets ?? a.assignedTickets ?? 0) > 0 ? 'var(--yellow)' : 'var(--text3)', textAlign: 'center' }}>{a.tickets ?? a.assignedTickets ?? 0}</td>
                            <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                              <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'var(--mono)', background: a.status === 'Active' ? 'var(--neon-dim)' : 'var(--bg3)', color: a.status === 'Active' ? 'var(--neon)' : 'var(--text3)' }}>{a.status ?? '—'}</span>
                            </td>
                            <td style={{ padding: '11px 14px', textAlign: 'center' }}>
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

            {/* -- RATINGS (5H) -- */}
            {activeView === 'ratings' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}><span style={{ color: 'var(--neon)' }}>Ratings</span> & Reviews</h2>
                    <div style={{ fontSize: 11.5, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 3 }}>User reviews for service providers</div>
                  </div>
                </div>

                {/* -- Ratings Stats from real data -- */}
                {(() => {
                  const total = ratingsData.length;
                  const avg = total ? (ratingsData.reduce((s, r) => s + (r.rating ?? r.stars ?? 0), 0) / total).toFixed(1) : 0;
                  const dist = [5, 4, 3, 2, 1].map(n => ({
                    stars: n,
                    count: ratingsData.filter(r => (r.rating ?? r.stars) === n).length,
                    pct: total ? Math.round(ratingsData.filter(r => (r.rating ?? r.stars) === n).length / total * 100) : 0,
                    color: n >= 4 ? 'var(--neon)' : n === 3 ? 'var(--amber)' : 'var(--red)',
                  }));
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {[
                          { label: 'TOTAL REVIEWS', val: total, color: 'var(--neon)' },
                          { label: 'AVG RATING', val: `${avg} ★`, color: 'var(--yellow)' },
                          { label: '5 STARS', val: dist[0].count, color: 'var(--emerald)' },
                          { label: '1-2 STARS', val: dist[3].count + dist[4].count, color: 'var(--red)' },
                        ].map(s => (
                          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
                            <div style={{ fontSize: 9.5, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 4 }}>{s.label}</div>
                            <div style={{ fontFamily: 'var(--head)', fontSize: 28, color: s.color, lineHeight: 1 }}>{s.val}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                        <h2 style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 15, margin: 0 }}>★ Star Distribution</h2>
                        <div style={{ padding: 16 }}>
                          {dist.map(r => (
                            <div key={r.stars} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                              <span style={{ fontSize: 12, color: 'var(--yellow)', minWidth: 16 }}>{'★'.repeat(r.stars)}</span>
                              <div style={{ flex: 1, height: 6, background: 'var(--border2)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${r.pct}%`, background: r.color, borderRadius: 3, transition: 'width .4s' }} />
                              </div>
                              <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', minWidth: 40 }}>{r.count} ({r.pct}%)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'auto' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 16 }}>★ All Ratings</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                      <colgroup>
                        <col style={{ width: 170 }} /><col style={{ width: 160 }} /><col style={{ width: 80 }} /><col style={{ width: 300 }} /><col style={{ width: 80 }} /><col style={{ width: 120 }} />
                      </colgroup>
                      <thead><tr style={{ background: 'var(--bg3)' }}>
                        {['Id', 'Customer', 'Rating', 'Comment', 'Target', 'Date'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', textAlign: 'center', fontWeight: 500, borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {ratingsData.map((r, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', textAlign: 'center' }}>{r.id ?? '—'}</td>
                            <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--neon-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0, color: 'var(--neon)' }}>{(r.name ?? r.customerName ?? 'U')[0]?.toUpperCase()}</div>
                                <span style={{ fontSize: 12.5 }}>{r.name ?? r.customerName}</span>
                              </div>
                            </td>
                            <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                <span style={{ color: (r.rating ?? r.stars) >= 4 ? 'var(--yellow)' : (r.rating ?? r.stars) >= 3 ? 'var(--amber)' : 'var(--red)', letterSpacing: 1, fontSize: 13 }}>
                                  {'★'.repeat(r.rating ?? r.stars ?? 0)}{'☆'.repeat(5 - (r.rating ?? r.stars ?? 0))}
                                </span>
                                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)' }}>{r.rating ?? r.stars}/5</span>
                              </div>
                            </td>
                            <td style={{ padding: '11px 14px', fontSize: 11.5, color: (r.rating ?? r.stars) < 3 ? 'var(--red)' : 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.comment}>{r.comment}</td>
                            <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', textAlign: 'center' }}>{r.target ?? '—'}</td>
                            <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', textAlign: 'center' }}>{r.date ?? r.createdAt ? new Date(r.createdAt ?? r.date).toLocaleDateString() : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
              </>
            )}

          </div>
        </div>
      </div>

      {/* -- MODALS (Step 6) -- */}

      {/* 6A — Add User Modal */}
      {showAddUserModal && (
        <div style={overlayStyle} onClick={() => setShowAddUserModal(false)} role="dialog" aria-modal="true" aria-labelledby="add-user-title">
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={mHeadStyle}>
              <span id="add-user-title" style={{ fontSize: 15, fontWeight: 700 }}>Add New User</span>
              <button onClick={() => setShowAddUserModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 18, cursor: 'pointer', padding: '2px 6px', borderRadius: 4 }}>✕</button>
            </div>
            <div style={mBodyStyle}>
              <div><div style={lblStyle}>Account Type</div>
                <select style={inpStyle} value={addUserForm.role} onChange={(e) => setAddUserForm(prev => ({ ...prev, role: e.target.value }))}>
                  <option value="user">Normal User</option>
                  <option value="seller">Seller</option>
                  <option value="provider">Service Provider</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={lblStyle}>First Name</div>
                  <input style={{ ...inpStyle, borderColor: addUserErrors.firstName ? 'var(--red)' : '' }} value={addUserForm.firstName} onChange={(e) => setAddUserForm(prev => ({ ...prev, firstName: e.target.value }))} placeholder="John" />
                  {addUserErrors.firstName && <div style={{ fontSize: 10, color: 'var(--red)', marginTop: 3 }}>{addUserErrors.firstName}</div>}
                </div>
                <div>
                  <div style={lblStyle}>Last Name</div>
                  <input style={{ ...inpStyle, borderColor: addUserErrors.lastName ? 'var(--red)' : '' }} value={addUserForm.lastName} onChange={(e) => setAddUserForm(prev => ({ ...prev, lastName: e.target.value }))} placeholder="Doe" />
                  {addUserErrors.lastName && <div style={{ fontSize: 10, color: 'var(--red)', marginTop: 3 }}>{addUserErrors.lastName}</div>}
                </div>
              </div>
              <div>
                <div style={lblStyle}>Email Address</div>
                <input type="email" style={{ ...inpStyle, borderColor: addUserErrors.email ? 'var(--red)' : '' }} value={addUserForm.email} onChange={(e) => setAddUserForm(prev => ({ ...prev, email: e.target.value }))} placeholder="user@smarttraffic.io" />
                {addUserErrors.email && <div style={{ fontSize: 10, color: 'var(--red)', marginTop: 3 }}>{addUserErrors.email}</div>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={lblStyle}>Phone Number</div>
                  <input style={{ ...inpStyle, borderColor: addUserErrors.phone ? 'var(--red)' : '' }} value={addUserForm.phone} onChange={(e) => setAddUserForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="01XXXXXXXXX" />
                  {addUserErrors.phone && <div style={{ fontSize: 10, color: 'var(--red)', marginTop: 3 }}>{addUserErrors.phone}</div>}
                </div>
                <div>
                  <div style={lblStyle}>Password</div>
                  <input type="password" style={{ ...inpStyle, borderColor: addUserErrors.password ? 'var(--red)' : '' }} value={addUserForm.password} onChange={(e) => setAddUserForm(prev => ({ ...prev, password: e.target.value }))} placeholder="Min 8, A-Z, 0-9, @" />
                  {addUserErrors.password && <div style={{ fontSize: 10, color: 'var(--red)', marginTop: 3 }}>{addUserErrors.password}</div>}
                </div>
              </div>
            </div>
            <div style={mFootStyle}>
              <button style={btnPrimary} onClick={() => handleAddUser(addUserForm)}>Create</button>
              <button style={btnGhost} onClick={() => setShowAddUserModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <UserDetailModal open={isUserModalOpen} onClose={closeUserModal} user={selectedUser} />

      {/* Ticket Detail Modal */}
      {showTicketModal && ticketDetail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(4,7,12,0.88)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setShowTicketModal(false)}>
          <div style={{ background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 12, width: 560, maxWidth: '92vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{ticketDetail.subject ?? '—'}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 2 }}>#{ticketDetail.ticketId?.slice(0, 8) ?? '—'} آ· {ticketDetail.userName ?? '—'}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'var(--mono)',
                  background: ticketDetail.status === 2 ? 'var(--neon-dim)' : ticketDetail.status === 1 ? 'var(--yellow-dim)' : 'var(--red-dim)',
                  color: ticketDetail.status === 2 ? 'var(--neon)' : ticketDetail.status === 1 ? 'var(--yellow)' : 'var(--red)'
                }}>
                  {ticketDetail.status === 0 ? 'Open' : ticketDetail.status === 1 ? 'In Progress' : 'Completed'}
                </span>
                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'var(--mono)', background: 'var(--bg3)', color: 'var(--text3)' }}>
                  P{ticketDetail.priority ?? '—'}
                </span>
                <button onClick={() => setShowTicketModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 18, cursor: 'pointer' }}>✕</button>
              </div>
            </div>
            {/* Description */}
            {ticketDetail.description && (
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: 12.5, color: 'var(--text2)', background: 'var(--bg3)' }}>
                {ticketDetail.description}
              </div>
            )}
            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(ticketDetail.messages ?? []).length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 12, padding: 24 }}>No messages</div>
              )}
              {(ticketDetail.messages ?? []).map((m, i) => {
                const isAgent = !m.senderName?.trim();
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isAgent ? 'flex-end' : 'flex-start', gap: 4 }}>
                    <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                      {isAgent ? 'Agent' : m.senderName} آ· {new Date(m.sentAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{
                      maxWidth: '80%', padding: '10px 14px', borderRadius: 10, fontSize: 12.5,
                      background: isAgent ? 'var(--neon-dim)' : 'var(--bg3)',
                      color: isAgent ? 'var(--neon)' : 'var(--text2)',
                      border: `1px solid ${isAgent ? 'var(--neon)' : 'var(--border)'}`
                    }}>
                      {m.message ?? '—'}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Footer */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
              Created: {ticketDetail.createdAt ? new Date(ticketDetail.createdAt).toLocaleString() : '—'}
            </div>
          </div>
        </div>
      )}

      {/* 6B — Edit User Modal */}
      {showEditUserModal && (
        <div style={overlayStyle} onClick={() => { setShowEditUserModal(false); setEditUserErrors({}); }} role="dialog" aria-modal="true" aria-labelledby="edit-user-title">
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={mHeadStyle}>
              <span id="edit-user-title" style={{ fontSize: 15, fontWeight: 700 }}>Edit User Data</span>
              <button onClick={() => { setShowEditUserModal(false); setEditUserErrors({}); }} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 18, cursor: 'pointer', padding: '2px 6px', borderRadius: 4 }}>✕</button>
            </div>
            <div style={mBodyStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={lblStyle}>First Name</div>
                  <input style={{ ...inpStyle, borderColor: editUserErrors.firstName ? 'var(--red)' : '' }} value={editUserForm.firstName} onChange={(e) => setEditUserForm(prev => ({ ...prev, firstName: e.target.value }))} />
                  {editUserErrors.firstName && <div style={{ fontSize: 10, color: 'var(--red)', marginTop: 3 }}>{editUserErrors.firstName}</div>}
                </div>
                <div>
                  <div style={lblStyle}>Last Name</div>
                  <input style={{ ...inpStyle, borderColor: editUserErrors.lastName ? 'var(--red)' : '' }} value={editUserForm.lastName} onChange={(e) => setEditUserForm(prev => ({ ...prev, lastName: e.target.value }))} />
                  {editUserErrors.lastName && <div style={{ fontSize: 10, color: 'var(--red)', marginTop: 3 }}>{editUserErrors.lastName}</div>}
                </div>
              </div>
              <div>
                <div style={lblStyle}>Email Address</div>
                <input style={{ ...inpStyle, borderColor: editUserErrors.email ? 'var(--red)' : '' }} value={editUserForm.email} onChange={(e) => setEditUserForm(prev => ({ ...prev, email: e.target.value }))} />
                {editUserErrors.email && <div style={{ fontSize: 10, color: 'var(--red)', marginTop: 3 }}>{editUserErrors.email}</div>}
              </div>
              <div>
                <div style={lblStyle}>Phone Number</div>
                <input style={inpStyle} value={editUserForm.phone} onChange={(e) => setEditUserForm(prev => ({ ...prev, phone: e.target.value }))} />
              </div>
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
              <button style={btnGhost} onClick={() => { setShowEditUserModal(false); setEditUserErrors({}); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* 6C — Urgent Assign Modal */}
      {showUrgentModal && (
        <div style={overlayStyle} onClick={() => { setShowUrgentModal(false); setSelectedUrgent(null); setUrgentProvider(''); setUrgentNote(''); }} role="dialog" aria-modal="true" aria-labelledby="urgent-assign-title">
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={mHeadStyle}>
              <span id="urgent-assign-title" style={{ fontSize: 15, fontWeight: 700 }}>Assign Provider — Request #{selectedUrgent?.id || '---'}</span>
              <button onClick={() => { setShowUrgentModal(false); setSelectedUrgent(null); setUrgentProvider(''); setUrgentNote(''); }} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 18, cursor: 'pointer', padding: '2px 6px', borderRadius: 4 }}>✕</button>
            </div>
            <div style={mBodyStyle}>
              <div><div style={lblStyle}>User</div><input style={{ ...inpStyle, background: 'var(--bg3)', color: 'var(--text3)' }} value={selectedUrgent ? `${selectedUrgent.name} — ${selectedUrgent.type}` : '...'} readOnly /></div>
              <div><div style={lblStyle}>Location</div><input style={{ ...inpStyle, background: 'var(--bg3)', color: 'var(--text3)' }} value={selectedUrgent?.location || '...'} readOnly /></div>
              <div><div style={lblStyle}>Assign Service Provider</div>
                <select style={inpStyle} value={urgentProvider} onChange={(e) => setUrgentProvider(e.target.value)}>
                  <option value="">-- Select Provider --</option>
                  <option value="quickrescue">QuickRescue LLC ★4.9</option>
                  <option value="autofix">AutoFix Pro ★4.3</option>
                  <option value="megarecovery">MegaRecovery ★3.1</option>
                </select>
              </div>
              <div><div style={lblStyle}>Internal Note</div><textarea value={urgentNote} onChange={(e) => setUrgentNote(e.target.value)} style={{ ...inpStyle, resize: 'vertical', minHeight: 72 }} placeholder="Note for team..." /></div>
            </div>
            <div style={mFootStyle}>
              <button style={btnPrimary} onClick={handleConfirmUrgentAssign}>Confirm Assignment</button>
              <button style={btnGhost} onClick={() => setShowUrgentModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* 6D — Add Agent Modal */}
      {showAddAgentModal && (
        <div style={overlayStyle} onClick={() => { setShowAddAgentModal(false); setAddAgentErrors({}); }} role="dialog" aria-modal="true" aria-labelledby="add-agent-title">
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={mHeadStyle}>
              <span id="add-agent-title" style={{ fontSize: 15, fontWeight: 700 }}>Add CS Agent</span>
              <button onClick={() => { setShowAddAgentModal(false); setAddAgentErrors({}); }} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 18, cursor: 'pointer', padding: '2px 6px', borderRadius: 4 }}>✕</button>
            </div>
            <div style={mBodyStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={lblStyle}>First Name</div>
                  <input style={{ ...inpStyle, borderColor: addAgentErrors.name ? 'var(--red)' : '' }} value={addAgentForm.firstName} onChange={(e) => setAddAgentForm(prev => ({ ...prev, firstName: e.target.value }))} placeholder="Sarah" />
                  {addAgentErrors.name && <div style={{ fontSize: 10, color: 'var(--red)', marginTop: 3 }}>{addAgentErrors.name}</div>}
                </div>
                <div>
                  <div style={lblStyle}>Last Name</div>
                  <input style={inpStyle} value={addAgentForm.lastName} onChange={(e) => setAddAgentForm(prev => ({ ...prev, lastName: e.target.value }))} placeholder="Kamal" />
                </div>
              </div>
              <div>
                <div style={lblStyle}>Email Address</div>
                <input type="email" style={{ ...inpStyle, borderColor: addAgentErrors.email ? 'var(--red)' : '' }} value={addAgentForm.email} onChange={(e) => setAddAgentForm(prev => ({ ...prev, email: e.target.value }))} placeholder="agent@smarttraffic.io" />
                {addAgentErrors.email && <div style={{ fontSize: 10, color: 'var(--red)', marginTop: 3 }}>{addAgentErrors.email}</div>}
              </div>
              <div>
                <div style={lblStyle}>Password</div>
                <input type="password" style={{ ...inpStyle, borderColor: addAgentErrors.password ? 'var(--red)' : '' }} value={addAgentForm.password} onChange={(e) => setAddAgentForm(prev => ({ ...prev, password: e.target.value }))} placeholder="••••••••" />
                {addAgentErrors.password && <div style={{ fontSize: 10, color: 'var(--red)', marginTop: 3 }}>{addAgentErrors.password}</div>}
              </div>
            </div>
            <div style={mFootStyle}>
              <button style={btnPrimary} onClick={() => handleAddAgent(addAgentForm)}>Create</button>
              <button style={btnGhost} onClick={() => { setShowAddAgentModal(false); setAddAgentErrors({}); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* 6E — Reject Application Modal */}
      {showApprovalReviewModal && selectedApprovalReview && (
        <div style={overlayStyle} onClick={() => { setShowApprovalReviewModal(false); setSelectedApprovalReview(null); }} role="dialog" aria-modal="true" aria-labelledby="approval-review-title">
          <div style={{ ...modalStyle, width: 460 }} onClick={e => e.stopPropagation()}>
            <div style={mHeadStyle}>
              <span id="approval-review-title" style={{ fontSize: 15, fontWeight: 700 }}>Approval Review</span>
              <button onClick={() => { setShowApprovalReviewModal(false); setSelectedApprovalReview(null); }} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 18, cursor: 'pointer', padding: '2px 6px', borderRadius: 4 }}>X</button>
            </div>
            <div style={mBodyStyle}>
              {[
                ['ID', selectedApprovalReview.id ?? '—'],
                ['Name', selectedApprovalReview.name ?? '—'],
                ['Email', selectedApprovalReview.email ?? '—'],
                ['Phone', selectedApprovalReview.phone ?? '—'],
                ['Role', selectedApprovalReview.type ?? '—'],
                ['Specialty', selectedApprovalReview.service ?? '—'],
                ['Documents', selectedApprovalReview.docs ?? 0],
                ['Status', selectedApprovalReview.status ?? '—'],
                ['Registered', selectedApprovalReview.date ?? '—'],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text3)', fontSize: 12, fontFamily: 'var(--mono)' }}>{label}</span>
                  <span style={{ fontSize: 12.5, textAlign: 'right' }}>{val}</span>
                </div>
              ))}
            </div>
            <div style={mFootStyle}>
              <button style={btnGhost} onClick={() => { setShowApprovalReviewModal(false); setSelectedApprovalReview(null); }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 6E — Reject Application Modal */}
      {showRejectModal && (
        <div style={overlayStyle} onClick={() => { setShowRejectModal(false); setRejectReason(''); setRejectReasonError(''); }} role="dialog" aria-modal="true" aria-labelledby="reject-app-title">
          <div style={{ ...modalStyle, width: 420 }} onClick={e => e.stopPropagation()}>
            <div style={mHeadStyle}>
              <span id="reject-app-title" style={{ fontSize: 15, fontWeight: 700 }}>❌ Reject Application</span>
              <button onClick={() => { setShowRejectModal(false); setRejectReason(''); setRejectReasonError(''); }} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 18, cursor: 'pointer', padding: '2px 6px', borderRadius: 4 }}>✕</button>
            </div>
            <div style={mBodyStyle}>
              <div style={{ fontSize: 12.5, color: 'var(--text2)', background: 'rgba(255,61,87,0.07)', border: '1px solid rgba(255,61,87,0.2)', borderRadius: 8, padding: '10px 14px' }}>
                This action will reject the application and notify the applicant.
              </div>
              <div>
                <div style={lblStyle}>Rejection Reason <span style={{ color: 'var(--red)' }}>*</span></div>
                <textarea
                  style={{ ...inpStyle, resize: 'vertical', minHeight: 90, borderColor: rejectReasonError ? 'var(--red)' : '' }}
                  value={rejectReason}
                  onChange={e => { setRejectReason(e.target.value); if (rejectReasonError) setRejectReasonError(''); }}
                  placeholder="Explain why this application is being rejected..."
                />
                {rejectReasonError && <div style={{ fontSize: 10, color: 'var(--red)', marginTop: 3 }}>{rejectReasonError}</div>}
              </div>
            </div>
            <div style={mFootStyle}>
              <button style={{ ...btnPrimary, background: 'var(--red)', color: '#fff' }} onClick={handleConfirmReject}>Confirm Reject</button>
              <button style={btnGhost} onClick={() => { setShowRejectModal(false); setRejectReason(''); setRejectReasonError(''); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Admin;
