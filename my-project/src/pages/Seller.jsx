// Seller
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import TopBar from '../components/TopBar';
import Modal from '../components/Modal';
import UserDetailModal from '../components/UserDetailModal';
import useModal from '../hooks/useModal';
import { useTranslation } from '../i18n/LanguageContext';
import * as sellerService from '../api/services/sellerService';
import * as authService from '../api/services/authService';

const Seller = () => {
  const showToast = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarCollapsed] = useState(false);

  const [tabLoading, setTabLoading] = useState(false);
  const [tabError,   setTabError]   = useState(null);

  const [dashboardData,  setDashboardData]  = useState(null);
  const [products,       setProducts]       = useState([]);
  const [categories,     setCategories]     = useState([]);
  const [orders,         setOrders]         = useState([]);
  const [ordersStats,    setOrdersStats]    = useState([]);
  const [analyticsData,  setAnalyticsData]  = useState(null);
  const [storeData,      setStoreData]      = useState(null);
  const [reviews,        setReviews]        = useState([]);
  const [settings,       setSettings]       = useState([]);
  const [currentUser,    setCurrentUser]    = useState(null);
  const emptyProductForm = {
    categoryId: '',
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    image: null,
    imageUrl: '',
  };
  const emptyCategoryForm = {
    name: '',
    description: '',
  };
  const [productModalMode, setProductModalMode] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingProductCategoryId, setEditingProductCategoryId] = useState('');
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [productSaving, setProductSaving] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [categorySaving, setCategorySaving] = useState(false);
  const [removingCategoryId, setRemovingCategoryId] = useState(null);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState(null);
  const [storeSaving, setStoreSaving] = useState(false);
  const [removingProductId, setRemovingProductId] = useState(null);
  const [deleteProductTarget, setDeleteProductTarget] = useState(null);
  const [restockTarget, setRestockTarget] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState('');
  const [restocking, setRestocking] = useState(false);

  const [sellerProfileOpen, setSellerProfileOpen] = useState(false);
  const { isOpen: isUserModalOpen, selected: selectedUser, openModal: openUserModal, closeModal: closeUserModal } = useModal();

  const loadedTabsRef = React.useRef(new Set());

  const loadTab = useCallback(async (view, { force = false } = {}) => {
    if (!force && loadedTabsRef.current.has(view)) return;
    setTabLoading(true);
    setTabError(null);
    try {
      switch (view) {
        case 'dashboard': {
          const [dash, ords] = await Promise.all([
            sellerService.getDashboard(),
            sellerService.getOrders(),
          ]);
          setDashboardData(dash);
          setOrders(ords);
          break;
        }
        case 'products': {
          const [data, cats] = await Promise.all([
            sellerService.getProducts(),
            sellerService.getCategories(),
          ]);
          setProducts(data);
          setCategories(cats);
          loadedTabsRef.current.add('categories');
          break;
        }
        case 'categories': {
          const data = await sellerService.getCategories();
          setCategories(data);
          break;
        }
        case 'orders': {
          const [ords, stats] = await Promise.all([
            sellerService.getOrders(),
            sellerService.getOrdersStats(),
          ]);
          setOrders(ords);
          setOrdersStats(stats);
          break;
        }
        case 'analytics': {
          const data = await sellerService.getAnalytics();
          setAnalyticsData(data);
          break;
        }
        case 'store': {
          const data = await sellerService.getStore();
          setStoreData(data);
          break;
        }
        case 'reviews': {
          const data = await sellerService.getReviews();
          setReviews(data);
          break;
        }
        case 'settings': {
          const data = await sellerService.getSettings();
          setSettings(data);
          break;
        }
        default: break;
      }
      loadedTabsRef.current.add(view);
    } catch (err) {
      const msg = err?.message || '';
      const status = err?.statusCode ?? err?.status ?? 0;
      if (status >= 500 || msg.toLowerCase().includes('server') || msg.toLowerCase().includes('500')) {
        setTabError('Server error (500) ? please try again.');
      } else {
        setTabError(null);
      }
    } finally {
      setTabLoading(false);
    }
  }, []);

  useEffect(() => {
    authService.getMe()
      .then(me => setCurrentUser(me || null))
      .catch(() => {});
    loadTab('dashboard');
  }, []);

  const handleTabChange = (key) => {
    setActiveView(key);
    loadTab(key);
  };

  const refreshTab = useCallback((key) => {
    loadedTabsRef.current.delete(key);
    return loadTab(key, { force: true });
  }, [loadTab]);

  const loadProductCategories = async () => {
    if (categories.length > 0) return categories;
    const data = await sellerService.getCategories();
    setCategories(data);
    loadedTabsRef.current.add('categories');
    return data;
  };

  const findCategoryById = (id, source = categories) =>
    source.find(category => String(category.id) === String(id));

  const findCategoryByName = (name, source = categories) => {
    const normalized = String(name || '').trim().toLowerCase();
    if (!normalized || normalized === '?') return null;
    return source.find(category => String(category.name || '').trim().toLowerCase() === normalized);
  };

  const getProductCategoryId = (product, source = categories) => {
    const raw = product?._raw || {};
    const directId = product?.categoryId || raw.categoryId || raw.category?.id || raw.category?.categoryId;
    if (directId) return directId;

    const categoryName =
      product?.categoryName ||
      product?.cat ||
      raw.categoryName ||
      raw.category?.name ||
      (typeof raw.category === 'string' ? raw.category : '');
    return findCategoryByName(categoryName, source)?.id || '';
  };

  const getProductCategoryName = (product, source = categories) => {
    const categoryId = getProductCategoryId(product, source);
    const matched = categoryId ? findCategoryById(categoryId, source) : null;
    return matched?.name || product?.categoryName || product?.cat || 'Uncategorized';
  };

  const withDerivedCategory = (product, categoryId, source = categories) => {
    if (!product) return product;
    const resolvedCategoryId = categoryId || getProductCategoryId(product, source);
    const categoryName = getProductCategoryName({ ...product, categoryId: resolvedCategoryId }, source);
    return {
      ...product,
      categoryId: resolvedCategoryId,
      categoryName,
      cat: categoryName,
      _raw: {
        ...(product._raw || {}),
        categoryId: resolvedCategoryId,
        categoryName,
      },
    };
  };

  const _handleAddProduct = async (data) => {
    try {
      const created = await sellerService.addProduct(data);
      showToast('added', 'ok');
      if (created?.id) {
        setProducts(prev => [...prev, withDerivedCategory(created, data.categoryId)]);
        loadedTabsRef.current.add('products');
      } else {
        refreshTab('products');
      }
    } catch (err) {
      showToast(err?.message || 'Failed to add product', 'err');
    }
  };

  const openAddProduct = async () => {
    await loadProductCategories();
    setEditingProductId(null);
    setEditingProductCategoryId('');
    setProductForm(emptyProductForm);
    setProductModalMode('add');
  };

  const openEditProduct = async (product) => {
    const categoryList = await loadProductCategories();
    const categoryId = getProductCategoryId(product, categoryList);
    setEditingProductId(product.id);
    setEditingProductCategoryId(categoryId);
    setProductForm({
      categoryId,
      name: product.name === '—' ? '' : product.name,
      description: product.description || product._raw?.description || '',
      price: product.price ?? '',
      stockQuantity: product.stock ?? '',
      image: null,
      imageUrl: product._raw?.imageUrl || product._raw?.image || (typeof product.img === 'string' && product.img.startsWith('http') ? product.img : ''),
    });
    setProductModalMode('edit');
  };

  const closeProductModal = () => {
    if (productSaving) return;
    setProductModalMode(null);
    setEditingProductId(null);
    setEditingProductCategoryId('');
    setProductForm(emptyProductForm);
  };

  const productPayload = () => {
    return {
      categoryId: productForm.categoryId.trim() || editingProductCategoryId || '',
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price: Number(productForm.price) || 0,
      stockQuantity: Number(productForm.stockQuantity) || 0,
      image: productForm.image,
      imageUrl: productForm.imageUrl.trim(),
    };
  };

  const handleSaveProduct = async () => {
    const payload = productPayload();
    if (!payload.name) {
      showToast('Product name is required', 'err');
      return;
    }
    if (!payload.categoryId) {
      showToast('Category is required', 'err');
      return;
    }

    setProductSaving(true);
    try {
      if (productModalMode === 'edit') {
        await sellerService.updateProduct(editingProductId, payload);
        await refreshTab('products');
        showToast('edited', 'ok');
      } else {
        const created = await sellerService.addProduct(payload);
        if (created?.id) {
          setProducts(prev => [...prev, withDerivedCategory(created, payload.categoryId)]);
          loadedTabsRef.current.add('products');
        } else {
          refreshTab('products');
        }
        showToast('added', 'ok');
      }
      setProductModalMode(null);
      setEditingProductId(null);
      setEditingProductCategoryId('');
      setProductForm(emptyProductForm);
    } catch (err) {
      showToast(err?.message || 'Failed to save product', 'err');
    } finally {
      setProductSaving(false);
    }
  };

  const openAddCategory = () => {
    setEditingCategoryId(null);
    setCategoryForm(emptyCategoryForm);
    setCategoryModalMode('add');
  };

  const openEditCategory = (category) => {
    setEditingCategoryId(category.id);
    setCategoryForm({
      name: category.name === '?' ? '' : category.name,
      description: category.description === '?' ? '' : category.description,
    });
    setCategoryModalMode('edit');
  };

  const closeCategoryModal = () => {
    if (categorySaving) return;
    setCategoryModalMode(null);
    setEditingCategoryId(null);
    setCategoryForm(emptyCategoryForm);
  };

  const handleSaveCategory = async () => {
    const payload = {
      name: categoryForm.name.trim(),
      description: categoryForm.description.trim(),
    };

    if (!payload.name) {
      showToast('Category name is required', 'err');
      return;
    }

    setCategorySaving(true);
    try {
      if (categoryModalMode === 'edit') {
        await sellerService.updateCategory(editingCategoryId, payload);
        showToast('Category updated', 'ok');
      } else {
        await sellerService.addCategory(payload);
        showToast('Category added', 'ok');
      }
      setCategoryModalMode(null);
      setEditingCategoryId(null);
      setCategoryForm(emptyCategoryForm);
      refreshTab('categories');
    } catch (err) {
      showToast(err?.message || 'Failed to save category', 'err');
    } finally {
      setCategorySaving(false);
    }
  };

  const handleRemoveCategory = async () => {
    if (!deleteCategoryTarget) return;

    setRemovingCategoryId(deleteCategoryTarget.id);
    try {
      await sellerService.removeCategory(deleteCategoryTarget.id);
      showToast('Category removed', 'ok');
      setDeleteCategoryTarget(null);
      refreshTab('categories');
    } catch (err) {
      showToast(err?.message || 'Failed to remove category', 'err');
    } finally {
      setRemovingCategoryId(null);
    }
  };

  const handleRemoveProduct = async () => {
    if (!deleteProductTarget) return;

    setRemovingProductId(deleteProductTarget.id);
    try {
      await sellerService.removeProduct(deleteProductTarget.id);
      showToast('removed', 'ok');
      setProducts(prev => prev.filter(p => String(p.id) !== String(deleteProductTarget.id)));
      setDeleteProductTarget(null);
      loadedTabsRef.current.add('products');
    } catch (err) {
      showToast(err?.message || 'Failed to remove product', 'err');
    } finally {
      setRemovingProductId(null);
    }
  };

  const _handlePrepareOrder = async (id) => {
    try {
      await sellerService.prepareOrder(id);
      showToast('Preparing ✓', 'ok');
      setOrders(prev => prev.map(o =>
        o.id === id ? { ...o, status: 'Preparing', color: 'var(--amber)' } : o
      ));
    } catch (err) {
      showToast(err?.message || 'Failed', 'err');
    }
  };

  const openRestockModal = (product) => {
    setRestockTarget(product);
    setRestockQuantity('');
  };

  const closeRestockModal = () => {
    if (restocking) return;
    setRestockTarget(null);
    setRestockQuantity('');
  };

  const handleRestockProduct = async () => {
    if (!restockTarget) return;
    const qty = Number(restockQuantity);
    if (!qty || qty < 1) {
      showToast('Enter a valid quantity', 'err');
      return;
    }
    setRestocking(true);
    try {
      await sellerService.restockProduct(restockTarget.id, qty);
      setProducts(prev => prev.map(p =>
        String(p.id) === String(restockTarget.id)
          ? { ...p, stock: (Number(p.stock) || 0) + qty, status: 'In Stock' }
          : p
      ));
      showToast('Restocked successfully ✓', 'ok');
      setRestockTarget(null);
      setRestockQuantity('');
    } catch (err) {
      showToast(err?.message || 'Failed to restock', 'err');
    } finally {
      setRestocking(false);
    }
  };

  const handleSaveStore = async () => {
    const payload = {
      name: storeData?.name?.trim() || '',
      description: storeData?.description?.trim() || '',
      logo: storeData?.logo?.trim() || '',
    };

    if (!payload.name) {
      showToast('Store name is required', 'err');
      return;
    }

    setStoreSaving(true);
    try {
      await sellerService.updateStore(payload);
      showToast('Store saved ✓', 'ok');
      await refreshTab('store');
    } catch (err) {
      showToast(err?.message || 'Failed to save', 'err');
    } finally {
      setStoreSaving(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  const sidebarItems = [
    { key: 'dashboard', icon: '\u{1F4CA}', label: t('seller.tabs.dashboard') },
    { key: 'products',  icon: '\u{1F4E6}', label: t('seller.tabs.products'), badge: products.length || null },
    { key: 'categories', icon: '\u{1F5C2}', label: 'Categories', badge: categories.length || null },
    { key: 'orders',    icon: '\u{1F6D2}', label: t('seller.tabs.orders'),
      badge: orders.filter(o => {
        const s = (o.status || '').toLowerCase();
        return s.includes('new') || s.includes('جديد');
      }).length || null,
      badgeColor: 'var(--amber)' },
    { key: 'analytics', icon: '\u{1F4C8}', label: t('seller.tabs.analytics') },
    { key: 'store',     icon: '\u{1F3EA}', label: t('seller.tabs.store') },
    { key: 'reviews',   icon: '\u2605', label: t('seller.tabs.reviews') },
    { key: 'settings',  icon: '\u2699', label: t('seller.tabs.settings') },
  ];

  const storeName     = storeData?.name        || 'My Store';
  const storeInitials = storeData?.initials    || storeName.slice(0, 2).toUpperCase();
  const storeVerified = storeData?.verified    ?? false;
  const sellerEmail = currentUser?.email || storeData?.email || '';
  const sellerAvatarInitials = (sellerEmail.split('@')[0] || '')
    .replace(/[^a-z0-9]/gi, '')
    .slice(0, 2)
    .toUpperCase() || 'SE';
  const sellerProfileUser = currentUser
    ? { ...currentUser, initials: sellerAvatarInitials }
    : null;

  const avgRating   = reviews.length
    ? (reviews.reduce((sum, r) => sum + (r.stars || 0), 0) / reviews.length).toFixed(1)
    : (dashboardData?.averageRating ?? '?');
  const reviewCount = reviews.length || dashboardData?.totalReviews || 0;
  const dashboardStats = (dashboardData?.stats || []).map(s => {
    if (s.label === 'Total Orders') {
      return { ...s, val: orders.length };
    }
    if (s.label === 'Avg. Rating') {
      return { ...s, val: avgRating };
    }
    return s;
  });
  const orderTabStats = (ordersStats || []).map(s =>
    s.label === 'Total Orders' ? { ...s, val: orders.length } : s
  );

  return (
    <>
      <TopBar
        title={
          <h1 style={{ fontFamily: 'var(--head), sans-serif', fontSize: 'clamp(1.7rem,4vw,2.3rem)', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
            {t('seller.title')}
          </h1>
        }
        onLogout={handleLogout}
        showLogout={true}
        profileUser={sellerProfileUser}
        profileDirect={true}
        onProfileClick={() => {
          if (currentUser) openUserModal(currentUser);
          else showToast('Profile not loaded yet', 'err');
        }}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: sidebarCollapsed ? '64px 1fr' : '220px 1fr',
        height: '100vh', overflow: 'hidden',
        transition: 'grid-template-columns .3s',
        marginTop: 'clamp(52px, 6vw, 70px)',
      }}>

        {}
        <aside style={{
          background: 'var(--bg2)', borderInlineEnd: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'width .3s',
        }}>
          <div style={{
            padding: sidebarCollapsed ? '14px 12px' : '16px 18px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 10,
            minHeight: 54, flexShrink: 0,
          }}>
            <div style={{
              width: 36, height: 36, background: 'var(--neon)', borderRadius: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--head)', fontSize: 18, color: '#000',
              boxShadow: '0 0 16px var(--neon-glow)', flexShrink: 0,
            }}>ST</div>
            {!sidebarCollapsed && (
              <div>
                <div style={{ fontFamily: 'var(--head)', fontSize: 16 }}>Smart Traffic</div>
                <div style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--neon)', letterSpacing: 2 }}>SELLER PORTAL</div>
              </div>
            )}
          </div>

          <div style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sidebarItems.map(item => (
              <div
                key={item.key}
                onClick={() => handleTabChange(item.key)}
                style={{
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
                {activeView === item.key && (
                  <div style={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    width: 3, height: '60%', background: 'var(--neon)', borderRadius: '0 2px 2px 0',
                  }} />
                )}
              </div>
            ))}
          </div>


        </aside>

        {}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Inner topbar */}
          <div style={{
            height: 54, minHeight: 54, background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', padding: '0 20px', gap: 14,
          }}>
            <div style={{ fontFamily: 'var(--head)', fontSize: 20, letterSpacing: .5, flex: 1 }}>
              {sidebarItems.find(s => s.key === activeView)?.icon}{' '}
              {sidebarItems.find(s => s.key === activeView)?.label}
            </div>
          </div>

          {/*  CONTENT AREA (with spinner + error overlay)  */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>

            {/*  Spinner Overlay  */}
            {tabLoading && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 50,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(4,7,12,0.75)', backdropFilter: 'blur(4px)',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  border: '3px solid var(--border)',
                  borderTop: '3px solid var(--neon)',
                  animation: 'spin 0.8s linear infinite',
                }} />
              </div>
            )}

            {/*  Error Overlay  */}
            {tabError && !tabLoading && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 49,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 14,
              }}>
                <div style={{ fontSize: 40 }}>!</div>
                <div style={{ color: 'var(--red)', fontSize: 14, textAlign: 'center', maxWidth: 300 }}>{tabError}</div>
                <button
                  className="btn btn-neon btn-sm"
                  onClick={() => { setTabError(null); loadTab(activeView); }}>
                  Retry
                </button>
              </div>
            )}

            {/*  DASHBOARD  */}
            {activeView === 'dashboard' && !tabError && (
              <>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                  {dashboardStats.map(s => (
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
                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--head)', fontSize: 16 }}>Recent Orders</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleTabChange('orders')}>View All</button>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    {(() => {
                      const slice = orders.slice(0, 4);
                      const hasItems   = slice.some(o => o.items !== '?' && o.items != null);
                      const dashCols = [
                        { key: 'id',       label: 'ID' },
                        hasItems && { key: 'items', label: 'Items' },
                        { key: 'total',    label: 'Total' },
                        { key: 'status',   label: 'Status' },
                      ].filter(Boolean);
                      return (
                        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--card)', fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-normal)' }}>
                          <thead>
                            <tr style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
                              {dashCols.map(c => (
                                <th key={c.key} style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--head)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text)' }}>{c.label}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {slice.map(o => (
                              <tr key={o.id} style={{ borderBottom: '1px solid var(--border2)', transition: 'background 0.15s ease' }}>
                                {dashCols.map(c => {
                                  if (c.key === 'id')       return <td key="id"       style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{o.id}</td>;
                                  if (c.key === 'items')    return <td key="items"    style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{o.items}</td>;
                                  if (c.key === 'total')    return <td key="total"    style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--neon)', fontFamily: 'var(--mono)', fontWeight: 'var(--font-weight-medium)' }}>{o.total} EGP</td>;
                                  if (c.key === 'status')   return <td key="status"   style={{ padding: '10px 12px', textAlign: 'center' }}><span className="badge" style={{ background: `${o.color}22`, color: o.color, border: `1px solid ${o.color}44` }}>{o.status}</span></td>;
                                  return null;
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      );
                    })()}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 16 }}>Best Sellers</div>
                    {products.slice(0, 3).map((p, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                        <div style={{ fontSize: 28, width: 40, textAlign: 'center' }}>{p.img}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{p.sold} sold · ★{p.rating}</div>
                        </div>
                        <div style={{ fontFamily: 'var(--head)', fontSize: 18, color: 'var(--neon)' }}>{p.price}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 16 }}>Low Stock</div>
                    {products.filter(p => p.stock < 15).map((p, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                        <div style={{ fontSize: 28, width: 40, textAlign: 'center' }}>{p.img}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--red)', fontFamily: 'var(--mono)' }}>Only {p.stock} left</div>
                        </div>
                        <button className="btn btn-amber btn-sm" onClick={() => openRestockModal(p)}>Restock</button>
                      </div>
                    ))}
                    {products.filter(p => p.stock < 15).length === 0 && (
                      <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>All products well stocked</div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/*  PRODUCTS  */}
            {activeView === 'products' && !tabError && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: 'var(--head)', fontSize: 20 }}>Product Catalog ({products.length})</div>
                  <button
                    className="btn btn-neon"
                    onClick={openAddProduct}
                    style={{
                      cursor:'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      boxShadow: 'none',
                    }}
                  >
                    <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
                    Add Product
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                  {products.map((p, i) => (
                    <div key={p.id || i} style={{
                      background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10,
                      overflow: 'hidden', transition: 'all .2s', cursor: 'pointer',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(170,255,0,.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      <div style={{
                        height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'var(--bg3)', fontSize: 52, borderBottom: '1px solid var(--border)',
                      }}>
                        {}
                        {p.img && p.img.startsWith('http')
                          ? <img src={p.img} alt={p.name} style={{ maxHeight: 100, objectFit: 'contain' }} />
                          : p.img}
                      </div>
                      <div style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1 }}>{getProductCategoryName(p)}</div>
                          <div
                            title={`Product ID: ${p.id}`}
                            style={{
                              maxWidth: 116,
                              padding: '3px 7px',
                              borderRadius: 999,
                              background: 'rgba(170,255,0,.08)',
                              border: '1px solid rgba(170,255,0,.2)',
                              color: 'var(--neon)',
                              fontSize: 9,
                              fontFamily: 'var(--mono)',
                              letterSpacing: .3,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            #{String(p.id).replace(/^#/, '')}
                          </div>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, lineHeight: 1.3 }}>{p.name}</div>
                        <div
                          title={p.description || 'No description'}
                          style={{
                            minHeight: 34,
                            marginBottom: 8,
                            color: 'var(--text3)',
                            fontSize: 11,
                            lineHeight: 1.45,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {p.description || 'No description'}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div style={{ fontFamily: 'var(--head)', fontSize: 22, color: 'var(--neon)' }}>{p.price} <small style={{ fontSize: 12, color: 'var(--text3)' }}>EGP</small></div>
                          <div style={{ fontSize: 11, color: 'var(--amber)' }}>? {p.rating}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                          <span>Stock: {p.stock}</span>
                          <span>Sold: {p.sold}</span>
                        </div>
                        {/* Status badge */}
                        <div style={{ marginTop: 8 }}>
                          <span style={{
                            fontSize: 10, fontFamily: 'var(--mono)', padding: '2px 8px', borderRadius: 10,
                            background: p.stock > 0 ? 'var(--emerald)22' : 'var(--red)22',
                            color: p.stock > 0 ? 'var(--emerald)' : 'var(--red)',
                            border: `1px solid ${p.stock > 0 ? 'var(--emerald)' : 'var(--red)'}44`,
                          }}>{p.status}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); openEditProduct(p); }}
                            style={{
                              border: '1px solid var(--border)',
                              background: 'transparent',
                              color: 'var(--text2)',
                              borderRadius: 6,
                              padding: '6px 9px',
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); openRestockModal(p); }}
                            style={{
                              border: '1px solid rgba(170,255,0,.28)',
                              background: 'rgba(170,255,0,.07)',
                              color: 'var(--neon)',
                              borderRadius: 6,
                              padding: '6px 9px',
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            + Stock
                          </button>
                          <button
                            type="button"
                            disabled={removingProductId === p.id}
                            onClick={(e) => { e.stopPropagation(); setDeleteProductTarget(p); }}
                            style={{
                              border: '1px solid rgba(255,77,109,.28)',
                              background: 'transparent',
                              color: 'var(--red)',
                              borderRadius: 6,
                              padding: '6px 9px',
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: removingProductId === p.id ? 'wait' : 'pointer',
                              opacity: removingProductId === p.id ? .65 : 1,
                            }}
                          >
                            {removingProductId === p.id ? 'Removing...' : 'Remove'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {products.length === 0 && !tabLoading && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text3)' }}>No products found</div>
                  )}
                </div>
              </>
            )}

            {activeView === 'categories' && !tabError && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: 'var(--head)', fontSize: 20 }}>Categories ({categories.length})</div>
                  <button
                    className="btn btn-neon"
                    onClick={openAddCategory}
                    style={{ cursor:'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, boxShadow: 'none' }}
                  >
                    <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
                    Add Category
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                  {categories.map((category, i) => (
                    <div key={category.id || i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 168 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontFamily: 'var(--head)', fontSize: 17, fontWeight: 700, marginBottom: 5 }}>{category.name}</div>
                          <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={category.id}>#{String(category.id).slice(0, 8)}</div>
                        </div>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--neon-dim)', border: '1px solid rgba(170,255,0,.2)', color: 'var(--neon)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🗂</div>
                      </div>

                      <div style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.6, flex: 1 }}>{category.description}</div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <button type="button" onClick={() => openEditCategory(category)} style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', borderRadius: 6, padding: '6px 9px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                        <button type="button" disabled={removingCategoryId === category.id} onClick={() => setDeleteCategoryTarget(category)} style={{ border: '1px solid rgba(255,77,109,.28)', background: 'transparent', color: 'var(--red)', borderRadius: 6, padding: '6px 9px', fontSize: 11, fontWeight: 600, cursor: removingCategoryId === category.id ? 'wait' : 'pointer', opacity: removingCategoryId === category.id ? .65 : 1 }}>
                          {removingCategoryId === category.id ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  ))}
                  {categories.length === 0 && !tabLoading && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text3)' }}>No categories found</div>
                  )}
                </div>
              </>
            )}


            {/*  ORDERS  */}
            {activeView === 'orders' && !tabError && (
              <>
                {/* Stats cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                  {orderTabStats.map(s => (
                    <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
                      <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
                      <div style={{ fontSize: 9.5, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontFamily: 'var(--head)', fontSize: 30, lineHeight: 1, color: s.color }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                {/* Orders table ? dynamic columns */}
                {(() => {
                  const hasItems   = orders.some(o => o.items !== '?' && o.items != null);
                  const hasAddress = orders.some(o => o.address && o.address !== '?');
                  const hasPhone   = orders.some(o => o.phone && o.phone !== '?');
                  const hasNote    = orders.some(o => o.note && o.note !== '');

                  const cols = [
                    { key: 'id',       label: 'ID',        show: true },
                    { key: 'items',    label: 'Items',    show: hasItems },
                    { key: 'total',    label: 'Total',    show: true },
                    { key: 'status',   label: 'Status',   show: true },
                    { key: 'address',  label: 'Address',  show: hasAddress },
                    { key: 'phone',    label: 'Phone',    show: hasPhone },
                    { key: 'note',     label: 'Note',     show: hasNote },
                  ].filter(c => c.show);

                  return (
                    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10}}>
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 16 }}>All Orders</div>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--card)', fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-normal)' }}>
                          <thead>
                            <tr style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
                              {cols.map(c => (
                                <th key={c.key} style={{ padding: '12px 14px', textAlign: 'center', fontFamily: 'var(--head)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text)' }}>{c.label}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {orders.map(o => (
                              <tr key={o.id} style={{ borderBottom: '1px solid var(--border2)', transition: 'background 0.15s ease' }}>
                                {cols.map(c => {
                                  if (c.key === 'id')       return <td key="id"       style={{ padding: '12px 14px', textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{o.id}</td>;
                                  if (c.key === 'items')    return <td key="items"    style={{ padding: '12px 14px', textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{o.items}</td>;
                                  if (c.key === 'total')    return <td key="total"    style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--neon)', fontFamily: 'var(--mono)', fontWeight: 'var(--font-weight-semibold)' }}>{o.total} EGP</td>;
                                  if (c.key === 'status')   return <td key="status"   style={{ padding: '12px 14px', textAlign: 'center' }}><span className="badge" style={{ background: `${o.color}22`, color: o.color, border: `1px solid ${o.color}44`, padding: '4px 8px', borderRadius: 12, fontSize: 'var(--font-size-xs)' }}>{o.status}</span></td>;
                                  if (c.key === 'address')  return <td key="address"  style={{ padding: '12px 14px', textAlign: 'center', fontSize: 12, color: 'var(--text2)', maxWidth: 140, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.address}</td>;
                                  if (c.key === 'phone')    return <td key="phone"    style={{ padding: '12px 14px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text2)' }}>{o.phone}</td>;
                                  if (c.key === 'note')     return <td key="note"     style={{ padding: '12px 14px', textAlign: 'center', fontSize: 12, color: 'var(--text3)', maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.note}</td>;
                                  return null;
                                })}
                              </tr>
                            ))}
                            {orders.length === 0 && !tabLoading && (
                              <tr><td colSpan={cols.length} style={{ padding: 32, textAlign: 'center', color: 'var(--text3)' }}>No orders found</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

            {/*  ANALYTICS  */}
            {activeView === 'analytics' && !tabError && (
              <>
                {}
                {(() => {
                  const realStats = (analyticsData?.derivedStats || analyticsData?.stats || []).filter(s => s.val !== '?' && s.val != null);
                  return realStats.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(realStats.length, 4)},1fr)`, gap: 12 }}>
                      {realStats.map(s => (
                        <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }}>
                          <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
                          <div style={{ fontSize: 9.5, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 4 }}>{s.label}</div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                            <span style={{ fontFamily: 'var(--head)', fontSize: 32, color: s.color, lineHeight: 1 }}>{s.val}</span>
                            {s.unit && <span style={{ fontSize: 13, color: 'var(--text3)' }}>{s.unit}</span>}
                          </div>
                          {s.pct && <div style={{ fontSize: 12, color: 'var(--emerald)', marginTop: 4 }}>{s.pct}</div>}
                        </div>
                      ))}
                    </div>
                  ) : null;
                })()}

                {/* Monthly revenue bar chart */}
                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--head)', fontSize: 16 }}>Monthly Revenue (EGP)</span>
                  </div>
                  <div style={{ padding: '20px 18px 12px' }}>
                    {(analyticsData?.monthlyChart || []).length > 0 ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 160 }}>
                          {(analyticsData?.monthlyChart || []).map((d, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                              <span style={{ fontSize: 8, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>
                                {d.v >= 1000 ? `${(d.v / 1000).toFixed(1)}K` : d.v}
                              </span>
                              <div
                                title={`${d.m}: ${d.v} EGP${d.orders ? ` ? ${d.orders} orders` : ''}`}
                                style={{
                                  width: '100%', height: `${Math.max(d.p, 3)}%`,
                                  borderRadius: '4px 4px 0 0',
                                  background: `linear-gradient(180deg, var(--neon) 0%, rgba(170,255,0,0.4) 100%)`,
                                  minHeight: 4, cursor: 'pointer', transition: 'opacity .15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                              />
                              <span style={{ fontSize: 8, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>
                                {String(d.m).slice(0, 3)}
                              </span>
                            </div>
                          ))}
                        </div>
                        {/* Orders per month line hint */}
                        {(analyticsData?.monthlyChart || []).some(d => d.orders > 0) && (
                          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                            {(analyticsData?.monthlyChart || []).map((d, i) => (
                              <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 8, fontFamily: 'var(--mono)', color: 'var(--blue)' }}>
                                {d.orders || ''}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', padding: 32, color: 'var(--text3)', fontSize: 13 }}>No monthly data available</div>
                    )}
                  </div>
                </div>

                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 15 }}>Top Products</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 15 }}>Top Products</div>
                  <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 15 }}>Top Products</div>
                    {(analyticsData?.topProducts || []).length > 0
                      ? (analyticsData.topProducts).map((p, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, padding: '11px 16px', borderBottom: '1px solid var(--border2)', alignItems: 'center' }}>
                          <div style={{
                            width: 24, height: 24, borderRadius: 6, background: i === 0 ? 'var(--neon)' : i === 1 ? 'var(--amber)' : 'var(--border2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: 11, color: i < 2 ? '#000' : 'var(--text3)', flexShrink: 0,
                          }}>#{i + 1}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                            <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 1 }}>
                              {p.sold} sold {p.rating !== '—' ? ' · ★' + p.rating : ''}
                            </div>
                          </div>
                          {p.revenue > 0 && (
                            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--neon)', flexShrink: 0 }}>
                              {p.revenue.toLocaleString()} EGP
                            </div>
                          )}
                        </div>
                      ))
                      : (
                        /* Fallback: use products state sorted by sold */
                        [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 5).map((p, i) => (
                          <div key={i} style={{ display: 'flex', gap: 10, padding: '11px 16px', borderBottom: '1px solid var(--border2)', alignItems: 'center' }}>
                            <div style={{
                              width: 24, height: 24, borderRadius: 6,
                              background: i === 0 ? 'var(--neon)' : i === 1 ? 'var(--amber)' : 'var(--border2)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, fontSize: 11, color: i < 2 ? '#000' : 'var(--text3)', flexShrink: 0,
                            }}>#{i + 1}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                              <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 1 }}>{p.sold} sold · ★{p.rating}</div>
                            </div>
                            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--neon)', flexShrink: 0 }}>{p.price} EGP</div>
                          </div>
                        ))
                      )
                    }
                    {products.length === 0 && (analyticsData?.topProducts || []).length === 0 && !tabLoading && (
                      <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>No product data</div>
                    )}
                  </div>

                  {/* Orders by status / Orders trend */}
                  <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--head)', fontSize: 15 }}>Orders Breakdown</div>
                    <div style={{ padding: '16px' }}>
                      {(analyticsData?.ordersByStatus || []).length > 0
                        ? (() => {
                          const total = analyticsData.ordersByStatus.reduce((s, x) => s + x.val, 0) || 1;
                          const colorMap = { new: 'var(--blue)', preparing: 'var(--amber)', delivered: 'var(--emerald)', cancelled: 'var(--red)' };
                          return analyticsData.ordersByStatus.map((row, i) => {
                            const pct = Math.round((row.val / total) * 100);
                            const col = colorMap[row.label.toLowerCase()] || `hsl(${i * 60},60%,60%)`;
                            return (
                              <div key={row.label} style={{ marginBottom: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                  <span style={{ color: 'var(--text2)' }}>{row.label}</span>
                                  <span style={{ fontFamily: 'var(--mono)', color: col }}>{row.val} ({pct}%)</span>
                                </div>
                                <div style={{ height: 6, borderRadius: 4, background: 'var(--border2)', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: 4, transition: 'width .6s' }} />
                                </div>
                              </div>
                            );
                          });
                        })()
                        : (() => {
                          /* Fallback: derive from ordersStats */
                          const statItems = (ordersStats || []).filter(s => s.label !== 'Total Orders');
                          const total = statItems.reduce((sum, s) => sum + (Number(s.val) || 0), 0) || 1;
                          return statItems.map((s) => {
                            const pct = Math.round(((Number(s.val) || 0) / total) * 100);
                            return (
                              <div key={s.label} style={{ marginBottom: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                  <span style={{ color: 'var(--text2)' }}>{s.label}</span>
                                  <span style={{ fontFamily: 'var(--mono)', color: s.color }}>{s.val} ({pct}%)</span>
                                </div>
                                <div style={{ height: 6, borderRadius: 4, background: 'var(--border2)', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${pct}%`, background: s.color, borderRadius: 4, transition: 'width .6s' }} />
                                </div>
                              </div>
                            );
                          });
                        })()
                      }
                      {(analyticsData?.ordersByStatus || []).length === 0 && (ordersStats || []).length === 0 && !tabLoading && (
                        <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13, padding: 16 }}>No breakdown data</div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/*  STORE  */}
            {activeView === 'store' && !tabError && (
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
                      position: 'absolute', bottom: -20, overflow: 'hidden',
                    }}>
                      {storeData?.logo ? (
                        <img
                          src={storeData.logo}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : storeInitials}
                    </div>
                  </div>
                  <div style={{ padding: '30px 20px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ fontFamily: 'var(--head)', fontSize: 24, letterSpacing: .5 }}>{storeName}</div>
                      {storeVerified && <span className="badge b-active">Verified Seller ✓</span>}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 14 }}>
                      {storeData?.description || '?'}
                    </div>
                    <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--text3)', flexWrap: 'wrap' }}>
                      <span>{storeData?.location || '—'}</span>
                      <span>{storeData?.products ?? '—'} Products</span>
                      <span>★ {storeData?.rating || '—'} ({storeData?.reviews ?? 0} reviews)</span>
                      <span>Member since {storeData?.since || '—'}</span>
                      <span>{storeData?.phone || '—'}</span>
                      <span>{storeData?.email || '—'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
                  <div style={{ fontFamily: 'var(--head)', fontSize: 16, marginBottom: 16 }}>Edit Store Info</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 5 }}>Store Name</div>
                      <input className="fi" value={storeData?.name || ''} onChange={e => setStoreData(prev => ({ ...prev, name: e.target.value }))} />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 5 }}>Description</div>
                      <textarea className="fi" rows={3} value={storeData?.description || ''} onChange={e => setStoreData(prev => ({ ...prev, description: e.target.value }))} style={{ resize: 'vertical' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.5, marginBottom: 5 }}>Logo URL</div>
                      <input className="fi" value={storeData?.logo || ''} dir="ltr" onChange={e => setStoreData(prev => ({ ...prev, logo: e.target.value }))} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                      <button
                        type="button"
                        className="btn btn-neon"
                        onClick={handleSaveStore}
                        disabled={storeSaving}
                        style={{
                          minWidth: 142,
                          padding: '9px 16px',
                          borderRadius: 7,
                          boxShadow: 'none',
                          cursor: storeSaving ? 'wait' : 'pointer',
                          opacity: storeSaving ? .7 : 1,
                        }}
                      >
                        {storeSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/*  REVIEWS  */}
            {activeView === 'reviews' && !tabError && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Summary header */}
                <div style={{ background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 10, padding: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: 28, letterSpacing: 3, marginBottom: 4, color: 'var(--amber)' }}>
                    {'★'.repeat(Math.round(parseFloat(avgRating) || 0))}{'☆'.repeat(5 - Math.round(parseFloat(avgRating) || 0))}
                  </div>
                  <div style={{ fontFamily: 'var(--head)', fontSize: 52, color: 'var(--amber)', lineHeight: 1, marginBottom: 4 }}>{avgRating}</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>From {reviewCount} reviews</div>
                </div>

                {/* Reviews list */}
                {reviews.map((r, i) => (
                  <div key={r.id || i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: 'linear-gradient(135deg,var(--blue),var(--purple))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 12, color: '#fff',
                        }}>
                          {r.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
                          <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{r.product}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{r.time}</div>
                    </div>
                    <div style={{ color: 'var(--amber)', fontSize: 14, marginBottom: 6 }}>
                      {'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{r.text}</div>
                  </div>
                ))}
                {reviews.length === 0 && !tabLoading && (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>No reviews yet</div>
                )}
              </div>
            )}

            {/*  SETTINGS  */}
            {activeView === 'settings' && !tabError && (
              <div style={{ maxWidth: 600 }}>
                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
                  <div style={{ fontFamily: 'var(--head)', fontSize: 18, marginBottom: 16 }}>Store Settings</div>
                  {settings.map((s, i) => (
                    <div key={s.key || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{s.label}</div>
                        {s.desc && <div style={{ fontSize: 12, color: 'var(--text3)' }}>{s.desc}</div>}
                      </div>
                      <div
                        onClick={async () => {
                          const updated = settings.map((x, idx) => idx === i ? { ...x, on: !x.on } : x);
                          setSettings(updated);
                          try {
                            await sellerService.updateSettings(updated);
                            showToast('Setting updated ✓', 'ok');
                            await refreshTab('settings');
                          } catch (err) {
                            setSettings(settings);
                            showToast(err?.message || 'Failed to update', 'err');
                          }
                        }}
                        style={{
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
                  {settings.length === 0 && !tabLoading && (
                    <div style={{ textAlign: 'center', padding: 20, color: 'var(--text3)', fontSize: 13 }}>No settings available</div>
                  )}
                </div>
              </div>
            )}

          </div>{}
        </div>{}
      </div>{}

      <Modal
        open={Boolean(categoryModalMode)}
        onClose={closeCategoryModal}
        title={categoryModalMode === 'edit' ? 'Edit Category' : 'Add Category'}
        size="480px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.4 }}>Name</span>
            <input className="fi" value={categoryForm.name} placeholder="Category name" onChange={e => setCategoryForm(prev => ({ ...prev, name: e.target.value }))} />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.4 }}>Description</span>
            <textarea className="fi" rows={4} value={categoryForm.description} placeholder="Category description" onChange={e => setCategoryForm(prev => ({ ...prev, description: e.target.value }))} style={{ resize: 'vertical' }} />
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={closeCategoryModal} disabled={categorySaving}>Cancel</button>
            <button type="button" className="btn btn-neon" onClick={handleSaveCategory} disabled={categorySaving} style={{ minWidth: 132, boxShadow: 'none', opacity: categorySaving ? .7 : 1, cursor: categorySaving ? 'wait' : 'pointer' }}>
              {categorySaving ? 'Saving...' : categoryModalMode === 'edit' ? 'Save Changes' : 'Add Category'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteCategoryTarget)}
        onClose={() => { if (!removingCategoryId) setDeleteCategoryTarget(null); }}
        title="Remove Category"
        size="420px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6 }}>
            Are you sure you want to remove <span style={{ color: 'var(--text)', fontWeight: 700 }}>{deleteCategoryTarget?.name}</span>?
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn btn-ghost" disabled={Boolean(removingCategoryId)} onClick={() => setDeleteCategoryTarget(null)}>Cancel</button>
            <button type="button" disabled={Boolean(removingCategoryId)} onClick={handleRemoveCategory} style={{ border: '1px solid rgba(255,77,109,.35)', background: 'rgba(255,77,109,.08)', color: 'var(--red)', borderRadius: 6, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: removingCategoryId ? 'wait' : 'pointer', opacity: removingCategoryId ? .65 : 1 }}>
              {removingCategoryId ? 'Removing...' : 'Remove'}
            </button>
          </div>
        </div>
      </Modal>


      <Modal
        open={Boolean(productModalMode)}
        onClose={closeProductModal}
        title={productModalMode === 'edit' ? 'Edit Product' : 'Add Product'}
        size="520px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.4 }}>Category</span>
            <select
              className="fi"
              value={productForm.categoryId}
              onChange={e => setProductForm(prev => ({ ...prev, categoryId: e.target.value }))}
              disabled={categories.length === 0}
            >
              <option value="">{categories.length === 0 ? 'No categories available' : 'Select category'}</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          {[
            { key: 'name', label: 'Name', type: 'text', placeholder: 'Product name' },
            { key: 'price', label: 'Price', type: 'number', placeholder: '0' },
            { key: 'stockQuantity', label: 'Stock Quantity', type: 'number', placeholder: '0' },
            { key: 'imageUrl', label: 'Image URL', type: 'text', placeholder: 'https://...' },
          ].map(field => (
            <label key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.4 }}>{field.label}</span>
              <input
                className="fi"
                type={field.type}
                min={field.type === 'number' ? '0' : undefined}
                value={productForm[field.key]}
                placeholder={field.placeholder}
                onChange={e => setProductForm(prev => ({ ...prev, [field.key]: e.target.value }))}
              />
            </label>
          ))}

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.4 }}>Description</span>
            <textarea
              className="fi"
              rows={4}
              value={productForm.description}
              placeholder="Product description"
              onChange={e => setProductForm(prev => ({ ...prev, description: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </label>


          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1.4 }}>Image</span>
            <input
              className="fi"
              type="file"
              accept="image/*"
              onChange={e => setProductForm(prev => ({ ...prev, image: e.target.files?.[0] || null }))}
            />
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={closeProductModal}
              disabled={productSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-neon"
              onClick={handleSaveProduct}
              disabled={productSaving}
              style={{
                minWidth: 132,
                boxShadow: 'none',
                opacity: productSaving ? .7 : 1,
                cursor: productSaving ? 'wait' : 'pointer',
              }}
            >
              {productSaving ? 'Saving...' : productModalMode === 'edit' ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteProductTarget)}
        onClose={() => {
          if (!removingProductId) setDeleteProductTarget(null);
        }}
        title="Remove Product"
        size="420px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6 }}>
            Are you sure you want to remove{' '}
            <span style={{ color: 'var(--text)', fontWeight: 700 }}>
              {deleteProductTarget?.name}
            </span>
            ?
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={Boolean(removingProductId)}
              onClick={() => setDeleteProductTarget(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={Boolean(removingProductId)}
              onClick={handleRemoveProduct}
              style={{
                border: '1px solid rgba(255,77,109,.35)',
                background: 'rgba(255,77,109,.08)',
                color: 'var(--red)',
                borderRadius: 6,
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 700,
                cursor: removingProductId ? 'wait' : 'pointer',
                opacity: removingProductId ? .65 : 1,
              }}
            >
              {removingProductId ? 'Removing...' : 'Remove'}
            </button>
          </div>
        </div>
      </Modal>

      {/*        {/* ════ RESTOCK MODAL ════ */}
      <Modal
        open={Boolean(restockTarget)}
        onClose={closeRestockModal}
        title="Restock Product"
        size="400px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.6 }}>
            Add stock for{' '}
            <span style={{ color: 'var(--neon)', fontWeight: 700 }}>
              {restockTarget?.name}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1 }}>
              QUANTITY TO ADD
            </label>
            <input
              type="number"
              min="1"
              value={restockQuantity}
              onChange={e => setRestockQuantity(e.target.value)}
              placeholder="e.g. 50"
              style={{
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
                borderRadius: 7,
                padding: '9px 12px',
                color: 'var(--text)',
                fontSize: 14,
                fontFamily: 'var(--mono)',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(170,255,0,.5)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
            />
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>
              Current stock: <span style={{ color: 'var(--amber)', fontFamily: 'var(--mono)' }}>{restockTarget?.stock ?? 0}</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={restocking}
              onClick={closeRestockModal}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={restocking}
              onClick={handleRestockProduct}
              style={{
                border: '1px solid rgba(170,255,0,.35)',
                background: 'rgba(170,255,0,.1)',
                color: 'var(--neon)',
                borderRadius: 6,
                padding: '8px 18px',
                fontSize: 12,
                fontWeight: 700,
                cursor: restocking ? 'wait' : 'pointer',
                opacity: restocking ? .7 : 1,
              }}
            >
              {restocking ? 'Restocking...' : 'Confirm Restock'}
            </button>
          </div>
        </div>
      </Modal>

      {sellerProfileOpen && (
        <div
          onClick={() => setSellerProfileOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--card2)', border: '1px solid var(--border2)',
              borderRadius: 14, width: 420, maxWidth: '94vw', overflow: 'hidden',
              boxShadow: '0 0 40px rgba(0,0,0,.6)',
            }}
          >
            {/* Header banner */}
            <div style={{
              height: 90, background: 'linear-gradient(135deg,rgba(170,255,0,.18),rgba(0,204,255,.12))',
              position: 'relative',
            }}>
              <button
                onClick={() => setSellerProfileOpen(false)}
                style={{
                  position: 'absolute', top: 10, right: 12, background: 'rgba(255,255,255,.08)',
                  border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text3)',
                  padding: '2px 8px', cursor: 'pointer', fontSize: 13,
                }}>×</button>
              {/* Avatar */}
              <div style={{
                position: 'absolute', bottom: -26, left: 24,
                width: 56, height: 56, borderRadius: 12,
                background: 'var(--neon)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--head)', fontSize: 24, color: '#000',
                border: '3px solid var(--card2)',
                boxShadow: '0 0 16px var(--neon-glow)',
              }}>{sellerAvatarInitials}</div>
            </div>

            {/* Body */}
            <div style={{ padding: '38px 24px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ fontFamily: 'var(--head)', fontSize: 20, letterSpacing: .4 }}>{storeName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 2 }}>
                    {currentUser?.email || storeData?.email || '?'}
                  </div>
                </div>
                {storeVerified && (
                  <span style={{
                    fontSize: 10, fontFamily: 'var(--mono)', padding: '3px 10px', borderRadius: 20,
                    background: 'var(--emerald)22', color: 'var(--emerald)',
                    border: '1px solid var(--emerald)44',
                  }}>Verified ✓</span>
                )}
              </div>

              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  { icon: '\u{1F4DE}', label: 'Phone',    val: storeData?.phone    || currentUser?.phoneNumber || '—' },
                  { icon: '\u{1F4CD}', label: 'Location', val: storeData?.location || '—' },
                  { icon: '\u{1F4E6}', label: 'Products', val: storeData?.products ?? '—' },
                  { icon: '\u2605', label: 'Rating',   val: storeData?.rating   ? `${storeData.rating} / 5` : '—' },
                  { icon: '\u{1F4AC}', label: 'Reviews',  val: storeData?.reviews  ?? '—' },
                  { icon: '\u{1F4C5}', label: 'Member Since', val: storeData?.since ?? '—' },
                ].map(row => (
                  <div key={row.label} style={{
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    borderRadius: 8, padding: '10px 12px',
                  }}>
                    <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1, marginBottom: 3 }}>
                      {row.icon} {row.label}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{String(row.val)}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              {storeData?.description && (
                <div style={{
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '10px 12px', marginBottom: 16,
                }}>
                  <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: 1, marginBottom: 4 }}>About</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{storeData.description}</div>
                </div>
              )}

              {/* Quick stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {[
                  { label: 'Revenue',  val: dashboardData?.totalRevenue  != null ? `${dashboardData.totalRevenue} EGP` : '?', color: 'var(--neon)' },
                  { label: 'Orders',   val: dashboardData?.totalOrders   ?? '?',  color: 'var(--blue)'   },
                  { label: 'Pending',  val: dashboardData?.pendingOrders ?? '?',  color: 'var(--amber)'  },
                ].map(s => (
                  <div key={s.label} style={{
                    background: 'var(--card)', border: '1px solid var(--border)',
                    borderRadius: 8, padding: '10px 12px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)', marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontFamily: 'var(--head)', fontSize: 16, color: s.color }}>{String(s.val)}</div>
                  </div>
                ))}
              </div>

              <button
                className="btn btn-neon"
                style={{ width: '100%', marginTop: 16 }}
                onClick={() => { setSellerProfileOpen(false); handleTabChange('store'); }}
              >
                Edit Store Profile
              </button>
            </div>
          </div>
        </div>
      )}

      <UserDetailModal open={isUserModalOpen} onClose={closeUserModal} user={selectedUser} />
    </>
  );
};

export default Seller;