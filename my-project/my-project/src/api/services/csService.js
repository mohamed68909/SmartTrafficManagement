// CS AGENT 
import api from "../apiClient";

// Helpers
const toList = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.items)) return raw.items;
  return [];
};

// Mappers
export const mapDriver = (d) => {
  const fullName = d.fullName?.trim() || d.name?.trim() || "Unknown";
  return {
    id: d.id,
    name: fullName,
    email: d.email?.trim() || "—",
    phone: d.phone?.trim() || d.phoneNumber?.trim() || "—",
    isActive: d.isActive ?? true,
    initials: fullName
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    _raw: d,
  };
};

// Map getMe()
export const mapAgentProfile = (u) => {
  if (!u) return null;
  const fullName =
    `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
    u.name?.trim() ||
    "CS Agent";
  return {
    id: u.id,
    name: fullName,
    email: u.email?.trim() || "—",
    phone: u.phoneNumber?.trim() || "—",
    role: u.role || "CSAgent",
    profilePicture: u.profilePicture || null,
    initials: fullName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    status: "Active",
  };
};

const formatTicketDate = (value) => {
  if (!value) return { date: "—", time: "—" };
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { date: String(value), time: "" };
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  };
};

const ticketStatusNum = (status) => {
  const s = String(status || "").toLowerCase();
  if (s.includes("open")) return 1;
  if (s.includes("pending")) return 2;
  if (s.includes("closed") || s.includes("resolved")) return 3;
  return 0;
};

export const mapTicket = (t = {}) => {
  const createdAt = t.createdAt ?? t.createdAtUtc ?? t.requestedAtUtc ?? t.date;
  const when = formatTicketDate(createdAt);
  const user = t.user || t.driver || t.client || t.customer || {};
  const userName =
    t.userName?.trim() ||
    t.clientName?.trim() ||
    t.customerName?.trim() ||
    user.fullName?.trim() ||
    user.name?.trim() ||
    t.name?.trim() ||
    "Unknown user";
  const status = String(t.status || "Open");
  return {
    id: String(t.ticketId || t.id || "—"),
    subject: t.subject?.trim() || t.title?.trim() || "No subject",
    name: userName,
    userName,
    initials:
      userName
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "U",
    status,
    statusNum: ticketStatusNum(status),
    date: when.date,
    time: when.time,
    unread: Boolean(t.unread || t.hasUnread),
    priority: t.priority ?? "Normal",
    phone:
      t.userPhone?.trim() ||
      t.clientPhone?.trim() ||
      t.customerPhone?.trim() ||
      user.phone?.trim() ||
      user.phoneNumber?.trim() ||
      "",
    email:
      t.userEmail?.trim() ||
      t.clientEmail?.trim() ||
      t.customerEmail?.trim() ||
      user.email?.trim() ||
      "",
    userId: t.userId || t.driverId || t.clientId || user.id || "",
    address: t.address || t.userAddress || user.address || "",
    description: t.description || t.message || "",
    _raw: t,
  };
};

// CS — Driver Management
export const searchDrivers = async (q) => {
  const raw = await api.get(`/cs/drivers/search?q=${encodeURIComponent(q)}`);
  return toList(raw).map(mapDriver);
};

export const getDriverById = async (id) => {
  const raw = await api.get(`/cs/drivers/${id}`);
  return raw ? mapDriver(raw) : null;
};

export const blockDriver = async (id) => api.post(`/cs/drivers/${id}/block`);

export const toggleAgentStatus = async (online) =>
  api.post("/cs/agent/status", { online });

export const getTicketById = async (id) => {
  const raw = await api.get(`/support/tickets/${encodeURIComponent(id)}`);
  return raw ? mapTicket(raw) : null;
};

// Detect if input looks like a UUID or short ticket ID
const looksLikeId = (q) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(q) || // full UUID
  /^[0-9a-f]{6,}$/i.test(q);

export const searchTickets = async (query) => {
  const q = query.trim();
  if (!q) return [];

  if (looksLikeId(q)) {
    try {
      const ticket = await getTicketById(q);
      if (ticket) return [ticket];
    } catch {
      /* fall through to name search */
    }
  }

  // Name search
  return searchTicketsByUserName(q);
};

export const escalateTicket = async (id) => {
  return api.post(`/support/tickets/${encodeURIComponent(id)}/escalate`);
};

export const searchTicketsByUserName = async (userName) => {
  // Backend doesn't have a search-by-username endpoint yet,
  // so we fetch all tickets via stats and filter client-side.
  // This is a known limitation — a proper search endpoint should be added.
  const q = encodeURIComponent(userName.trim());
  try {
    const raw = await api.get(`/support/tickets/user/${q}`);
    const list = toList(raw);
    return (list.length ? list : raw ? [raw] : []).map(mapTicket);
  } catch {
    return [];
  }
};

export const getTicketsStats = async () => {
  const raw = await api.get("/support/tickets/stats");
  return {
    open: raw?.open ?? 0,
    closed: raw?.closed ?? 0,
    pending: raw?.pending ?? 0,
    avgResponseHours: raw?.avgResponseHours ?? raw?.avgResolutionHours ?? 0,
  };
};

// Chat

export const mapChatMessage = (m = {}) => {
  const sentAt = m.sentAt ?? m.createdAt ?? m.timestamp ?? null;
  let date = "—",
    time = "—";
  if (sentAt) {
    const d = new Date(sentAt);
    if (!Number.isNaN(d.getTime())) {
      date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      time = d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }

  const senderName =
    m.senderName?.trim() || m.sender?.name?.trim() || "Unknown";
  // Treat any role containing "agent" / "cs" / "support" as agent side
  const role = String(m.senderRole || m.role || "").toLowerCase();
  const isAgent =
    role.includes("agent") ||
    role.includes("cs") ||
    role.includes("support") ||
    role.includes("admin");

  return {
    id: m.id || String(Math.random()),
    text: m.message?.trim() || m.content?.trim() || "",
    from: isAgent ? "agent" : "user",
    type: m.type === 2 ? "note" : "reply",
    senderName,
    initials: senderName
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    profilePicture:
      m.profilePicture ||
      m.senderProfilePicture ||
      m.sender?.profilePicture ||
      null,
    date,
    time,
    _raw: m,
  };
};

export const getChatHistory = async (ticketId) => {
  const id = encodeURIComponent(ticketId);
  try {
    const raw = await api.get(`/chat/history/${id}`);
    return toList(raw).map(mapChatMessage);
  } catch (err) {
    if (err?.status === 404 || err?.response?.status === 404) return [];
    throw err;
  }
};

export const sendChatMessage = async (ticketId, message, type = 1) => {
  const body = { ticketId, message, type };
  const raw = await api.post("/chat/send", body);
  return raw ? mapChatMessage(raw) : null;
};
