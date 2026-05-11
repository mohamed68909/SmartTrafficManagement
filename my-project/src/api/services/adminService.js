//  ADMIN SERVICE 
import { API_CONFIG } from "../config";
import api from "../apiClient";
import {
  MOCK_ADMIN_DASHBOARD,
  MOCK_ADMIN_ANALYTICS,
  MOCK_ADMIN_APPROVALS,
  MOCK_ADMIN_APPROVALS_STATS,
  MOCK_ADMIN_SENSORS,
  MOCK_ADMIN_TRAFFIC,
  MOCK_ADMIN_ABOUT,
  MOCK_ADMIN_URGENT,
  MOCK_ADMIN_USERS,
  MOCK_ADMIN_TICKETS,
  MOCK_ADMIN_TICKETS_STATS,
  MOCK_ADMIN_CS_AGENTS,
  MOCK_ADMIN_RATINGS,
  MOCK_ADMIN_OPERATIONS,
  MOCK_ADMIN_NOTIFICATIONS,
} from "../mock/adminMock";

// HELPERS
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// { items: [] }
const toList = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.items)) return raw.items;
  return [];
};

const statusLabel = (s) => {
  if (s === 0) return "Pending";
  if (s === 1) return "In Progress";
  if (s === 2) return "Completed";
  return s ?? "Pending";
};

// DATA MAPPERS
const mapDashboard = (raw) => ({
  stats: [
    {
      label: "TOTAL USERS",
      val: raw.totalUsers ?? 0,
      icon: "👥",
      color: "var(--neon)",
      delta: "",
    },
    {
      label: "PROVIDERS",
      val: raw.totalProviders ?? 0,
      icon: "🛠",
      color: "var(--blue)",
      delta: "",
    },
    {
      label: "SELLERS",
      val: raw.totalSellers ?? 0,
      icon: "🏪",
      color: "var(--amber)",
      delta: "",
    },
    {
      label: "TOTAL ORDERS",
      val: raw.totalOrders ?? 0,
      icon: "📦",
      color: "var(--emerald)",
      delta: "",
    },
    {
      label: "REVENUE",
      val: `$${(raw.totalRevenue ?? 0).toLocaleString()}`,
      icon: "💰",
      color: "var(--neon)",
      delta: "",
    },
    {
      label: "OPEN TICKETS",
      val: raw.openTickets ?? 0,
      icon: "🎫",
      color: "var(--red)",
      delta: "",
    },
    {
      label: "PENDING APPROV.",
      val: raw.totalPendingApprovals ?? 0,
      icon: "⏳",
      color: "var(--amber)",
      delta: "",
    },
    {
      label: "SENSORS",
      val: raw.totalSensors ?? 0,
      icon: "📡",
      color: "var(--blue)",
      delta: "",
    },
  ],
  systemStatus: [],
  trafficMap: [],
  recentActivity: [],
  _raw: raw,
});

// analytics/orders/monthly
const mapAnalytics = (list) => {
  const months = toList(list);
  const total = months.reduce((s, m) => s + (m.ordersCount ?? 0), 0);
  const rev = months.reduce((s, m) => s + (m.totalAmount ?? 0), 0);
  return {
    stats: [
      { label: "TOTAL ORDERS", val: total, color: "var(--neon)", delta: "" },
      {
        label: "TOTAL REVENUE",
        val: `$${rev.toFixed(0)}`,
        color: "var(--amber)",
        delta: "",
      },
      {
        label: "AVG / MONTH",
        val: months.length ? Math.round(total / months.length) : 0,
        color: "var(--blue)",
        delta: "",
      },
      {
        label: "MONTHS",
        val: months.length,
        color: "var(--emerald)",
        delta: "",
      },
    ],
    monthlyChart: months.map((m) => ({
      m:
        typeof m.month === "number"
          ? MONTH_NAMES[(m.month - 1) % 12]
          : String(m.month ?? "?"),
      v: m.ordersCount ?? 0,
    })),
    userActivity: [55, 72, 60, 88, 75, 95, 82],
    _raw: list,
  };
};

