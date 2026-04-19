// STEP 5/6 DONE — Provider.jsx (Arabic RTL) — API-driven
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import TopBar from '../components/TopBar';
import UserDetailModal from '../components/UserDetailModal';
import useModal from '../hooks/useModal';
import * as providerService from '../api/services/providerService';
import * as authService from '../api/services/authService';

const Provider = () => {
  const showToast = useToast();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [isOnline, setIsOnline] = useState(true);
  const [clock, setClock] = useState('');

  // ── Data state (service-driven) ──
  const [dashboardData, setDashboardData] = useState(null);
  const [weeklyEarnings, setWeeklyEarnings] = useState([]);
  const [locationData, setLocationData] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [ratingsData, setRatingsData] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [requestsStats, setRequestsStats] = useState([]);
  const [activeMission, setActiveMission] = useState(null);
  const [earningsData, setEarningsData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [vehicleData, setVehicleData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const { isOpen: isUserModalOpen, selected: selectedUser, openModal: openUserModal, closeModal: closeUserModal } = useModal();

  // ── Load data from service ──
  useEffect(() => {
    const loadAll = async () => {
      setDataLoading(true);
      try {
        const [dash, weekly, loc, schedule, notifs, ratings, pending, reqStats, active, earnings, history, vehicle] = await Promise.all([
          providerService.getDashboard(),
          providerService.getEarningsWeekly(),
          providerService.getLocation(),
          providerService.getSchedule(),
          providerService.getNotifications(),
          providerService.getRatings(),
          providerService.getPendingRequests(),
          providerService.getRequestsStats(),
          providerService.getActiveMission(),
          providerService.getEarnings(),
          providerService.getHistory(),
          providerService.getVehicle(),
        ]);
        setDashboardData(dash);
        setWeeklyEarnings(weekly);
        setLocationData(loc);
        setScheduleData(schedule);
        setNotifications(notifs);
        setRatingsData(ratings);
        setPendingRequests(pending);
        setRequestsStats(reqStats);
        setActiveMission(active);
        setEarningsData(earnings);
        setHistoryData(history);
        setVehicleData(vehicle);
        const me = await authService.getMe();
        setCurrentUser(me || { id: 'PRV-001', name: 'Quick Rescue', role: 'Service provider', email: 'provider@test.com', phone: '+20 100 111 2222', status: 'Active', date: 'January 2024', initials: 'QR' });
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

  // ── Action handlers ──
  const handleAcceptRequest = async (id) => {
    try { await providerService.acceptRequest(id); showToast('Request accepted ✓', 'ok'); } catch { showToast('Failed to accept request', 'err'); }
  };
  const handleRejectRequest = async (id) => {
    try { await providerService.rejectRequest(id); showToast('Request rejected', 'ok'); } catch { showToast('Failed to reject request', 'err'); }
  };
  const handleToggleOnline = async () => {
    const newVal = !isOnline;
    try { await providerService.toggleOnline(newVal); setIsOnline(newVal); showToast(newVal ? 'You are online' : 'You are offline', 'ok'); } catch { showToast('Failed to change status', 'err'); }
  };
  const handleCallDriver = async () => {
    try { await providerService.callDriver(); showToast('Connecting…', 'ok'); } catch { showToast('Failed to connect', 'err'); }
  };
  const handleSOS = async () => {
    try { await providerService.sendSOS(); showToast('SOS sent', 'ok'); } catch { showToast('Failed to send SOS', 'err'); }
  };
  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  const sidebarItems = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard' },
    { key: 'requests', icon: '📋', label: 'Requests', badge: pendingRequests.length || 3 },
    { key: 'active', icon: '🚗', label: 'Active mission', badge: 1, badgeColor: 'var(--amber)' },
    { key: 'earnings', icon: '💰', label: 'Earnings' },
    { key: 'history', icon: '🕐', label: 'History' },
    { key: 'vehicle', icon: '🚛', label: 'Vehicle & documents' },
  ];

  return (
    <>
      <TopBar
          title={<h1 style={{fontFamily: 'Cairo, var(--head), sans-serif', fontSize: 'clamp(1.7rem,4vw,2.3rem)', fontWeight: 700, margin: 0, color: 'var(--text)'}}>Service Provider Portal</h1>}
        onLogout={handleLogout}
        showLogout={true}
        profileUser={currentUser}
        onProfileClick={() => currentUser && openUserModal(currentUser)}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', height: '100vh', overflow: 'hidden', direction: 'ltr', marginTop: 'clamp(52px, 6vw, 70px)' }}>
      {/* ICON SIDEBAR */}
      <aside style={{
        background: 'var(--bg2)', borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '14px 10px', gap: 6, overflow: 'hidden',
      }}>
        <div style={{
          width: 40, height: 40, background: 'var(--neon)', borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--head)', fontSize: 22, color: '#000',
          boxShadow: '0 0 20px var(--neon-glow)', marginBottom: 8, flexShrink: 0,
        }}>ST</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, paddingRight: 4, marginBottom: 10 }}>
            <div style={{ fontFamily: 'var(--head)', fontSize: 15, color: 'var(--text)' }}>Smart Traffic</div>
            <div style={{ fontSize: 10.5, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>Service Provider Portal</div>
          </div>
        <div style={{ width: 32, height: 1, background: 'var(--border)', margin: '4px 0' }} />

        {sidebarItems.map(item => (
          <div key={item.key} onClick={() => setActiveView(item.key)} style={{
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
                position: 'absolute', top: 4, right: 4, width: 16, height: 16, borderRadius: '50%',
                background: item.badgeColor || 'var(--red)', color: item.badgeColor ? '#000' : '#fff',
                fontSize: 9, fontFamily: 'var(--mono)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{item.badge}</span>
            )}
            {activeView === item.key && <div style={{
              position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
              width: 3, height: '60%', background: 'var(--neon)', borderRadius: '2px 0 0 2px',
              boxShadow: '0 0 6px var(--neon-glow)',
            }} />}
          </div>
        ))}

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg,var(--neon),#44ff88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 13, color: '#000', cursor: 'pointer',
          }}>QR</div>
        </div>
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
            <small style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--mono)', fontWeight: 400, marginRight: 8 }}>Quick Rescue</small>
          </h1>
          <div onClick={() => { setIsOnline(!isOnline); showToast(isOnline ? 'You are offline now' : 'You are online now', isOnline ? 'err' : 'ok'); }} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: isOnline ? 'var(--neon-dim)' : 'var(--red-dim)',
            border: `1px solid ${isOnline ? 'rgba(170,255,0,.2)' : 'rgba(255,45,72,.2)'}`,
            borderRadius: 10, padding: '8px 16px', cursor: 'pointer', transition: 'all .2s',
          }}>
            <div style={{
              width: 12, height: 12, borderRadius: '50%',
              background: isOnline ? 'var(--neon)' : 'var(--red)',
              boxShadow: `0 0 8px ${isOnline ? 'var(--neon-glow)' : 'rgba(255,45,72,.4)'}`,
              animation: 'pulse 1.8s infinite',
            }} />
            <div>
              <div style={{ fontFamily: 'var(--head)', fontSize: 16, letterSpacing: 1, color: isOnline ? 'var(--neon)' : 'var(--red)' }}>
                {isOnline ? 'Online' : 'Offline'}
              </div>
              <div style={{ fontSize: 9.5, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>
                {isOnline ? 'Receiving requests' : 'Paused'}
              </div>
            </div>
          </div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{clock}</span>
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {activeView === 'dashboard' && (
            <>
              {/* Stats */}
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
                      <span style={{ fontFamily: 'var(--head)', fontSize: 16 }}>📍 Current location</span>
                      <span className="badge b-online" style={{ fontSize: 10 }}>Tracking enabled</span>
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
                        <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>New Cairo · Sixth Settlement</p>
                      </div>
                      <div style={{
                        position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
                        fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--neon)',
                        background: 'var(--neon-dim)', border: '1px solid rgba(170,255,0,.2)',
                        padding: '3px 12px', borderRadius: 4, letterSpacing: 1,
                      }}>📍 Live location active</div>
                    </div>
                  </div>

                  {/* Weekly Chart */}
                  <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'var(--head)', fontSize: 16 }}>Weekly earnings (EGP)</span>
                    </div>
                    <div style={{ padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 90 }}>
                        {weeklyEarnings.map(d => (
                          <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                            <span style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{d.val}</span>
                            <div style={{ width: '100%', height: `${d.pct}%`, borderRadius: '3px 3px 0 0', background: 'var(--neon)', opacity: d.pct / 100 * 0.5 + 0.5, minHeight: 3 }} />
                            <span style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{d.day}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Rating */}
                  <div style={{ background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 10, padding: 20, textAlign: 'center' }}>
                    <div style={{ fontSize: 26, letterSpacing: 3, marginBottom: 4, color: 'var(--amber)' }}>★★★★★</div>
                    <div style={{ fontFamily: 'var(--head)', fontSize: 48, color: 'var(--amber)', letterSpacing: 2, lineHeight: 1, marginBottom: 4 }}>{ratingsData?.average ?? '—'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>{ratingsData?.total ?? 0} total ratings</div>
                    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {(ratingsData?.breakdown || []).map(r => (
                        <div key={r.star} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontFamily: 'var(--mono)' }}>
                          <span style={{ color: 'var(--amber)', width: 20, textAlign: 'left' }}>{r.star}</span>
                          <div style={{ flex: 1, height: 5, background: 'var(--bg2)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${r.pct}%`, borderRadius: 2, background: r.pct > 50 ? 'var(--neon)' : r.pct > 10 ? 'var(--amber)' : 'var(--text3)' }} />
                          </div>
                          <span style={{ color: 'var(--text3)', width: 20 }}>{r.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Schedule */}
                  <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'var(--head)', fontSize: 16 }}>This week</span>
                      <button className="btn btn-ghost btn-sm" onClick={() => showToast('Schedule editor', 'ok')}>Edit</button>
                    </div>
                    <div style={{ padding: 12 }}>
                      <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
                        {(scheduleData || []).map(d => (
                          <div key={d.name} style={{
                            minWidth: 70, borderRadius: 6, border: `1px solid ${d.today ? 'rgba(170,255,0,.3)' : 'var(--border)'}`,
                            background: d.today ? 'var(--neon-dim)' : 'var(--bg3)',
                            padding: '10px 8px', textAlign: 'center', cursor: 'pointer',
                            opacity: d.off ? .4 : 1,
                          }}>
                            <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1, marginBottom: 4 }}>{d.name}</div>
                            <div style={{ fontFamily: 'var(--head)', fontSize: 20, letterSpacing: .5, marginBottom: 4, color: d.today ? 'var(--neon)' : 'inherit' }}>{d.date}</div>
                            <div style={{ fontSize: 9, fontFamily: 'var(--mono)', color: d.today ? 'var(--neon)' : 'var(--text3)' }}>{d.status}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'var(--head)', fontSize: 16 }}>Notifications</span>
                    </div>
                    {(notifications || []).map((n, i) => (
                      <div key={i} style={{ display: 'flex', gap: 11, padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background .12s' }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: n.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{n.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{n.text}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--text3)' }}>{n.sub}</div>
                        </div>
                        <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', whiteSpace: 'nowrap' }}>{n.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeView === 'requests' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                {(requestsStats || []).map(s => (
                  <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
                    <div style={{ fontSize: 9.5, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontFamily: 'var(--head)', fontSize: 30, color: s.color, lineHeight: 1 }}>{s.val}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ fontFamily: 'var(--head)', fontSize: 16 }}>📋 Pending requests</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                    {pendingRequests.length ? `${pendingRequests.length} pending request${pendingRequests.length > 1 ? 's' : ''}` : 'No pending requests'}
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  {(pendingRequests || []).length ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                      <thead>
                        <tr style={{ background: 'var(--bg2)' }}>
                          {['#', 'Request type', 'Location', 'Driver', 'Distance', 'Price', 'Actions'].map((col) => (
                            <th key={col} style={{ padding: '12px 16px', textAlign: 'center', fontFamily: 'var(--head)', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pendingRequests.map((r, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background .15s' }}>
                            <td style={{ padding: '12px 16px', textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--text3)' }}>#{i + 1}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text)' }}>{r.type}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text2)' }}>{r.loc}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text)' }}>{r.driver}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text2)' }}>{r.dist}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--neon)', fontFamily: 'var(--mono)' }}>{r.price}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <button className="btn btn-neon" onClick={() => handleAcceptRequest(r.id ?? i)}>Accept</button>
                                <button className="btn btn-ghost" onClick={() => handleRejectRequest(r.id ?? i)}>Reject</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ padding: '18px 16px', color: 'var(--text3)', fontFamily: 'var(--mono)', textAlign: 'center' }}>No pending requests right now.</div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeView === 'active' && (
            <div style={{ background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 10, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 12, left: 14, fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 2, color: 'var(--neon)', background: 'var(--neon-dim)', padding: '2px 8px', borderRadius: 3 }}>Active mission</div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 14, marginTop: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--bg3)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>🚗</div>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 3 }}>{activeMission?.reqId || 'REQ-0000'}</div>
                  <div style={{ fontFamily: 'var(--head)', fontSize: 22, letterSpacing: .5, marginBottom: 4 }}>{activeMission?.type || '—'}</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>Driver: {activeMission?.driver || '—'} · {activeMission?.phone || '—'}</div>
                  <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                    <span className="badge b-active">Active</span>
                    <span className="badge b-otw">In transit</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 14 }}>
                {[
                  { val: activeMission?.distance || '—', label: 'Distance' },
                  { val: activeMission?.eta || '—', label: 'Remaining time' },
                  { val: activeMission?.fare || '—', label: 'Fare' },
                  { val: activeMission?.driverRating || '—', label: 'Driver rating' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--head)', fontSize: 20, letterSpacing: .5, color: 'var(--neon)' }}>{s.val}</div>
                    <div style={{ fontSize: 9.5, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Progress Steps */}
              <div style={{ display: 'flex', gap: 0, marginBottom: 14 }}>
                {(activeMission?.steps || ['Accepted', 'En route', 'Arrived', 'In progress', 'Completed']).map((step, i) => (
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
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn btn-neon" style={{ flex: 1, justifyContent: 'center', padding: 11, fontFamily: 'var(--head)', fontSize: 17 }} onClick={() => showToast('Status updated', 'ok')}>📍 Arrived</button>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', padding: 11 }} onClick={() => showToast('Connecting…', 'ok')}>📞 Call driver</button>
                <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center', padding: 11 }} onClick={() => showToast('SOS request sent', 'err')}>🆘 SOS</button>
              </div>
            </div>
          )}

          {activeView === 'earnings' && (
            <>
              <div style={{
                background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 10,
                padding: 24, display: 'flex', alignItems: 'center', gap: 24, position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 2, marginBottom: 6 }}>Total earnings</div>
                  <div style={{ fontFamily: 'var(--head)', fontSize: 52, letterSpacing: 2, color: 'var(--neon)', lineHeight: 1, marginBottom: 6 }}>{earningsData?.total || '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{earningsData?.currency || 'EGP'} · {earningsData?.period || 'This week'}</div>
                </div>
                <div style={{ display: 'flex', gap: 20 }}>
                  {[
                    { val: earningsData?.totalJobs || '—', label: 'Total tasks' },
                    { val: earningsData?.avgPerJob || '—', label: 'Average per task' },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--head)', fontSize: 26, letterSpacing: .5 }}>{s.val}</div>
                      <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{
                background: 'var(--neon-faint)', border: '1px solid rgba(170,255,0,.12)',
                borderRadius: 10, padding: '14px 16px',
              }}>
                <div style={{ fontSize: 9.5, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 6 }}>Upcoming transfer</div>
                <div style={{ fontFamily: 'var(--head)', fontSize: 28, color: 'var(--neon)', letterSpacing: 1, marginBottom: 2 }}>{earningsData?.nextTransfer?.amount || '—'}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>Transfer {earningsData?.nextTransfer?.date || '—'}</div>
              </div>
            </>
          )}

          {(activeView === 'history' || activeView === 'vehicle') && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
              <div style={{ fontFamily: 'var(--head)', fontSize: 20, marginBottom: 16 }}>
                {activeView === 'history' ? '📋 Task history' : '🚛 Vehicle & documents'}
              </div>
              {activeView === 'vehicle' && (
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 50 }}>🚛</div>
                  <div>
                    <div style={{ fontFamily: 'var(--head)', fontSize: 22, marginBottom: 3 }}>{vehicleData?.model || '—'}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--neon)', background: 'var(--neon-dim)', padding: '3px 10px', borderRadius: 4, display: 'inline-block', marginBottom: 8 }}>{vehicleData?.plate || '—'}</div>
                    <div style={{ display: 'flex', gap: 10, fontSize: 11.5, color: 'var(--text2)' }}>
                      <span>🔧 {vehicleData?.type || '—'}</span>
                      <span>⚙️ {vehicleData?.fuel || '—'}</span>
                      <span>📏 {vehicleData?.capacity || '—'}</span>
                    </div>
                  </div>
                </div>
              )}
              {activeView === 'history' && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%', borderCollapse: 'collapse', background: 'var(--bg)', borderRadius: 8, overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}>
                    <thead>
                      <tr style={{ background: 'var(--bg2)' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'center', fontFamily: 'var(--head)', fontSize: 14, color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>#</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', fontFamily: 'var(--head)', fontSize: 14, color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>Type</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', fontFamily: 'var(--head)', fontSize: 14, color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>Driver</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', fontFamily: 'var(--head)', fontSize: 14, color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>Fare</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', fontFamily: 'var(--head)', fontSize: 14, color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>Rating</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', fontFamily: 'var(--head)', fontSize: 14, color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(historyData || []).map(h => (
                        <tr key={h.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 16px', textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--text3)' }}>#{h.id}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text)' }}>{h.type}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text)' }}>{h.driver}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--neon)', fontFamily: 'var(--mono)' }}>{h.fare}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--amber)' }}>{h.rating}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}><span className="badge b-completed">{h.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
