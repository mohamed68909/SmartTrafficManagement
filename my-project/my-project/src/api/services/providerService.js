// ═══ PROVIDER SERVICE ═══
import api from "../apiClient";

// HELPERS
const SERVICE_TYPE_LABELS = {
  1: "Towing",
  2: "Flat Tire",
  3: "Battery Jump",
  4: "Fuel Delivery",
  5: "Lockout",
};

const STATUS_LABELS = {
  1: "Pending",
  2: "Active",
  3: "En Route",
  4: "Completed",
  5: "Cancelled",
};

const STATUS_BADGE = {
  1: "b-pending",
  2: "b-active",
  3: "b-otw",
  4: "b-completed",
  5: "b-cancelled",
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// MAPPERS
const mapDashboard = (raw) => {
  if (!raw) return { stats: [], raw: {} };
  return {
    raw,
    stats: [
      {
        label: "Total Jobs",
        val: raw.totalJobs ?? "—",
        icon: "📋",
        color: "var(--neon)",
        delta: "All time",
      },
      {
        label: "Completed",
        val: raw.completedJobs ?? "—",
        icon: "✅",
        color: "var(--emerald)",
        delta: "Finished jobs",
      },
      {
        label: "Active Jobs",
        val: raw.activeJobs ?? "—",
        icon: "🚗",
        color: "var(--amber)",
        delta: "In progress",
      },
      {
        label: "Total Earnings",
        val: raw.totalEarnings != null ? `${raw.totalEarnings} EGP` : "—",
        icon: "💰",
        color: "var(--neon)",
        delta: "All time revenue",
      },
    ],
  };
};

const mapHistory = (raw) => {
  if (!Array.isArray(raw)) return [];
  return raw.map((h) => ({
    id: h.requestId,
    shortId: h.requestId?.slice(0, 8).toUpperCase() ?? "—",
    type: SERVICE_TYPE_LABELS[h.serviceType] ?? `Type ${h.serviceType}`,
    serviceType: h.serviceType,
    status: STATUS_LABELS[h.status] ?? `Status ${h.status}`,
    statusCode: h.status,
    badgeClass: STATUS_BADGE[h.status] ?? "b-pending",
    fare: h.estimatedCost != null ? `${h.estimatedCost} EGP` : "—",
    rawFare: h.estimatedCost,
    date: formatDate(h.requestedAtUtc),
    time: formatTime(h.requestedAtUtc),
    requestedAtUtc: h.requestedAtUtc,
  }));
};

const mapEarnings = (raw) => {
  if (!raw) return null;
  const weekly = Array.isArray(raw.weekly) ? raw.weekly : [];
  const maxAmount = Math.max(...weekly.map((w) => w.amount), 1);
  return {
    total: raw.total != null ? `${raw.total} EGP` : "—",
    rawTotal: raw.total,
    thisMonth: raw.thisMonth != null ? `${raw.thisMonth} EGP` : "—",
    lastMonth: raw.lastMonth != null ? `${raw.lastMonth} EGP` : "—",
    currency: "EGP",
    period: "All Time",
    // weekly chart data — each bar knows its height % relative to max
    weekly: weekly.map((w) => ({
      day: w.day,
      amount: w.amount,
      label: w.amount > 0 ? `${w.amount} EGP` : "0",
      heightPct: Math.round((w.amount / maxAmount) * 100),
    })),
  };
};

const mapActiveMission = (raw) => {
  if (!raw || !raw.requestId) return null;
  return {
    reqId: raw.requestId,
    shortId: raw.requestId?.slice(0, 8).toUpperCase() ?? "REQ-0000",
    type: SERVICE_TYPE_LABELS[raw.serviceType] ?? `Type ${raw.serviceType}`,
    serviceType: raw.serviceType,
    status: STATUS_LABELS[raw.status] ?? `Status ${raw.status}`,
    statusCode: raw.status,
    badgeClass: STATUS_BADGE[raw.status] ?? "b-active",
    latitude: raw.latitude,
    longitude: raw.longitude,
    coords:
      raw.latitude && raw.longitude
        ? `${raw.latitude.toFixed(4)}, ${raw.longitude.toFixed(4)}`
        : "—",
    clientName: raw.clientName?.trim() || "N/A",
    clientPhone: raw.clientPhone?.trim() || "N/A",
    date: formatDate(raw.requestedAt),
    time: formatTime(raw.requestedAt),
    requestedAt: raw.requestedAt,
  };
};

// Dashboard
export const getDashboard = async () => {
  const raw = await api.get("/provider/dashboard");
  return mapDashboard(raw);
};

// Job history list
export const getHistory = async () => {
  const raw = await api.get("/provider/jobs/history");
  return mapHistory(Array.isArray(raw) ? raw : []);
};

// Earnings summary + weekly bar chart data
export const getEarnings = async () => {
  const raw = await api.get("/provider/earnings");
  return mapEarnings(raw);
};

// Current active mission
export const getActiveMission = async () => {
  const raw = await api.get("/provider/active-mission");
  return mapActiveMission(raw);
};

// Provider profile
export const getProfile = async () => {
  const raw = await api.get("/provider/profile");
  const data = raw?.data ?? raw ?? {};
  return {
    name: data.name ?? "Quick Rescue",
    phone: data.phone ?? "",
    email: data.email ?? "",
    rating: data.rating ?? 0,
    totalJobs: data.totalJobs ?? 0,
    isOnline: Boolean(data.isOnline),
  };
};

// ── Actions ──
export const acceptRequest = async (id) =>
  api.post(`/provider/requests/${id}/accept`);
export const rejectRequest = async (id) =>
  api.post(`/provider/requests/${id}/reject`);
export const toggleOnline = async (v) =>
  api.post("/provider/status", { online: v });
export const updateStatus = async (s) =>
  api.post("/provider/active-mission/status", { status: s });
export const callDriver = async () => api.post("/provider/active-mission/call");
export const sendSOS = async () => api.post("/provider/active-mission/sos");
