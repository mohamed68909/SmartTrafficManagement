// STEP 5/6 DONE — Seller.jsx (Arabic RTL) — API-driven
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import TopBar from '../components/TopBar';
import UserDetailModal from '../components/UserDetailModal';
import useModal from '../hooks/useModal';
import * as sellerService from '../api/services/sellerService';
import * as authService from '../api/services/authService';

const Seller = () => {
  const showToast = useToast();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ── Data state (service-driven) ──
  const [dashboardData, setDashboardData] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersStats, setOrdersStats] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [settings, setSettings] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  const { isOpen: isUserModalOpen, selected: selectedUser, openModal: openUserModal, closeModal: closeUserModal } = useModal();

  // ── Load data from service ──
  useEffect(() => {
    const loadAll = async () => {
      setDataLoading(true);
      try {
        const [dash, prods, ords, ordStats, analytics, store, revs, sets] = await Promise.all([
          sellerService.getDashboard(),
          sellerService.getProducts(),
          sellerService.getOrders(),
          sellerService.getOrdersStats(),
          sellerService.getAnalytics(),
          sellerService.getStore(),
          sellerService.getReviews(),
          sellerService.getSettings(),
        ]);
        setDashboardData(dash);
        setProducts(prods);
        setOrders(ords);
        setOrdersStats(ordStats);
        setAnalyticsData(analytics);
        setStoreData(store);
        setReviews(revs);
        setSettings(sets);
        const me = await authService.getMe();
        setCurrentUser(me || { id: 'SLR-001', name: 'عالم الإطارات', role: 'بائع', email: 'seller@test.com', phone: '+20 100 200 3000', status: 'نشط', date: 'يناير 2024', initials: 'عإ' });
      } catch (err) {
        showToast('فشل تحميل البيانات', 'err');
      } finally {
        setDataLoading(false);
      }
    };
    loadAll();
  }, []);

  // ── Action handlers ──
  const handleAddProduct = async (data) => {
    try { await sellerService.addProduct(data); showToast('تم إضافة المنتج ✓', 'ok'); } catch { showToast('فشل', 'err'); }
  };
  const handlePrepareOrder = async (id) => {
    try { await sellerService.prepareOrder(id); showToast('جاري التجهيز ✓', 'ok'); } catch { showToast('فشل', 'err'); }
  };
  const handleRestockProduct = async (id) => {
    try { await sellerService.restockProduct(id); showToast('تم إعادة التخزين ✓', 'ok'); } catch { showToast('فشل', 'err'); }
  };
  const handleSaveStore = async () => {
    try { await sellerService.updateStore(storeData); showToast('تم الحفظ ✓', 'ok'); } catch { showToast('فشل', 'err'); }
  };
  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  const sidebarItems = [
    { key: 'dashboard', icon: '📊', label: 'لوحة التحكم' },
    { key: 'products', icon: '📦', label: 'المنتجات', badge: products.length || 24 },
    { key: 'orders', icon: '🛒', label: 'الطلبات', badge: orders.filter(o => o.status === 'جديد').length || 7, badgeColor: 'var(--amber)' },
    { key: 'analytics', icon: '📈', label: 'التحليلات' },
    { key: 'store', icon: '🏪', label: 'ملف المتجر' },
    { key: 'reviews', icon: '⭐', label: 'التقييمات' },
    { key: 'settings', icon: '⚙️', label: 'الإعدادات' },
  ];

  return (
    <>
      <TopBar
          title={<h1 style={{fontFamily: 'Cairo, var(--head), sans-serif', fontSize: 'clamp(1.7rem,4vw,2.3rem)', fontWeight: 700, margin: 0, color: 'var(--text)'}}>بوابة البائع</h1>}
        onLogout={handleLogout}
        showLogout={true}
        profileUser={currentUser}
        onProfileClick={() => currentUser && openUserModal(currentUser)}
      />
      <div style={{ display: 'grid', gridTemplateColumns: sidebarCollapsed ? '64px 1fr' : '220px 1fr', height: '100vh', overflow: 'hidden', direction: 'rtl', transition: 'grid-template-columns .3s', marginTop: 'clamp(52px, 6vw, 70px)' }}>
      {/* SIDEBAR */}
      <aside style={{
        background: 'var(--bg2)', borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'width .3s',
      }}>
        <div style={{ padding: sidebarCollapsed ? '14px 12px' : '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, minHeight: 54, flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, background: 'var(--neon)', borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--head)', fontSize: 18, color: '#000',
            boxShadow: '0 0 16px var(--neon-glow)', flexShrink: 0,
          }}>ST</div>
          {!sidebarCollapsed && (
            <div>
              <div style={{ fontFamily: 'var(--head)', fontSize: 16 }}>سمارت ترافيك</div>
              <div style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--neon)', letterSpacing: 2 }}>بوابة البائع</div>
            </div>
          )}
        </div>

        <div style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sidebarItems.map(item => (
            <div key={item.key} onClick={() => setActiveView(item.key)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: sidebarCollapsed ? '10px' : '9px 12px',
              borderRadius: 7, cursor: 'pointer', transition: 'all .15s',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              background: activeView === item.key ? 'var(--neon-dim)' : 'transparent',
              color: activeView === item.key ? 'var(--neon)' : 'var(--text2)',
              position: 'relative',
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {!sidebarCollapsed && <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{item.label}</span>}
              {item.badge && !sidebarCollapsed && (
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

        <div style={{ padding: '12px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
          <div onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 6, borderRadius: 6, cursor: 'pointer', color: 'var(--text3)',
            border: '1px solid var(--border)', transition: 'all .15s',
          }}>
            {sidebarCollapsed ? '→' : '←'}
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* TOPBAR */}
        <div style={{
          height: 54, minHeight: 54, background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', padding: '0 20px', gap: 14,
        }}>
          <div style={{ fontFamily: 'var(--head)', fontSize: 20, letterSpacing: .5, flex: 1 }}>
            {sidebarItems.find(s => s.key === activeView)?.icon} {sidebarItems.find(s => s.key === activeView)?.label}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '0 12px',
          }}>
            <span style={{ color: 'var(--text3)' }}>🔍</span>
            <input type="text" placeholder="بحث..." style={{
              background: 'none', border: 'none', outline: 'none', color: 'var(--text)',
              fontFamily: 'inherit', fontSize: 12, padding: '7px 0', width: 180, direction: 'rtl',
            }} />
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 12px 4px 6px',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'linear-gradient(135deg,var(--neon),#44ff88)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 10, color: '#000',
            }}>عإ</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>عالم الإطارات</div>
              <div style={{ fontSize: 9, color: 'var(--neon)', fontFamily: 'var(--mono)' }}>بائع معتمد ✓</div>
            </div>
          </div>
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
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontFamily: 'var(--head)', fontSize: 30, letterSpacing: 1, lineHeight: 1, color: s.color }}>{s.val}</span>
                      {s.unit && <span style={{ fontSize: 13, color: 'var(--text3)' }}>{s.unit}</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{s.delta}</div>
                  </div>
                ))}
              </div>

              {/* Recent Orders */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--head)', fontSize: 16 }}>🛒 أحدث الطلبات</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => setActiveView('orders')}>عرض الكل</button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%', borderCollapse: 'collapse', background: 'var(--card)',
                    fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-normal)'
                  }}>
                    <thead>
                      <tr style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--head)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text)' }}>#</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--head)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text)' }}>العميل</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--head)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text)' }}>المنتجات</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--head)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text)' }}>المجموع</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--head)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text)' }}>الحالة</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--head)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text)' }}>الوقت</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--head)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text)' }}>إجراء</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 4).map(o => (
                        <tr key={o.id} style={{
                          borderBottom: '1px solid var(--border2)',
                          transition: 'background 0.15s ease'
                        }}>
                          <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{o.id}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{o.customer}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{o.items}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--neon)', fontFamily: 'var(--mono)', fontWeight: 'var(--font-weight-medium)' }}>{o.total} جنيه</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}><span className="badge" style={{ background: `${o.color}22`, color: o.color, border: `1px solid ${o.color}44` }}>{o.status}</span></td>
                          <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text3)' }}>{o.time}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}><button className="btn btn-ghost btn-sm" onClick={() => showToast(`عرض تفاصيل ${o.id}`)}>عرض</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top & Low Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 16 }}>🔥 الأكثر مبيعاً</div>
                  {products.slice(0, 3).map((p, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                      <div style={{ fontSize: 28, width: 40, textAlign: 'center' }}>{p.img}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{p.sold} مبيع · ★{p.rating}</div>
                      </div>
                      <div style={{ fontFamily: 'var(--head)', fontSize: 18, color: 'var(--neon)' }}>{p.price}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 16 }}>⚠️ مخزون منخفض</div>
                  {products.filter(p => p.stock < 15).map((p, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                      <div style={{ fontSize: 28, width: 40, textAlign: 'center' }}>{p.img}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--red)', fontFamily: 'var(--mono)' }}>متبقي {p.stock} فقط</div>
                      </div>
                      <button className="btn btn-amber btn-sm" onClick={() => showToast('طلب إعادة تخزين')}>إعادة تخزين</button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeView === 'products' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: 'var(--head)', fontSize: 20 }}>📦 كتالوج المنتجات ({products.length})</div>
                <button className="btn btn-neon" onClick={() => showToast('نموذج إضافة منتج', 'ok')}>+ إضافة منتج</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                {products.map((p, i) => (
                  <div key={i} style={{
                    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10,
                    overflow: 'hidden', transition: 'all .2s', cursor: 'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(170,255,0,.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{
                      height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'var(--bg3)', fontSize: 52, borderBottom: '1px solid var(--border)',
                    }}>{p.img}</div>
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1, marginBottom: 4 }}>{p.cat}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, lineHeight: 1.3 }}>{p.name}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ fontFamily: 'var(--head)', fontSize: 22, color: 'var(--neon)' }}>{p.price} <small style={{ fontSize: 12, color: 'var(--text3)' }}>جنيه</small></div>
                        <div style={{ fontSize: 11, color: 'var(--amber)' }}>★ {p.rating}</div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                        <span>مخزون: {p.stock}</span>
                        <span>مبيع: {p.sold}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeView === 'orders' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                {(ordersStats || []).map(s => (
                  <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
                    <div style={{ fontSize: 9.5, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontFamily: 'var(--head)', fontSize: 30, lineHeight: 1, color: s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 16 }}>جميع الطلبات</div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%', borderCollapse: 'collapse', background: 'var(--card)',
                    fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-normal)'
                  }}>
                    <thead>
                      <tr style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '12px 14px', textAlign: 'center', fontFamily: 'var(--head)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text)' }}>#</th>
                        <th style={{ padding: '12px 14px', textAlign: 'center', fontFamily: 'var(--head)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text)' }}>العميل</th>
                        <th style={{ padding: '12px 14px', textAlign: 'center', fontFamily: 'var(--head)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text)' }}>المنتجات</th>
                        <th style={{ padding: '12px 14px', textAlign: 'center', fontFamily: 'var(--head)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text)' }}>المجموع</th>
                        <th style={{ padding: '12px 14px', textAlign: 'center', fontFamily: 'var(--head)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text)' }}>الحالة</th>
                        <th style={{ padding: '12px 14px', textAlign: 'center', fontFamily: 'var(--head)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text)' }}>الوقت</th>
                        <th style={{ padding: '12px 14px', textAlign: 'center', fontFamily: 'var(--head)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text)' }}>إجراء</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id} style={{
                          borderBottom: '1px solid var(--border2)',
                          transition: 'background 0.15s ease'
                        }}>
                          <td style={{ padding: '12px 14px', textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{o.id}</td>
                          <td style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--text)', fontWeight: 'var(--font-weight-medium)' }}>{o.customer}</td>
                          <td style={{ padding: '12px 14px', textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{o.items}</td>
                          <td style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--neon)', fontFamily: 'var(--mono)', fontWeight: 'var(--font-weight-semibold)' }}>{o.total} جنيه</td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}><span className="badge" style={{ background: `${o.color}22`, color: o.color, border: `1px solid ${o.color}44`, padding: '4px 8px', borderRadius: 12, fontSize: 'var(--font-size-xs)' }}>{o.status}</span></td>
                          <td style={{ padding: '12px 14px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text3)' }}>{o.time}</td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                              <button className="btn btn-ghost btn-sm" onClick={() => showToast(`عرض ${o.id}`)}>عرض</button>
                              {o.status === 'جديد' && <button className="btn btn-neon btn-sm" onClick={() => showToast('بدء التجهيز', 'ok')}>تجهيز</button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeView === 'analytics' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                {(analyticsData?.stats || []).map(s => (
                  <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }}>
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
                    <div style={{ fontSize: 9.5, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--head)', fontSize: 36, color: s.color, lineHeight: 1 }}>{s.val}</span>
                      {s.unit && <span style={{ fontSize: 14, color: 'var(--text3)' }}>{s.unit}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--neon)', marginTop: 4 }}>{s.pct}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 16 }}>📈 المبيعات الشهرية (جنيه)</div>
                <div style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
                    {(analyticsData?.monthlyChart || []).map(d => (
                      <div key={d.m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontSize: 8, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{(d.v / 1000).toFixed(0)}K</span>
                        <div style={{ width: '100%', height: `${d.p}%`, borderRadius: '3px 3px 0 0', background: 'var(--neon)', opacity: d.p / 100 * 0.5 + 0.5, minHeight: 3 }} />
                        <span style={{ fontSize: 8, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{d.m.slice(0, 3)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeView === 'store' && (
            <div style={{ maxWidth: 700 }}>
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{
                  height: 100, background: 'linear-gradient(135deg,rgba(170,255,0,.15),rgba(0,204,255,.1))',
                  position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '0 20px 0',
                }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: 14, background: 'var(--neon)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--head)', fontSize: 32, color: '#000',
                    border: '3px solid var(--bg)', boxShadow: '0 0 20px var(--neon-glow)',
                    position: 'absolute', bottom: -20,
                  }}>عإ</div>
                </div>
                <div style={{ padding: '30px 20px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontFamily: 'var(--head)', fontSize: 24, letterSpacing: .5 }}>عالم الإطارات مصر</div>
                    <span className="badge b-active">بائع معتمد ✓</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 14 }}>
                    إطارات وزيوت وقطع غيار عالية الجودة لجميع أنواع المركبات. خدمة التوصيل في نفس اليوم عبر القاهرة والجيزة.
                  </div>
                  <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--text3)' }}>
                    <span>📍 {storeData?.location || '—'}</span>
                    <span>📦 {storeData?.products || 0} منتج</span>
                    <span>⭐ {storeData?.rating || '—'} ({storeData?.reviews || 0} تقييم)</span>
                    <span>📅 عضو منذ {storeData?.since || '—'}</span>
                  </div>
                </div>
              </div>
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
                <div style={{ fontFamily: 'var(--head)', fontSize: 16, marginBottom: 16 }}>تعديل معلومات المتجر</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 5 }}>اسم المتجر</div>
                    <input className="fi" defaultValue="عالم الإطارات مصر" />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 5 }}>الوصف</div>
                    <textarea className="fi" rows={3} defaultValue="إطارات وزيوت وقطع غيار عالية الجودة لجميع أنواع المركبات." style={{ resize: 'vertical' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 5 }}>الهاتف</div>
                      <input className="fi" defaultValue="+20 106 789 1234" dir="ltr" />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 5 }}>البريد</div>
                      <input className="fi" defaultValue="info@tireworld.eg" dir="ltr" />
                    </div>
                  </div>
                  <button className="btn btn-neon" style={{ alignSelf: 'flex-start' }} onClick={() => showToast('تم حفظ التغييرات', 'ok')}>💾 حفظ التغييرات</button>
                </div>
              </div>
            </div>
          )}

          {activeView === 'reviews' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 10, padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 28, letterSpacing: 3, marginBottom: 4, color: 'var(--amber)' }}>★★★★★</div>
                <div style={{ fontFamily: 'var(--head)', fontSize: 52, color: 'var(--amber)', lineHeight: 1, marginBottom: 4 }}>4.8</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>من 89 تقييم</div>
              </div>
              {(reviews || []).map((r, i) => (
                <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'linear-gradient(135deg,var(--blue),var(--purple))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 12, color: '#fff',
                      }}>{r.name.split(' ').map(w => w[0]).join('')}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{r.product}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{r.time}</div>
                  </div>
                  <div style={{ color: 'var(--amber)', fontSize: 14, marginBottom: 6 }}>{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{r.text}</div>
                </div>
              ))}
            </div>
          )}

          {activeView === 'settings' && (
            <div style={{ maxWidth: 600 }}>
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
                <div style={{ fontFamily: 'var(--head)', fontSize: 18, marginBottom: 16 }}>⚙️ إعدادات المتجر</div>
                {(settings || []).map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{s.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)' }}>{s.desc}</div>
                    </div>
                    <div onClick={() => showToast('تم تحديث الإعداد')} style={{
                      width: 42, height: 22, borderRadius: 12, cursor: 'pointer',
                      background: s.on ? 'var(--neon)' : 'var(--border2)',
                      position: 'relative', transition: 'background .2s',
                    }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', background: '#fff',
                        position: 'absolute', top: 2, transition: 'right .2s',
                        right: s.on ? 2 : 22,
                        boxShadow: '0 1px 3px rgba(0,0,0,.3)',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      <UserDetailModal open={isUserModalOpen} onClose={closeUserModal} user={selectedUser} />
    </>
  );
};

export default Seller;
