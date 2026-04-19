// ═══ CS AGENT SERVICE ═══
import { API_CONFIG } from '../config';
import api from '../apiClient';
import {
  MOCK_CS_TICKETS, MOCK_CS_TICKETS_STATS, MOCK_CS_MESSAGES,
  MOCK_CS_DRIVER_CONTEXT, MOCK_CS_DRIVER_LOOKUP, MOCK_CS_REPORTS,
} from '../mock/csMock';

// ── Real backend endpoints ──

// GET /support/tickets/my  (replaces /cs/tickets AND /cs/tickets/assigned)
export const getTickets  = async () => { if (!API_CONFIG.BASE_URL) return MOCK_CS_TICKETS;          return api.get('/support/tickets/my'); };
export const getAssigned = async () => { if (!API_CONFIG.BASE_URL) return MOCK_CS_TICKETS.slice(0,5); return api.get('/support/tickets/my'); };

// GET /chat/history/{ticketId}  (replaces /cs/tickets/{id}/messages)
export const getMessages = async (id) => { if (!API_CONFIG.BASE_URL) return MOCK_CS_MESSAGES; return api.get(`/chat/history/${id}`); };

// POST /chat/send  body: { ticketId, message, type }  (replaces /cs/tickets/{id}/reply)
export const sendReply = async (id, text) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.post('/chat/send', { ticketId: id, message: text, type: 'text' });
};

// PATCH /support/close/{id}  (replaces /cs/tickets/{id}/resolve)
export const resolveTicket = async (id) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.patch(`/support/close/${id}`);
};

// ── Mock-only endpoints (no matching backend route) ──
export const getTicketsStats   = async ()         => MOCK_CS_TICKETS_STATS;
export const searchDrivers     = async ()         => MOCK_CS_DRIVER_LOOKUP;
export const getDriverById     = async ()         => MOCK_CS_DRIVER_CONTEXT;
export const getReports        = async ()         => MOCK_CS_REPORTS;
export const saveNote          = async ()         => ({ success: true });
export const createTicket      = async ()         => ({ success: true });
export const escalateTicket    = async ()         => ({ success: true });
export const reassignTicket    = async ()         => ({ success: true });
export const blockDriver       = async ()         => ({ success: true });
export const toggleAgentStatus = async ()         => ({ success: true });
export const updateStatus      = async ()         => ({ success: true });
