// ═══ ADMIN SERVICE ═══
import { API_CONFIG } from '../config';
import api from '../apiClient';
import {
  MOCK_ADMIN_DASHBOARD, MOCK_ADMIN_ANALYTICS, MOCK_ADMIN_APPROVALS,
  MOCK_ADMIN_APPROVALS_STATS, MOCK_ADMIN_SENSORS, MOCK_ADMIN_TRAFFIC,
  MOCK_ADMIN_ABOUT, MOCK_ADMIN_URGENT, MOCK_ADMIN_USERS,
  MOCK_ADMIN_TICKETS, MOCK_ADMIN_TICKETS_STATS, MOCK_ADMIN_CS_AGENTS,
  MOCK_ADMIN_RATINGS, MOCK_ADMIN_OPERATIONS, MOCK_ADMIN_NOTIFICATIONS,
} from '../mock/adminMock';

// ── Existing real backend endpoints ─────────────────────────────────────────

// GET /admin/dashboard/summary
export const getDashboard = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_DASHBOARD;
  return api.get('/admin/dashboard/summary');
};

// GET /admin/analytics/orders/monthly?months=12
export const getAnalytics = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_ANALYTICS;
  return api.get('/admin/analytics/orders/monthly?months=12');
};

// GET /admin/users?pageNumber=1&pageSize=20
export const getUsers = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_USERS;
  return api.get('/admin/users?pageNumber=1&pageSize=20');
};

// GET /admin/tickets/recent?limit=20
export const getTickets = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_TICKETS;
  return api.get('/admin/tickets/recent?limit=20');
};

// GET /admin/sos/recent?limit=20
export const getSosRecent = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_URGENT;
  return api.get('/admin/sos/recent?limit=20');
};

// GET /admin/providers?pageNumber=1&pageSize=20
export const getProviders = async () => {
  if (!API_CONFIG.BASE_URL) return [];
  return api.get('/admin/providers?pageNumber=1&pageSize=20');
};

// ── Newly wired endpoints ────────────────────────────────────────────────────

// GET /admin/urgent
export const getUrgent = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_URGENT;
  return api.get('/admin/urgent');
};

// POST /admin/urgent/{id}/assign  body: { providerId, note }
export const assignUrgent = async (id, providerId, note) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.post(`/admin/urgent/${id}/assign`, { providerId, note });
};

// GET /admin/urgent/{id}/track
export const trackUrgent = async (id) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.get(`/admin/urgent/${id}/track`);
};

// GET /admin/approvals
export const getApprovals = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_APPROVALS;
  return api.get('/admin/approvals');
};

// GET /admin/approvals/stats
export const getApprovalsStats = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_APPROVALS_STATS;
  return api.get('/admin/approvals/stats');
};

// GET /admin/approvals/{id}/docs
export const reviewDocs = async (id) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.get(`/admin/approvals/${id}/docs`);
};

// POST /admin/approvals/{id}/approve
export const approveApplication = async (id) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.post(`/admin/approvals/${id}/approve`);
};

// POST /admin/approvals/{id}/reject  body: { reason }
export const rejectApplication = async (id, reason = '') => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.post(`/admin/approvals/${id}/reject`, { reason });
};

// GET /admin/users/{id}
export const getUserById = async (id) => {
  if (!API_CONFIG.BASE_URL) return {};
  return api.get(`/admin/users/${id}`);
};

// PUT /admin/users/{id}  body: { name, email, isActive }
export const editUser = async (id, d) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.put(`/admin/users/${id}`, d);
};

// GET /admin/tickets/stats
export const getTicketsStats = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_TICKETS_STATS;
  return api.get('/admin/tickets/stats');
};

// GET /admin/tickets/{id}
export const getTicketById = async (id) => {
  if (!API_CONFIG.BASE_URL) return {};
  return api.get(`/admin/tickets/${id}`);
};

// GET /admin/cs-agents?pageNumber=1&pageSize=20
export const getCsAgents = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_CS_AGENTS;
  return api.get('/admin/cs-agents?pageNumber=1&pageSize=20');
};

// GET /admin/cs-agents/{id}  (no dedicated backend endpoint — returns from list)
export const getCsAgentById = async (id) => {
  if (!API_CONFIG.BASE_URL) return {};
  return api.get(`/admin/cs-agents?pageNumber=1&pageSize=1`);
};

// POST /admin/cs-agents  body: { name, email, password }
export const addCsAgent = async (d) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.post('/admin/cs-agents', d);
};

// POST /admin/cs-agents/{id}/activate
export const activateCsAgent = async (id) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.post(`/admin/cs-agents/${id}/activate`);
};

// GET /admin/ratings?pageNumber=1&pageSize=20
export const getRatings = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_RATINGS;
  return api.get('/admin/ratings?pageNumber=1&pageSize=20');
};

// GET /admin/system-status
export const getSystemStatus = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_DASHBOARD.systemStatus;
  return api.get('/admin/system-status');
};

// GET /admin/activity
export const getActivity = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_DASHBOARD.recentActivity;
  return api.get('/admin/activity');
};

// ── Mock-only endpoints (no matching backend route) ──────────────────────────
export const getSensors       = async () => MOCK_ADMIN_SENSORS;
export const getTraffic       = async () => MOCK_ADMIN_TRAFFIC;
export const getAbout         = async () => MOCK_ADMIN_ABOUT;
export const getEventLog      = async () => MOCK_ADMIN_ABOUT.eventLog;
export const getOperations    = async () => MOCK_ADMIN_OPERATIONS;
export const getNotifications = async () => MOCK_ADMIN_NOTIFICATIONS;
export const addUser          = async () => ({ success: true });
