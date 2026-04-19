// ═══ SELLER SERVICE ═══
import { API_CONFIG } from '../config';
import api from '../apiClient';
import {
  MOCK_SELLER_DASHBOARD, MOCK_SELLER_PRODUCTS, MOCK_SELLER_ORDERS,
  MOCK_SELLER_ORDERS_STATS, MOCK_SELLER_ANALYTICS, MOCK_SELLER_STORE,
  MOCK_SELLER_REVIEWS, MOCK_SELLER_SETTINGS,
} from '../mock/sellerMock';

// ── GET endpoints ──
export const getDashboard   = async () => { if (!API_CONFIG.BASE_URL) return MOCK_SELLER_DASHBOARD;    return api.get('/seller/dashboard'); };
export const getProducts    = async () => { if (!API_CONFIG.BASE_URL) return MOCK_SELLER_PRODUCTS;     return api.get('/seller/products'); };
export const getOrders      = async () => { if (!API_CONFIG.BASE_URL) return MOCK_SELLER_ORDERS;       return api.get('/seller/orders'); };
export const getOrdersStats = async () => { if (!API_CONFIG.BASE_URL) return MOCK_SELLER_ORDERS_STATS; return api.get('/seller/orders/stats'); };
export const getAnalytics   = async () => { if (!API_CONFIG.BASE_URL) return MOCK_SELLER_ANALYTICS;    return api.get('/seller/analytics'); };
export const getStore       = async () => { if (!API_CONFIG.BASE_URL) return MOCK_SELLER_STORE;        return api.get('/seller/store'); };
export const getReviews     = async () => { if (!API_CONFIG.BASE_URL) return MOCK_SELLER_REVIEWS;      return api.get('/seller/reviews'); };
export const getSettings    = async () => { if (!API_CONFIG.BASE_URL) return MOCK_SELLER_SETTINGS;     return api.get('/seller/settings'); };
export const getOrderById   = async (id) => { if (!API_CONFIG.BASE_URL) return MOCK_SELLER_ORDERS.find(o => o.id === id) || {}; return api.get(`/seller/orders/${id}`); };

// ── POST / PUT endpoints ──
export const addProduct     = async (d) => { if (!API_CONFIG.BASE_URL) return { success: true }; return api.post('/seller/products', d); };
export const prepareOrder   = async (id) => { if (!API_CONFIG.BASE_URL) return { success: true }; return api.post(`/seller/orders/${id}/prepare`); };
export const restockProduct = async (id, quantity = 10) => { if (!API_CONFIG.BASE_URL) return { success: true }; return api.post(`/seller/products/${id}/restock`, { quantity }); };
export const updateStore    = async (d)  => { if (!API_CONFIG.BASE_URL) return { success: true }; return api.put('/seller/store', d); };
export const updateSettings = async (d)  => { if (!API_CONFIG.BASE_URL) return { success: true }; return api.put('/seller/settings', d); };
