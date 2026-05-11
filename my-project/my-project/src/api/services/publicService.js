// ═══ PUBLIC SERVICE ═══
import { API_CONFIG } from '../config';
import api from '../apiClient';
import { MOCK_PUBLIC_STATS } from '../mock/publicMock';

export const getStats = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_PUBLIC_STATS;
  try {
    // No /public/stats endpoint exists — use admin summary as fallback
    const raw = await api.get('/admin/dashboard/summary');
    return {
      totalUsers: raw?.totalUsers ?? 0,
      totalOrders: raw?.totalOrders ?? 0,
      totalProviders: raw?.totalProviders ?? 0,
      totalSellers: raw?.totalSellers ?? 0,
    };
  } catch {
    return MOCK_PUBLIC_STATS;
  }
};
