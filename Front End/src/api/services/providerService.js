// ═══ PROVIDER SERVICE ═══
import { API_CONFIG } from '../config';
import api from '../apiClient';
import {
  MOCK_PROVIDER_DASHBOARD, MOCK_PROVIDER_EARNINGS_WEEKLY, MOCK_PROVIDER_LOCATION,
  MOCK_PROVIDER_SCHEDULE, MOCK_PROVIDER_NOTIFICATIONS, MOCK_PROVIDER_RATINGS,
  MOCK_PROVIDER_INCOMING, MOCK_PROVIDER_PENDING, MOCK_PROVIDER_REQUESTS_STATS,
  MOCK_PROVIDER_ACTIVE_MISSION, MOCK_PROVIDER_EARNINGS, MOCK_PROVIDER_HISTORY,
  MOCK_PROVIDER_VEHICLE,
} from '../mock/providerMock';

// ── Real backend endpoints ──────────────────────────────────────────────────

// GET /provider/dashboard
export const getDashboard = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_PROVIDER_DASHBOARD;
  return api.get('/provider/dashboard');
};

// GET /provider/jobs/available  (serves both incoming and pending views)
export const getIncomingRequest = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_PROVIDER_INCOMING;
  return api.get('/provider/jobs/available');
};
export const getPendingRequests = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_PROVIDER_PENDING;
  return api.get('/provider/jobs/available');
};

// GET /provider/jobs/history
export const getHistory = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_PROVIDER_HISTORY;
  return api.get('/provider/jobs/history');
};

// PATCH /provider/jobs/accept/{id}
export const acceptRequest = async (id) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.patch(`/provider/jobs/accept/${id}`);
};

// PATCH /provider/jobs/status  body: { requestId, status }
export const updateStatus = async (s) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.patch('/provider/jobs/status', s);
};

// PATCH /provider/jobs/location  body: { requestId, latitude, longitude }
export const updateLocation = async (data) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.patch('/provider/jobs/location', data);
};

// GET /provider/earnings/weekly
export const getEarningsWeekly = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_PROVIDER_EARNINGS_WEEKLY;
  return api.get('/provider/earnings/weekly');
};

// GET /provider/earnings
export const getEarnings = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_PROVIDER_EARNINGS;
  return api.get('/provider/earnings');
};

// GET /provider/active-mission
export const getActiveMission = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_PROVIDER_ACTIVE_MISSION;
  return api.get('/provider/active-mission');
};

// GET /provider/schedule
export const getSchedule = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_PROVIDER_SCHEDULE;
  return api.get('/provider/schedule');
};

// PUT /provider/schedule  body: { workingDays, startHour, endHour }
export const updateSchedule = async (data) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.put('/provider/schedule', data);
};

// POST /provider/status  body: { online: bool }
export const toggleOnline = async (online) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.post('/provider/status', { online });
};

// GET /provider/profile
export const getProfile = async () => {
  if (!API_CONFIG.BASE_URL) return {};
  return api.get('/provider/profile');
};

// POST /provider/requests/{id}/reject  (backend not yet implemented — keep mock)
export const rejectRequest = async (id) => ({ success: true });

// ── Mock-only endpoints (no matching backend route yet) ─────────────────────
export const getLocation      = async () => MOCK_PROVIDER_LOCATION;
export const getNotifications = async () => MOCK_PROVIDER_NOTIFICATIONS;
export const getRatings       = async () => MOCK_PROVIDER_RATINGS;
export const getVehicle       = async () => MOCK_PROVIDER_VEHICLE;
export const getRequestsStats = async () => MOCK_PROVIDER_REQUESTS_STATS;
export const callDriver       = async () => ({ success: true });
export const sendSOS          = async () => ({ success: true });
