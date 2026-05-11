// ═══ AUTH HELPERS ═══
// Centralized session management utilities.
// All auth state lives in localStorage — these helpers provide a clean API.

import * as authService from '../api/services/authService';

const KEYS = ['token', 'role', 'email', 'user'];

// Role → dashboard route mapping
const ROLE_ROUTES = {
  provider: '/provider',
  seller:   '/seller',
  admin:    '/admin',
  cs:       '/cs-agent',
};

/**
 * Save session data after successful login.
 * @param {{ token: string, role: string, email?: string, name?: string }} data
 */
export const saveSession = (data) => {
  if (data.token) localStorage.setItem('token', data.token);
  if (data.role)  localStorage.setItem('role', data.role);
  if (data.email) localStorage.setItem('email', data.email);
  localStorage.setItem('user', JSON.stringify({
    name:  data.name  || '',
    email: data.email || '',
    role:  data.role  || '',
  }));
};

/**
 * Remove ALL auth keys from localStorage.
 */
export const clearSession = () => {
  KEYS.forEach(k => localStorage.removeItem(k));
};

/**
 * Parse and return the stored user object, or null if no session.
 * @returns {{ name: string, email: string, role: string } | null}
 */
export const getSession = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user || { role: localStorage.getItem('role'), email: localStorage.getItem('email') };
  } catch {
    return { role: localStorage.getItem('role'), email: localStorage.getItem('email') };
  }
};

/**
 * Return the current role string, or null.
 * @returns {string | null}
 */
export const getRole = () => localStorage.getItem('role');

/**
 * Return the correct dashboard path for a given role.
 * @param {string} role
 * @returns {string}
 */
export const redirectAfterLogin = (role) => ROLE_ROUTES[role] || '/';

/**
 * Full logout flow:
 * 1. Call authService.logout() (best-effort)
 * 2. Clear all session data
 * 3. Redirect to landing page
 */
export const logout = async () => {
  try { await authService.logout(); } catch { /* best-effort */ }
  clearSession();
  window.location.href = '/';
};
