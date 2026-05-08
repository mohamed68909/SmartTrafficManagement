// ═══ PUBLIC SERVICE ═══
import { API_CONFIG } from '../config';
import api from '../apiClient';
import { MOCK_PUBLIC_STATS } from '../mock/publicMock';

export const getStats = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_PUBLIC_STATS;
  return api.get('/public/stats');
};
