// Provider
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import UserDetailModal from '../components/UserDetailModal';
import TopBar from '../components/TopBar';
import useModal from '../hooks/useModal';
import { useTranslation } from '../i18n/LanguageContext';
import * as providerService from '../api/services/providerService';
import * as authService from '../api/services/authService';

const Provider = () => {
  const showToast = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState('dashboard');
  const [clock, setClock] = useState('');

  const [dashboardData, setDashboardData] = useState(null);   
  const [activeMission, setActiveMission] = useState(null);    
  const [earningsData, setEarningsData] = useState(null);      
  const [historyData, setHistoryData] = useState([]);          
  const [profileData, setProfileData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [tabLoading, setTabLoading] = useState(false);
  const [tabError, setTabError] = useState('');
  const [tabErrorType, setTabErrorType] = useState('');
  const loadedTabs = useRef(new Set());
  const { isOpen: isUserModalOpen, selected: selectedUser, openModal: openUserModal, closeModal: closeUserModal } = useModal();
  const getEmailInitials = (email) => (email ? email.slice(0, 2).toUpperCase() : 'PR');

  const fetchTab = async (view, force = false) => {
    if (!force && loadedTabs.current.has(view)) return;
    setTabLoading(true);
    setTabError('');
    setTabErrorType('');
    try {
      if (view === 'dashboard') {
        const dash = await providerService.getDashboard();
        setDashboardData(dash);
      } else if (view === 'active') {
        const active = await providerService.getActiveMission();
        setActiveMission(active);
      } else if (view === 'earnings') {
        const earnings = await providerService.getEarnings();
        setEarningsData(earnings);
      } else if (view === 'history') {
        const history = await providerService.getHistory();
        setHistoryData(history);
      } else if (view === 'profile') {
        const profile = await providerService.getProfile();
        setProfileData(profile);
      }
      loadedTabs.current.add(view);
    } catch (err) {
      const errMsg = String(err?.message || '');
      const is500 = err?.status === 500 || errMsg.includes('500');
      const isNoInternet =
        navigator.onLine === false ||
        errMsg.toLowerCase().includes('failed to fetch') ||
        errMsg.toLowerCase().includes('networkerror') ||
        errMsg.toLowerCase().includes('network request failed');

      if (isNoInternet) {
        setTabError('no internet');
        setTabErrorType('offline');
      } else if (is500 || errMsg.includes('is not a function')) {
        setTabError('server error 500');
        setTabErrorType('server500');
      } else {
        setTabError('server error 500');
        setTabErrorType('server500');
      }
    } finally {
      setTabLoading(false);
    }
  };

  const openWifiSettings = () => {
    try {
      window.location.href = 'ms-settings:network-wifi';
    } catch {
      showToast('Open Wi-Fi settings from your device', 'err');
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const me = await authService.getMe();
        const email = me?.email || 'provider@test.com';
        setCurrentUser({
          ...(me || {}),
          id: me?.id || 'PRV-001',
          name: me?.name || `${me?.firstName || ''} ${me?.lastName || ''}`.trim() || 'Quick Rescue',
          role: me?.role || 'Service Provider',
          email,
          phone: me?.phoneNumber || me?.phone || '+20 100 111 2222',
          status: 'Active',
          date: me?.date || 'January 2024',
          initials: getEmailInitials(email),
        });
      } catch {
        const email = 'provider@test.com';
        setCurrentUser({ id: 'PRV-001', name: 'Quick Rescue', role: 'Service Provider', email, phone: '+20 100 111 2222', status: 'Active', date: 'January 2024', initials: getEmailInitials(email) });
      }
    };
    loadProfile();
    fetchTab('dashboard');
  }, []);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-US'));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleCallDriver = async () => {
    try { await providerService.callDriver(); showToast('Calling...', 'ok'); } catch { showToast('Failed', 'err'); }
  };
  const handleSOS = async () => {
    try { await providerService.sendSOS(); showToast('SOS signal sent', 'ok'); } catch { showToast('Failed', 'err'); }
  };
  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  const sidebarItems = [
    { key: 'dashboard', icon: '📊', label: t('provider.tabs.dashboard') },
    { key: 'active',    icon: '🚗', label: t('provider.tabs.mission'), badge: 1, badgeColor: 'var(--amber)' },
    { key: 'earnings',  icon: '💰', label: t('provider.tabs.earnings') },
    { key: 'history',   icon: '🕒', label: t('provider.tabs.history') },
    { key: 'profile',   icon: '🛠', label: t('provider.tabs.profile') },
  ];

  return (
    <>
             <TopBar
          title={<h1 style={{fontFamily: 'var(--head), sans-serif', fontSize: 'clamp(1.7rem,4vw,2.3rem)', fontWeight: 700, margin: 0, color: 'var(--text)'}}>{t('provider.title')}</h1>}
        onLogout={handleLogout}
        showLogout={true}
       
      />
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', height: '100vh', overflow: 'hidden', marginTop: 'clamp(52px, 6vw, 70px)' }}>
      {/* ICON SIDEBAR */}
      <aside style={{
        background: 'var(--bg2)', borderInlineEnd: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '14px 10px', gap: 6, overflow: 'hidden',
      }}>
        <div style={{
          width: 40, height: 40, background: 'var(--neon)', borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--head)', fontSize: 22, color: '#000',
          boxShadow: '0 0 20px var(--neon-glow)', marginBottom: 8, flexShrink: 0,
        }}>ST</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, paddingInlineEnd: 4, marginBottom: 10 }}>
            <div style={{ fontFamily: 'var(--head)', fontSize: 15, color: 'var(--text)' }}>Smart Traffic</div>
            <div style={{ fontSize: 10.5, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>PROVIDER PORTAL</div>
          </div>
        <div style={{ width: 32, height: 1, background: 'var(--border)', margin: '4px 0' }} />

        {sidebarItems.map(item => (
          <div key={item.key} onClick={() => { setActiveView(item.key); fetchTab(item.key); }} style={{
            width: '100%', height: 44, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 10,
            cursor: 'pointer', transition: 'all .15s', position: 'relative', fontSize: 20,
            color: activeView === item.key ? 'var(--neon)' : 'var(--text3)',
            background: activeView === item.key ? 'var(--neon-dim)' : 'transparent',
            padding: '0 10px',
          }}>
            {item.icon}
            <span style={{ fontSize: 14, fontFamily: 'var(--head)' }}>{item.label}</span>
            {item.badge && (
              <span style={{
                position: 'absolute', top: 4, insetInlineEnd: 4, width: 16, height: 16, borderRadius: '50%',
                background: item.badgeColor || 'var(--red)', color: item.badgeColor ? '#000' : '#fff',
                fontSize: 9, fontFamily: 'var(--mono)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{item.badge}</span>
            )}
            {activeView === item.key && <div style={{
              position: 'absolute', insetInlineEnd: 0, top: '50%', transform: 'translateY(-50%)',
              width: 3, height: '60%', background: 'var(--neon)', borderStartStartRadius: 2, borderEndStartRadius: 2,
              boxShadow: '0 0 6px var(--neon-glow)',
            }} />}
          </div>
        ))}

      </aside>

      {/* MAIN */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* TOPBAR */}
        <div style={{
          height: 54, minHeight: 54, background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', padding: '0 20px', gap: 14,
        }}>
          <h1 style={{ fontFamily: 'var(--head)', fontSize: 24, letterSpacing: 1, flex: 1, margin: 0 }}>
            Service <span style={{ color: 'var(--neon)' }}>Provider</span>
            <small style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--mono)', fontWeight: 400, marginInlineStart: 8 }}>Quick Rescue</small>
          </h1>
          <div
            onClick={() => currentUser && openUserModal(currentUser)}
            title={currentUser?.email || ''}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg,var(--neon),#2eff80)', color: '#000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800, fontFamily: 'var(--mono)',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            {getEmailInitials(currentUser?.email)}
          </div>
    
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{clock}</span>
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
          {tabLoading && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 50, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: 'rgba(4,7,12,0.75)', backdropFilter: 'blur(4px)'
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                border: '3px solid var(--border)', borderTop: '3px solid var(--neon)',
                animation: 'spin 0.8s linear infinite'
              }} />
            </div>
          )}
          {tabError && !tabLoading && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 60,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(4,7,12,0.45)',
            }}>
              <div style={{
              width: 320, display: 'flex', flexDirection: 'column', gap: 10,
              background: 'var(--card2)', border: '1px solid var(--border2)',
              borderRadius: 10, padding: 12, boxShadow: '0 10px 26px rgba(0,0,0,.45)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>⚠</span>
                <span style={{ color: 'var(--red)', fontFamily: 'var(--mono)', fontSize: 12 }}>{tabError}</span>
              </div>
              {tabErrorType === 'offline' ? (
                <button className="btn btn-neon" onClick={openWifiSettings} style={{ cursor: 'pointer' }}>
                  Open Wi-Fi
                </button>
              ) : (
                <button className="btn btn-neon" onClick={() => { loadedTabs.current.delete(activeView); fetchTab(activeView, true); }} style={{ cursor: 'pointer' }}>
                  Retry
                </button>
              )}
              </div>
            </div>
          )}
          {activeView === 'dashboard' && (
            <>
              {/* Stats  */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                {(dashboardData?.stats || []).map(s => (
                  <div key={s.label} style={{
                    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px',
                    transition: 'all .18s', cursor: 'default',
                  }}>
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
                    <div style={{ fontSize: 9.5, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontFamily: 'var(--head)', fontSize: 30, letterSpacing: 1, lineHeight: 1, marginBottom: 4, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.delta}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Map */}
                  <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--head)', fontSize: 16 }}>📍 Current Location</span>
                      <span className="badge b-online" style={{ fontSize: 10 }}>Tracking Active</span>
                    </div>
                    <div style={{
                      height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative', overflow: 'hidden', background: 'var(--bg3)',
                      backgroundImage: 'linear-gradient(rgba(170,255,0,.03) 1px,transparent 1px), linear-gradient(90deg,rgba(170,255,0,.03) 1px,transparent 1px)',
                      backgroundSize: '30px 30px',
                    }}>
                      <div style={{
                        width: 16, height: 16, background: 'var(--neon)', borderRadius: '50%',
                        boxShadow: '0 0 0 0 var(--neon-glow)', animation: 'mapPulse 2s infinite',
                        position: 'absolute',
                      }} />
                      <div style={{ textAlign: 'center', zIndex: 1 }}>
                        <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>New Cairo آ· 6th Settlement</p>
                      </div>
                      <div style={{
                        position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
                        fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--neon)',
                        background: 'var(--neon-dim)', border: '1px solid rgba(170,255,0,.2)',
                        padding: '3px 12px', borderRadius: 4, letterSpacing: 1,
                      }}>📍 Live Location Active</div>
                    </div>
                  </div>

                  {/* Weekly Earnings Chart */}
                  <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--head)', fontSize: 16 }}>Weekly Earnings (EGP)</span>
                      <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--neon)' }}>
                        This Month: {earningsData?.thisMonth ?? '—'}
                      </span>
                    </div>
                    <div style={{ padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 90 }}>
                        {(earningsData?.weekly || []).map(d => (
                          <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                            <span style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{d.label}</span>
                            <div style={{
                              width: '100%', borderRadius: '3px 3px 0 0',
                              height: `${Math.max(d.heightPct, 4)}%`,
                              background: d.amount > 0 ? 'var(--neon)' : 'var(--border2)',
                              minHeight: 3, transition: 'height .3s',
                            }} />
                            <span style={{ fontSize: 9, fontFamily: 'var(--mono)', color: d.amount > 0 ? 'var(--neon)' : 'var(--text3)' }}>{d.day}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column*/}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                  {/* Earnings summary card */}
                  <div style={{ background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 10, padding: 20 }}>
                    <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 12 }}>EARNINGS SUMMARY</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {[
                        { label: 'Total All Time', val: earningsData?.total ?? '—', color: 'var(--neon)' },
                        { label: 'This Month',     val: earningsData?.thisMonth ?? '—', color: 'var(--emerald)' },
                        { label: 'Last Month',     val: earningsData?.lastMonth ?? '—', color: 'var(--text2)' },
                      ].map(row => (
                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                          <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{row.label}</span>
                          <span style={{ fontFamily: 'var(--head)', fontSize: 20, color: row.color }}>{row.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Jobs breakdown from dashboard */}
                  <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
                    <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 12 }}>JOBS BREAKDOWN</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        { label: 'Total Jobs',    val: dashboardData?.raw?.totalJobs     ?? '—', color: 'var(--neon)'     },
                        { label: 'Completed',     val: dashboardData?.raw?.completedJobs ?? '—', color: 'var(--emerald)'  },
                        { label: 'Active Now',    val: dashboardData?.raw?.activeJobs    ?? '—', color: 'var(--amber)'    },
                      ].map(row => (
                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{row.label}</span>
                          <span style={{ fontFamily: 'var(--head)', fontSize: 22, color: row.color }}>{row.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active mission quick-peek */}
                  {activeMission && (
                    <div style={{ background: 'var(--card2)', border: '1px solid var(--amber)', borderRadius: 10, padding: 16 }}>
                      <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--amber)', letterSpacing: 2, marginBottom: 8 }}>ACTIVE MISSION</div>
                      <div style={{ fontFamily: 'var(--head)', fontSize: 16, marginBottom: 4 }}>{activeMission.type}</div>
                      <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', marginBottom: 4 }}>ID: {activeMission.shortId}</div>
                      <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>📍 {activeMission.coords}</div>
                      <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8 }}>🕒 {activeMission.date} {activeMission.time}</div>
                      <span className={`badge ${activeMission.badgeClass}`}>{activeMission.status}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeView === 'active' && (
            <div style={{ background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 10, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 12, left: 14, fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 2, color: 'var(--neon)', background: 'var(--neon-dim)', padding: '2px 8px', borderRadius: 3 }}>ACTIVE MISSION</div>

              {!activeMission ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 20 }}>
                  No active mission at the moment.
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 14, marginTop: 20 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--bg3)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>🚗</div>
                    <div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 3 }}>{activeMission.shortId}</div>
                      <div style={{ fontFamily: 'var(--head)', fontSize: 22, letterSpacing: .5, marginBottom: 4 }}>{activeMission.type}</div>
                      <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>
                        Client: {activeMission.clientName} آ· {activeMission.clientPhone}
                      </div>
                      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                        <span className={`badge ${activeMission.badgeClass}`}>{activeMission.status}</span>
                        <span className="badge b-otw">Service Type {activeMission.serviceType}</span>
                      </div>
                    </div>
                  </div>

                  {/* All API fields in stat cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 14 }}>
                    {[
                      { val: activeMission.shortId,    label: 'Request ID' },
                      { val: activeMission.coords,     label: 'GPS Coords' },
                      { val: activeMission.date,       label: 'Date' },
                      { val: activeMission.time,       label: 'Time' },
                    ].map(s => (
                      <div key={s.label} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--head)', fontSize: 14, letterSpacing: .5, color: 'var(--neon)', wordBreak: 'break-all' }}>{s.val || '—'}</div>
                        <div style={{ fontSize: 9.5, fontFamily: 'var(--mono)', color: 'var(--text3)', marginTop: 4 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Client info row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    {[
                      { val: activeMission.clientName,  label: 'Client Name',  icon: '👤' },
                      { val: activeMission.clientPhone, label: 'Client Phone', icon: '📞' },
                    ].map(s => (
                      <div key={s.label} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 20 }}>{s.icon}</span>
                        <div>
                          <div style={{ fontSize: 9.5, fontFamily: 'var(--mono)', color: 'var(--text3)', marginBottom: 2 }}>{s.label}</div>
                          <div style={{ fontFamily: 'var(--head)', fontSize: 15, color: 'var(--text)' }}>{s.val || 'N/A'}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Progress Steps */}
                  <div style={{ display: 'flex', gap: 0, marginBottom: 14 }}>
                    {['Accepted', 'En Route', 'Arrived', 'Working', 'Complete'].map((step, i) => (
                      <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                        {i < 4 && <div style={{ position: 'absolute', top: 10, right: '50%', width: '100%', height: 2, background: i < 2 ? 'var(--neon)' : 'var(--border2)', zIndex: 0 }} />}
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%',
                          border: `2px solid ${i < 2 ? 'var(--neon)' : i === 2 ? 'var(--neon)' : 'var(--border2)'}`,
                          background: i < 2 ? 'var(--neon)' : 'var(--bg)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 9, fontFamily: 'var(--mono)', color: i < 2 ? '#000' : 'var(--text3)',
                          zIndex: 1, position: 'relative',
                          animation: i === 2 ? 'stepPulse 1.5s infinite' : 'none',
                        }}>{i < 2 ? '✓' : i + 1}</div>
                        <div style={{ fontSize: 9, fontFamily: 'var(--mono)', color: i <= 2 ? 'var(--neon)' : 'var(--text3)', marginTop: 5, textAlign: 'center' }}>{step}</div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button className="btn btn-neon" style={{ flex: 1, justifyContent: 'center', padding: 11, fontFamily: 'var(--head)', fontSize: 17 }}
                      onClick={() => { providerService.updateStatus('arrived'); showToast('Status updated -> Arrived', 'ok'); }}>📍 Arrived</button>
                    <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', padding: 11 }}
                      onClick={handleCallDriver}>📞 Call Client</button>
                    <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center', padding: 11 }}
                      onClick={handleSOS}>🆘 SOS</button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeView === 'earnings' && (
            <>
              {/* Main earnings hero card */}
              <div style={{
                background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 10,
                padding: 24, display: 'flex', alignItems: 'center', gap: 24, position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 2, marginBottom: 6 }}>Total Earnings (All Time)</div>
                  <div style={{ fontFamily: 'var(--head)', fontSize: 52, letterSpacing: 2, color: 'var(--neon)', lineHeight: 1, marginBottom: 6 }}>{earningsData?.total || '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>Currency: {earningsData?.currency || 'EGP'}</div>
                </div>
                <div style={{ display: 'flex', gap: 20 }}>
                  {[
                    { val: earningsData?.thisMonth || '—', label: 'This Month' },
                    { val: earningsData?.lastMonth || '—', label: 'Last Month' },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--head)', fontSize: 26, letterSpacing: .5 }}>{s.val}</div>
                      <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly bar chart  from earnings.weekly[] */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
                <div style={{ fontFamily: 'var(--head)', fontSize: 16, marginBottom: 16 }}>Weekly Breakdown (EGP)</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
                  {(earningsData?.weekly || []).map(d => (
                    <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: d.amount > 0 ? 'var(--neon)' : 'var(--text3)' }}>{d.label}</span>
                      <div style={{
                        width: '100%', borderRadius: '4px 4px 0 0',
                        height: `${Math.max(d.heightPct, 4)}%`,
                        background: d.amount > 0
                          ? 'linear-gradient(to top, var(--neon), rgba(170,255,0,.4))'
                          : 'var(--border2)',
                        minHeight: 4, transition: 'height .3s',
                        boxShadow: d.amount > 0 ? '0 0 8px var(--neon-glow)' : 'none',
                      }} />
                      <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: d.amount > 0 ? 'var(--neon)' : 'var(--text3)', fontWeight: d.amount > 0 ? 700 : 400 }}>{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {(activeView === 'history' || activeView === 'profile') && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
              <div style={{ fontFamily: 'var(--head)', fontSize: 20, marginBottom: 16 }}>
                {activeView === 'history' ? '📋 Job History' : '🛠 Provider Profile'}
              </div>
              {activeView === 'history' && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%', borderCollapse: 'collapse', background: 'var(--bg)', borderRadius: 8, overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}>
                    <thead>
                      <tr style={{ background: 'var(--bg2)' }}>
                        {['Request ID', 'Service Type', 'Status', 'Estimated Cost', 'Date', 'Time'].map(col => (
                          <th key={col} style={{ padding: '12px 16px', textAlign: 'center', fontFamily: 'var(--head)', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(historyData || []).length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>No job history found.</td>
                        </tr>
                      ) : (historyData || []).map(h => (
                        <tr key={h.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 16px', textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--text3)', fontSize: 11 }}>{h.shortId}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text)' }}>{h.type}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <span className={`badge ${h.badgeClass}`}>{h.status}</span>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--neon)', fontFamily: 'var(--mono)' }}>{h.fare}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text2)', fontFamily: 'var(--mono)', fontSize: 11 }}>{h.date}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 11 }}>{h.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {activeView === 'profile' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12 }}>
                  {[
                    { label: 'Name', value: profileData?.name || '—' },
                    { label: 'Email', value: profileData?.email || '—' },
                    { label: 'Phone', value: profileData?.phone || '—' },
                    { label: 'Rating', value: profileData?.rating ?? 0 },
                    { label: 'Total Jobs', value: profileData?.totalJobs ?? 0 },
                    { label: 'Status', value: (profileData?.isOnline ?? true) ? 'Online' : 'Offline' },
                  ].map((item) => (
                    <div key={item.label} style={{
                      background: 'var(--bg2)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      padding: '12px 14px',
                    }}>
                      <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', marginBottom: 4 }}>
                        {item.label}
                      </div>
                      <div style={{ color: 'var(--text)', fontFamily: 'var(--head)', fontSize: 16, wordBreak: 'break-word' }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
      <UserDetailModal open={isUserModalOpen} onClose={closeUserModal} user={selectedUser} />
    </>
  );
};

export default Provider;
