// ═══ AUTH SERVICE ═══
import { API_CONFIG } from '../config';
import api from '../apiClient';
import { MOCK_ACCOUNTS, MOCK_ME } from '../mock/authMock';

// Role → route mapping
const ROLE_ROUTES = {
  provider: '/provider',
  seller:   '/seller',
  admin:    '/admin',
  cs:       '/cs-agent',
};

export const login = async (email, password) => {
  if (!API_CONFIG.BASE_URL) {
    // Mock login — authenticate against hardcoded test accounts
    const account = MOCK_ACCOUNTS.find(
      a => a.email === email && a.password === password
    );
    if (!account) {
      throw new Error('Incorrect email address or password');
    }
    // Store fake JWT payload
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('role', account.role);
    localStorage.setItem('email', account.email);
    return { token: 'mock-token', role: account.role, email: account.email, redirect: ROLE_ROUTES[account.role] };
  }
  const data = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', data.token);
  localStorage.setItem('role', data.role);
  localStorage.setItem('email', data.email || email);
  return { ...data, redirect: ROLE_ROUTES[data.role] || '/' };
};

export const register = async (payload) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.post('/auth/register', payload);
};

export const logout = async () => {
  if (!API_CONFIG.BASE_URL) {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    return { success: true };
  }
  try { await api.post('/auth/logout'); } catch { /* ignore */ }
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('email');
  return { success: true };
};

export const getMe = async () => {
  if (!API_CONFIG.BASE_URL) {
    const role = localStorage.getItem('role');
    return role ? MOCK_ME[role] : null;
  }
  return api.get('/auth/me');
};

export const forgotPassword = async (email) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.post('/auth/forgot-password', { email });
};

export const getRoleRoute = (role) => ROLE_ROUTES[role] || '/';