// activity  [{ icon, color, text, time }]
const mapActivity = (list) =>
  toList(list).map((a) => {
    const type = (a.type ?? "").toLowerCase();
    const eventText =
      a.event ??
      `${a.clientName ?? "Unknown"} -> ${a.providerName ?? "Unassigned"}`;
    const icon =
      a.icon ??
      (a.serviceType === 1
        ? "SOS"
        : type === "ticket"
          ? "TKT"
          : type === "approval"
            ? "OK"
            : type === "user"
              ? "USR"
              : "EVT");
    const color =
      type === "approval"
        ? "rgba(0,229,160,.14)"
        : type === "ticket"
          ? "rgba(255,170,0,.14)"
          : type === "sos"
            ? "rgba(255,61,87,.14)"
            : type === "user"
              ? "rgba(0,204,255,.14)"
              : a.status === 2
                ? "rgba(170,255,0,.15)"
                : "rgba(255,61,87,.15)";
    const rawTime = a.timestamp ?? a.requestedAtUtc;
    return {
      icon,
      color,
      text: eventText,
      time: rawTime ? new Date(rawTime).toLocaleString("en-GB") : "",
      id: a.requestId ?? a.id ?? "—",
      _raw: a,
    };
  });

// approvals [{ id, name, type, service, docs, date, img }]
const mapApprovals = (list) =>
  toList(list).map((a) => ({
    id: a.providerId ?? a.id ?? a.applicationId ?? "—",
    name: a.fullName ?? a.name ?? a.applicantName ?? "Unknown",
    email: a.email ?? "—",
    phone: a.phone ?? "—",
    type: a.role ?? a.type ?? "—",
    service: a.specialty ?? a.service ?? a.serviceType ?? "—",
    docs: a.documentsCount ?? a.docsCount ?? a.documents ?? 0,
    date: a.registeredAt
      ? new Date(a.registeredAt).toLocaleDateString()
      : a.createdAt
        ? new Date(a.createdAt).toLocaleDateString()
        : (a.date ?? "—"),
    img: "📄",
    status:
      a.status === 1
        ? "Pending"
        : a.status === 2
          ? "Approved"
          : a.status === 3
            ? "Rejected"
            : statusLabel(a.status),
    _raw: a,
  }));

// approvals/stats [{ label, val, icon, color }]
const mapApprovalsStats = (raw) => [
  {
    label: "PENDING",
    val: raw?.pending ?? 0,
    icon: "⏳",
    color: "var(--amber)",
  },
  {
    label: "APPROVED",
    val: raw?.approved ?? 0,
    icon: "✅",
    color: "var(--emerald)",
  },
  {
    label: "REJECTED",
    val: raw?.rejected ?? 0,
    icon: "❌",
    color: "var(--red)",
  },
];

// users  [{ id, name, email, phone, status, role, initials, ... }]
const mapUsers = (raw) =>
  toList(raw).map((u) => ({
    id: u.id ?? "—",
    name: (u.fullName?.trim() || u.name?.trim()) ?? "Unknown",
    email: u.email?.trim() ?? "—",
    phone: (u.phoneNumber?.trim() || u.phone?.trim()) ?? "—",
    status: u.status?.trim() ? u.status : u.isActive ? "Active" : "Inactive",
    role: u.role ?? "—",
    points: u.points ?? 0,
    date: u.joinDate?.trim() ?? "—",
    initials:
      (u.fullName?.trim() || u.name?.trim() || "U")[0]?.toUpperCase() ?? "U",
    avatarGrad: "linear-gradient(135deg,var(--neon),#2eff80)",
    avatarColor: "#000",
    _raw: u,
  }));

// tickets/recent  { id, subject, user, priority, status, date }]
const mapTickets = (list) =>
  toList(list).map((t) => ({
    id: t.ticketId?.trim() || t.id?.trim() || "—",
    subject: t.subject?.trim() || t.title?.trim() || "—",
    user: t.userName?.trim() || t.clientName?.trim() || "—",
    agent: t.agentName?.trim() || t.agent?.trim() || "—",
    priority:
      t.priority === 2
        ? "High"
        : t.priority === 1
          ? "Medium"
          : t.priority === 0
            ? "Low"
            : "—",
    status: statusLabel(t.status),
    date: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "—",
    initials: (t.userName ?? t.clientName ?? "U")[0]?.toUpperCase() ?? "U",
    _raw: t,
  }));

// tickets/stats [{ label, val, icon, color }]
const mapTicketsStats = (raw) => {
  if (Array.isArray(raw)) return raw;
  const total = (raw?.open ?? 0) + (raw?.closed ?? 0) + (raw?.pending ?? 0);
  return [
    { label: "TOTAL", val: total, color: "var(--neon)" },
    { label: "OPEN", val: raw?.open ?? 0, color: "var(--red)" },
    { label: "PENDING", val: raw?.pending ?? 0, color: "var(--amber)" },
    { label: "CLOSED", val: raw?.closed ?? 0, color: "var(--emerald)" },
  ];
};

// cs-agents [{ id, name, email, status, tickets, initials }]
const mapCsAgents = (raw) =>
  toList(raw).map((a) => ({
    id: a.id ?? "—",
    name: a.name ?? "—",
    email: a.email ?? "—",
    code: a.code ?? "—",
    status: a.isActive ? "Active" : "Inactive",
    tickets: a.assignedTickets ?? 0,
    initials: (a.name ?? "A")[0]?.toUpperCase() ?? "A",
    _raw: a,
  }));

// ratings { list: [...] }
const mapRatings = (raw) => {
  const items = toList(raw);
  return {
    list: items.map((r) => ({
      id: r.id ?? "—",
      name: r.customerName ?? "Unknown",
      rating: r.stars ?? 0,
      count: 1,
      comment: r.comment ?? "—",
      target: r.target ?? "—",
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—",
      _raw: r,
    })),
    total: items.length,
    avgRating: items.length
      ? (items.reduce((s, r) => s + (r.stars ?? 0), 0) / items.length).toFixed(
          1,
        )
      : 0,
  };
};

// urgent [{ id, name, phone, type, location, status, initials }]
const mapUrgent = (list) =>
  toList(list).map((r, i) => ({
    id: r.requestId ?? `URG-${i + 1}`,
    name: r.clientName ?? "Unknown",
    phone: r.clientPhone ?? "—",
    type: r.serviceType === 1 ? "SOS" : "Service",
    location: r.latitude && r.longitude ? `${r.latitude}, ${r.longitude}` : "—",
    wait: r.requestedAt
      ? new Date(r.requestedAt).toLocaleTimeString("ar-EG")
      : "—",
    status: statusLabel(r.status),
    provider: r.providerName ?? "—",
    initials: (r.clientName ?? "U")[0]?.toUpperCase() ?? "U",
    _raw: r,
  }));

// sos/recent
const mapOperations = (list) =>
  toList(list).map((op, i) => ({
    id: op.requestId ?? `SOS-${i + 1}`,
    name: op.clientName ?? "Unknown",
    phone: op.clientPhone ?? "—",
    type: op.serviceType === 1 ? "SOS" : "Service",
    location:
      op.latitude && op.longitude ? `${op.latitude}, ${op.longitude}` : "—",
    status: statusLabel(op.status),
    provider: op.providerName ?? "—",
    date: op.requestedAt ? new Date(op.requestedAt).toLocaleDateString() : "—",
    initials: (op.clientName ?? "U")[0]?.toUpperCase() ?? "U",
    _raw: op,
  }));

// system-status { cards, techInfo, services, eventLog }
const mapSystemStatus = (raw) => ({
  cards: [
    {
      icon: "🧩",
      title: "Version",
      val: raw?.version ?? "1.0.0",
      sub: "Current",
      valColor: "var(--neon)",
    },
    {
      icon: "⏱️",
      title: "Uptime",
      val: raw?.uptime ?? "—",
      sub: "Since restart",
      valColor: "var(--emerald)",
    },
    {
      icon: "🗄️",
      title: "Database",
      val: raw?.dbConnected ? "Connected" : "Disconnected",
      sub: "",
      valColor: raw?.dbConnected ? "var(--emerald)" : "var(--red)",
    },
    {
      icon: "🔌",
      title: "Connections",
      val: raw?.activeConnections ?? 0,
      sub: "Active",
      valColor: "var(--blue)",
    },
  ],
  techInfo: [
    { label: "Version", val: raw?.version ?? "1.0.0", color: "var(--neon)" },
    {
      label: "DB Status",
      val: raw?.dbConnected ? "Connected" : "Disconnected",
      color: raw?.dbConnected ? "var(--emerald)" : "var(--red)",
    },
    { label: "Uptime", val: raw?.uptime ?? "—", color: "var(--amber)" },
    {
      label: "Connections",
      val: raw?.activeConnections ?? 0,
      color: "var(--blue)",
    },
  ],
  systemStatus: (raw?.services ?? []).map((s) => ({
    name: s.name,
    status:
      s.status === "operational"
        ? "Operational"
        : s.status === "degraded"
          ? "Degraded"
          : s.status,
    color:
      s.status === "operational"
        ? "var(--emerald)"
        : s.status === "degraded"
          ? "var(--amber)"
          : "var(--red)",
    uptime: `${s.uptimePct ?? 0}%`,
  })),
  eventLog: [],
  _raw: raw,
});

// me currentUser
const mapMe = (raw) => ({
  id: raw?.id ?? "—",
  name: `${raw?.firstName ?? ""} ${raw?.lastName ?? ""}`.trim() || "Admin",
  role: raw?.role ?? "Admin",
  email: raw?.email ?? "—",
  phone: raw?.phoneNumber ?? "—",
  status: "Active",
  initials: (raw?.firstName ?? "A")[0]?.toUpperCase() ?? "A",
  avatarGrad: "linear-gradient(135deg,var(--neon),#2eff80)",
  avatarColor: "#000",
  points: raw?.points ?? 0,
  _raw: raw,
});

// SERVICE FUNCTIONS
export const getDashboard = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_DASHBOARD;
  const r = await api.get("/admin/dashboard/summary");
  return mapDashboard(r ?? {});
};
export const getAnalytics = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_ANALYTICS;
  const r = await api.get("/admin/analytics/orders/monthly");
  return mapAnalytics(r);
};
export const getActivity = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_DASHBOARD?.recentActivity ?? [];
  const r = await api.get("/admin/activity");
  return mapActivity(r);
};
export const getApprovals = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_APPROVALS;
  const r = await api.get("/admin/approvals");
  return mapApprovals(r);
};
export const getApprovalsStats = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_APPROVALS_STATS;
  const r = await api.get("/admin/approvals/stats");
  return mapApprovalsStats(r);
};
export const getSensors = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_SENSORS;
  return api.get("/admin/sensors");
};
export const getTraffic = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_TRAFFIC;
  try {
    const raw = await api.get("/trafficincidents");
    const list = toList(raw);
    return {
      markers: list.map((inc) => ({
        id: inc.id,
        title: inc.title ?? "Incident",
        description: inc.description ?? "",
        lat: inc.latitude,
        lng: inc.longitude,
        severity: inc.severity ?? "Medium",
        location: inc.location ?? "",
      })),
      _raw: raw,
    };
  } catch {
    return { markers: [], _raw: {} };
  }
};
export const getAbout = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_ABOUT;
  const r = await api.get("/admin/system-status");
  return mapSystemStatus(r ?? {});
};
export const getUrgent = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_URGENT;
  const r = await api.get("/admin/urgent");
  return mapUrgent(r);
};
export const getUsers = async (type) => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_USERS[type] || [];
  const r = await api.get("/admin/users?page=1&pageSize=20");
  const all = toList(r);
  if (type === "seller")
    return mapUsers(all.filter((u) => u.role?.toLowerCase() === "seller"));
  if (type === "provider")
    return mapUsers(all.filter((u) => u.role?.toLowerCase() === "provider"));
  return mapUsers(all.filter((u) => u.role?.toLowerCase() === "driver"));
};
export const getUserById = async (id) => {
  if (!API_CONFIG.BASE_URL) return {};
  return api.get(`/admin/users/${id}`);
};
export const getTickets = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_TICKETS;
  const r = await api.get("/admin/tickets/recent");
  return mapTickets(r);
};
export const getTicketsStats = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_TICKETS_STATS;
  const r = await api.get("/admin/tickets/stats");
  return mapTicketsStats(r);
};
export const getTicketById = async (id) => {
  if (!API_CONFIG.BASE_URL) return {};
  return api.get(`/admin/tickets/${id}`);
};
export const getCsAgents = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_CS_AGENTS;
  const r = await api.get("/admin/cs-agents");
  return mapCsAgents(r);
};
export const getCsAgentById = async (id) => {
  if (!API_CONFIG.BASE_URL) return {};
  return api.get(`/admin/cs-agents/${id}`);
};
export const getRatings = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_RATINGS;
  const r = await api.get("/admin/ratings");
  return mapRatings(r);
};
export const getOperations = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_OPERATIONS;
  const r = await api.get("/admin/sos/recent");
  return mapOperations(r);
};
export const getSystemStatus = async () => {
  if (!API_CONFIG.BASE_URL) return [];
  return api.get("/admin/system-status");
};
export const getProviders = async () => {
  if (!API_CONFIG.BASE_URL) return [];
  return api.get("/admin/providers");
};
export const getMe = async () => {
  const r = await api.get("/Auth/me");
  return mapMe(r);
};

export const getNotifications = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_NOTIFICATIONS ?? [];
  const r = await api.get("/notifications");
  return toList(r);
};
export const getEventLog = async () => {
  if (!API_CONFIG.BASE_URL) return MOCK_ADMIN_ABOUT?.eventLog ?? [];
  const r = await api.get("/admin/activity");
  return mapActivity(r);
};
export const getRatingsOverview = async () => null;

// POST / PUT / DELETE
export const approveApplication = async (id) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.post(`/admin/approvals/${id}/approve`);
};
export const rejectApplication = async (id, reason) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.post(`/admin/approvals/${id}/reject`, { reason: reason ?? "" });
};
export const reviewDocs = async (id) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.get(`/admin/approvals/${id}/docs`);
};
export const addUser = async (d) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.post("/admin/users", {
    role: d.role ?? "user",
    firstName: d.firstName ?? "",
    lastName: d.lastName ?? "",
    email: d.email ?? "",
    phoneNumber: d.phoneNumber ?? d.phone ?? "",
    password: d.password ?? "",
  });
};

export const editUser = async (id, d) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.put(`/admin/users/${id}`, {
    name: `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim() || d.name || "",
    email: d.email ?? "",
    isActive: d.isActive ?? d.status === "Active",
  });
};
export const assignUrgent = async (id, providerId, note) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.post(`/admin/urgent/${id}/assign`, { providerId, note });
};
export const trackUrgent = async (id) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.get(`/admin/urgent/${id}/track`);
};
export const addCsAgent = async (d) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.post("/admin/cs-agents", {
    name: `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim() || d.name || "",
    email: d.email ?? "",
    password: d.password ?? "",
  });
};
export const activateCsAgent = async (id) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.post(`/admin/cs-agents/${id}/activate`);
};

//  Paginated users
export const getUsersPaged = async (type, page = 1, pageSize = 20) => {
  if (!API_CONFIG.BASE_URL) {
    const mock = MOCK_ADMIN_USERS[type] || [];
    return {
      items: mock,
      pageNumber: 1,
      pageSize: 20,
      totalCount: mock.length,
    };
  }
  if (type === "provider") {
    const r = await api.get(
      `/admin/providers?page=${page}&pageSize=${pageSize}`,
    );
    const items = toList(r);
    return {
      items: mapUsers(items),
      pageNumber: r?.pageNumber ?? page,
      pageSize: r?.pageSize ?? pageSize,
      totalCount: r?.totalCount ?? items.length,
    };
  }
  const r = await api.get(`/admin/users?page=${page}&pageSize=${pageSize}`);
  const all = toList(r);
  const filtered =
    type === "seller"
      ? all.filter((u) => u.role?.toLowerCase() === "seller")
      : all.filter((u) =>
          ["client", "driver", "user"].includes(u.role?.toLowerCase()),
        );
  return {
    items: mapUsers(filtered),
    pageNumber: r?.pageNumber ?? page,
    pageSize: r?.pageSize ?? pageSize,
    totalCount: r?.totalCount ?? filtered.length,
  };
};

//  Fetch ALL users across all pages
export const getAllUsers = async (type) => {
  if (!API_CONFIG.BASE_URL) {
    const mock = MOCK_ADMIN_USERS[type] || [];
    return mapUsers(mock);
  }

  //  totalCount
  const first = await api.get(`/admin/users?page=1&pageSize=20`);
  const totalCount = first?.totalCount ?? toList(first).length;
  const pageSize = first?.pageSize ?? 20;
  const totalPages = Math.ceil(totalCount / pageSize);

  const requests = [];
  for (let p = 2; p <= totalPages; p++) {
    requests.push(api.get(`/admin/users?page=${p}&pageSize=${pageSize}`));
  }
  const rest = await Promise.all(requests);

  const allRaw = [...toList(first), ...rest.flatMap((r) => toList(r))];

  if (type === "seller")
    return mapUsers(allRaw.filter((u) => u.role?.toLowerCase() === "seller"));
  if (type === "provider")
    return mapUsers(allRaw.filter((u) => u.role?.toLowerCase() === "provider"));
  return mapUsers(
    allRaw.filter((u) =>
      ["client", "driver", "user"].includes(u.role?.toLowerCase()),
    ),
  );
};

// Fetch ALL providers
export const getAllProviders = async () => {
  if (!API_CONFIG.BASE_URL) return mapUsers(MOCK_ADMIN_USERS["provider"] || []);
  const first = await api.get("/admin/providers?page=1&pageSize=20");
  const totalCount = first?.totalCount ?? toList(first).length;
  const pageSize = first?.pageSize ?? 20;
  const totalPages = Math.ceil(totalCount / pageSize);

  const requests = [];
  for (let p = 2; p <= totalPages; p++) {
    requests.push(api.get(`/admin/providers?page=${p}&pageSize=${pageSize}`));
  }
  const rest = await Promise.all(requests);
  const allRaw = [...toList(first), ...rest.flatMap((r) => toList(r))];
  return mapUsers(allRaw);
};
