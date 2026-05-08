//  SELLER
import { API_CONFIG } from "../config";
import api from "../apiClient";

const toList = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.items)) return raw.items;
  return [];
};

const statusColor = (status = "") => {
  const s = status.toLowerCase();
  if (s.includes("new") || s.includes("ط¬ط¯ظٹط¯")) return "var(--blue)";
  if (s.includes("preparing") || s.includes("ظ‚ظٹط¯")) return "var(--amber)";
  if (s.includes("delivered") || s.includes("طھظ…")) return "var(--emerald)";
  if (s.includes("cancelled") || s.includes("ظ…ظ„ط؛ظٹ")) return "var(--red)";
  return "var(--text3)";
};

// Data Mappers
// Dashboard
const mapDashboard = (raw) => {
  if (!raw) return { stats: [], recentOrders: [] };
  return {
    stats: [
      {
        label: "Total Revenue",
        icon: "\u{1F4B0}",
        val: raw.totalRevenue ?? raw.revenue ?? "—",
        unit: "EGP",
        color: "var(--neon)",
        delta: raw.revenueChange ?? "",
      },
      {
        label: "Total Orders",
        icon: "\u{1F6D2}",
        val: raw.totalOrders ?? raw.orders ?? "—",
        unit: "",
        color: "var(--blue)",
        delta: raw.ordersChange ?? "",
      },
      {
        label: "Total Products",
        icon: "\u{1F4E6}",
        val: raw.totalProducts ?? raw.products ?? "—",
        unit: "",
        color: "var(--amber)",
        delta: raw.productsChange ?? "",
      },
      {
        label: "Avg. Rating",
        icon: "\u2605",
        val: raw.averageRating ?? raw.rating ?? "—",
        unit: "",
        color: "var(--yellow)",
        delta: raw.ratingChange ?? "",
      },
    ],
    // also expose raw fields directly for store header / reviews header
    totalRevenue: raw.totalRevenue ?? raw.revenue ?? null,
    totalOrders: raw.totalOrders ?? raw.orders ?? null,
    totalProducts: raw.totalProducts ?? raw.products ?? null,
    averageRating: raw.averageRating ?? raw.rating ?? null,
    totalReviews: raw.totalReviews ?? raw.reviews ?? null,
    pendingOrders: raw.pendingOrders ?? null,
  };
};

const mapProduct = (p = {}) => {
  const apiStatus = p.status != null ? String(p.status).trim() : "";
  const categoryObject =
    p.category && typeof p.category === "object" ? p.category : null;
  const categoryName =
    categoryObject?.name ??
    categoryObject?.categoryName ??
    p.categoryName ??
    (typeof p.category === "string" ? p.category : "");

  const stockVal = p.stock ?? p.quantity ?? p.stockQuantity ?? 0;
  const resolvedStatus =
    Number(stockVal) === 0 ? "Unavailable" : apiStatus || "Available";
  return {
    id: p.id ?? p.productId ?? "—",
    name:
      (p.name != null ? String(p.name).trim() : null) ||
      (p.title != null ? String(p.title).trim() : null) ||
      "?",
    categoryId:
      p.categoryId ?? categoryObject?.id ?? categoryObject?.categoryId ?? "",
    categoryName: categoryName ? String(categoryName).trim() : "",
    description:
      (p.description != null ? String(p.description).trim() : null) || "",
    cat: (categoryName ? String(categoryName).trim() : null) || "?",
    price: p.price ?? p.unitPrice ?? 0,
    stock: p.stock ?? p.quantity ?? p.stockQuantity ?? 0,
    sold: p.sold ?? p.soldCount ?? p.totalSold ?? 0,
    rating: p.rating ?? p.averageRating ?? "—",
    img: p.imageUrl || p.image || p.emoji || "\u{1F4E6}",
    status: resolvedStatus,
    _raw: p,
  };
};

// Products list
const mapProducts = (raw) => toList(raw).map(mapProduct);

// Categories list
const mapCategories = (raw) =>
  toList(raw).map((c) => ({
    id: c.id ?? c.categoryId ?? "",
    name: (c.name != null ? String(c.name).trim() : null) || "—",
    description:
      (c.description != null ? String(c.description).trim() : null) || "—",
    _raw: c,
  }));

// Orders list
const mapOrders = (raw) =>
  toList(raw).map((o) => {
    const rawStatus = o.status != null ? String(o.status) : "";
    return {
      id: o.id ?? o.orderId ?? "—",
      customer:
        (o.customerName != null ? String(o.customerName).trim() : null) ||
        (o.clientName != null ? String(o.clientName).trim() : null) ||
        (o.userName != null ? String(o.userName).trim() : null) ||
        "?",
      items:
        o.itemsCount ??
        o.productsCount ??
        (Array.isArray(o.items) ? o.items.length : "?"),
      total: o.total ?? o.totalAmount ?? o.amount ?? 0,
      status: rawStatus.trim() || "?",
      time: o.createdAt ?? o.orderedAt ?? o.requestedAtUtc ?? "—",
      color: statusColor(rawStatus),
      address:
        (o.address != null ? String(o.address) : null) ??
        (o.deliveryAddress != null ? String(o.deliveryAddress) : null) ??
        "?",
      phone:
        (o.customerPhone != null ? String(o.customerPhone).trim() : null) ||
        (o.clientPhone != null ? String(o.clientPhone).trim() : null) ||
        "?",
      note: o.note ?? o.notes ?? "",
      _raw: o,
    };
  });

// Orders stats
const mapOrdersStats = (raw) => {
  if (!raw) return [];
  const source = raw.stats ?? raw.ordersStats ?? raw.summary ?? raw;
  const pick = (...keys) => {
    for (const key of keys) {
      if (source?.[key] != null) return source[key];
    }
    return undefined;
  };
  raw = {
    ...source,
    total: pick("total", "totalOrders", "ordersCount", "orders"),
    new: pick("new", "newOrders", "pending", "pendingOrders"),
    preparing: pick(
      "preparing",
      "preparingOrders",
      "inProgress",
      "processing",
      "processingOrders",
    ),
    delivered: pick(
      "delivered",
      "deliveredOrders",
      "completed",
      "completedOrders",
    ),
  };
  return [
    {
      label: "Total Orders",
      icon: "\u{1F6D2}",
      val: raw.total ?? raw.totalOrders ?? "—",
      color: "var(--blue)",
    },
    {
      label: "New",
      icon: "NEW",
      val: raw.new ?? raw.newOrders ?? "—",
      color: "var(--neon)",
    },
    {
      label: "Preparing",
      icon: "\u2699",
      val: raw.preparing ?? raw.inProgress ?? "—",
      color: "var(--amber)",
    },
    {
      label: "Delivered",
      icon: "\u2713",
      val: raw.delivered ?? raw.completedOrders ?? "—",
      color: "var(--emerald)",
    },
  ];
};

// Analytics
const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const roundNumber = (value) => Math.round(toNumber(value) * 100) / 100;

const mapAnalytics = (raw, context = {}) => {
  const source = raw || {};
  const dashboard = context.dashboard || {};
  const mappedOrders = mapOrders(context.orders || []);

  const monthlyRaw = Array.isArray(source)
    ? source
    : Array.isArray(source.monthly)
      ? source.monthly
      : Array.isArray(source.monthlyChart)
        ? source.monthlyChart
        : [];

  const maxVal = Math.max(
    ...monthlyRaw.map((m) => m.totalAmount ?? m.revenue ?? m.v ?? 0),
    1,
  );
  const monthlyChart = monthlyRaw.map((m) => ({
    m: m.month ?? m.monthName ?? m.m ?? "—",
    v: m.totalAmount ?? m.revenue ?? m.v ?? 0,
    orders: m.ordersCount ?? m.orders ?? m.count ?? 0,
    p: Math.round(((m.totalAmount ?? m.revenue ?? m.v ?? 0) / maxVal) * 100),
  }));

  // top products from API if available
  const topProductsRaw = Array.isArray(source.topProducts)
    ? source.topProducts
    : Array.isArray(source.bestSellers)
      ? source.bestSellers
      : [];
  const topProducts = topProductsRaw.map((p) => ({
    name: (p.name ?? p.productName ?? "—").toString().trim(),
    sold: p.sold ?? p.soldCount ?? p.totalSold ?? 0,
    revenue: p.revenue ?? p.totalRevenue ?? p.amount ?? 0,
    rating: p.rating ?? p.averageRating ?? "—",
  }));

  // orders by status breakdown
  const obs = source.ordersByStatus ?? source.statusBreakdown ?? null;
  const ordersByStatus = obs
    ? Object.entries(obs).map(([k, v]) => ({ label: k, val: Number(v) }))
    : mappedOrders.reduce((acc, order) => {
        const label = order.status || "Unknown";
        const item = acc.find(
          (row) => row.label.toLowerCase() === label.toLowerCase(),
        );
        if (item) item.val += 1;
        else acc.push({ label, val: 1 });
        return acc;
      }, []);

  // summary ? may come as a nested object or root fields
  const s = source.summary ?? source;
  const monthlyRevenue = monthlyChart.reduce(
    (sum, month) => sum + toNumber(month.v),
    0,
  );
  const monthlyOrders = monthlyChart.reduce(
    (sum, month) => sum + toNumber(month.orders),
    0,
  );
  const statusOrderCount = ordersByStatus.reduce(
    (sum, row) => sum + toNumber(row.val),
    0,
  );
  const explicitOrderCount =
    s.totalOrders ??
    s.orders ??
    dashboard.totalOrders ??
    dashboard.orders ??
    null;
  const totalOrders = toNumber(
    explicitOrderCount ??
      (monthlyOrders || mappedOrders.length || statusOrderCount),
  );
  const totalRevenue = roundNumber(
    s.totalRevenue ??
      s.revenue ??
      dashboard.totalRevenue ??
      dashboard.revenue ??
      monthlyRevenue,
  );
  const avgOrderValue = roundNumber(
    s.avgOrderValue ??
      s.average ??
      (totalOrders > 0 ? totalRevenue / totalOrders : 0),
  );
  const completedOrders = ordersByStatus
    .filter((row) => {
      const label = String(row.label || "").toLowerCase();
      return (
        label.includes("deliver") ||
        label.includes("complete") ||
        label.includes("paid") ||
        label.includes("تم")
      );
    })
    .reduce((sum, row) => sum + toNumber(row.val), 0);
  const conversionRate = roundNumber(
    s.conversionRate ??
      s.conversion ??
      (statusOrderCount > 0 ? (completedOrders / statusOrderCount) * 100 : 0),
  );
  return {
    stats: [
      {
        label: "Total Revenue",
        icon: "\u{1F4B0}",
        val: s.totalRevenue ?? s.revenue ?? "—",
        unit: "EGP",
        color: "var(--neon)",
        pct: s.revenueGrowth ? `? ${s.revenueGrowth}%` : "",
      },
      {
        label: "Orders",
        icon: "\u{1F4E6}",
        val: s.totalOrders ?? s.orders ?? "—",
        unit: "",
        color: "var(--blue)",
        pct: s.ordersGrowth ? `? ${s.ordersGrowth}%` : "",
      },
      {
        label: "Avg. Order Value",
        icon: "\u{1F4B3}",
        val: s.avgOrderValue ?? s.average ?? "—",
        unit: "EGP",
        color: "var(--amber)",
        pct: s.avgGrowth ? `? ${s.avgGrowth}%` : "",
      },
      {
        label: "Conversion Rate",
        icon: "\u{1F4CA}",
        val: s.conversionRate ?? s.conversion ?? "—",
        unit: s.conversionRate != null ? "%" : "",
        color: "var(--emerald)",
        pct: "",
      },
    ],
    monthlyChart,
    topProducts,
    ordersByStatus,
    derivedStats: [
      {
        label: "Total Revenue",
        icon: "\u{1F4B0}",
        val: totalRevenue,
        unit: "EGP",
        color: "var(--neon)",
        pct: s.revenueGrowth ? `? ${s.revenueGrowth}%` : "",
      },
      {
        label: "Orders",
        icon: "\u{1F4E6}",
        val: totalOrders,
        unit: "",
        color: "var(--blue)",
        pct: s.ordersGrowth ? `? ${s.ordersGrowth}%` : "",
      },
      {
        label: "Avg. Order Value",
        icon: "\u{1F4B3}",
        val: avgOrderValue,
        unit: "EGP",
        color: "var(--amber)",
        pct: s.avgGrowth ? `? ${s.avgGrowth}%` : "",
      },
      {
        label: "Conversion Rate",
        icon: "\u{1F4CA}",
        val: conversionRate,
        unit: "%",
        color: "var(--emerald)",
        pct: "",
      },
    ],
    // raw totals for derived charts
    totalRevenue: s.totalRevenue ?? s.revenue ?? 0,
    totalOrders: s.totalOrders ?? s.orders ?? 0,
  };
};

// Store
const mapStore = (raw) => {
  if (!raw) return null;
  return {
    name: raw.storeName?.trim() || raw.name?.trim() || "?",
    description: raw.description?.trim() || raw.bio?.trim() || "",
    logo: raw.logo?.trim() || raw.logoUrl?.trim() || raw.imageUrl?.trim() || "",
    location: raw.location?.trim() || raw.address?.trim() || "?",
    phone: raw.phone?.trim() || raw.phoneNumber?.trim() || "?",
    email: raw.email?.trim() || "?",
    products: raw.totalProducts ?? raw.productsCount ?? 0,
    rating: raw.rating ?? raw.averageRating ?? "—",
    reviews: raw.totalReviews ?? raw.reviewsCount ?? 0,
    since: raw.memberSince ?? raw.createdAt ?? "—",
    verified: raw.isVerified ?? raw.verified ?? false,
    initials: (raw.storeName || raw.name || "ST").slice(0, 2).toUpperCase(),
    _raw: raw,
  };
};

// Reviews
const mapReviews = (raw) =>
  toList(raw).map((r) => ({
    id: r.id ?? r.reviewId ?? "",
    name:
      r.customerName?.trim() ||
      r.userName?.trim() ||
      r.clientName?.trim() ||
      "Anonymous",
    product: r.productName?.trim() || r.itemName?.trim() || "?",
    stars: r.stars ?? r.rating ?? r.score ?? 0,
    text: r.comment?.trim() || r.review?.trim() || r.message?.trim() || "",
    time: r.createdAt ?? r.reviewDate ?? r.date ?? "—",
    _raw: r,
  }));

// Settings
const SETTINGS_FIELDS = [
  {
    key: "emailNotifications",
    label: "Email Notifications",
    desc: "Receive order and account updates by email",
  },
  {
    key: "smsNotifications",
    label: "SMS Notifications",
    desc: "Receive important updates by SMS",
  },
  {
    key: "autoAcceptOrders",
    label: "Auto Accept Orders",
    desc: "Automatically accept incoming orders",
  },
];

const mapSettings = (raw) => {
  const source = Array.isArray(raw)
    ? raw.reduce((acc, s) => {
        const key = s.key ?? s.id ?? s.name;
        if (key) acc[key] = s.on ?? s.enabled ?? s.value;
        return acc;
      }, {})
    : raw || {};

  return SETTINGS_FIELDS.map((field) => ({
    ...field,
    on: Boolean(source[field.key]),
    _raw: source,
  }));
};

const mapSettingsPayload = (settings) => {
  const source = Array.isArray(settings)
    ? settings.reduce((acc, item) => {
        if (item?.key) acc[item.key] = item.on;
        return acc;
      }, {})
    : settings || {};

  return {
    emailNotifications: Boolean(source.emailNotifications),
    smsNotifications: Boolean(source.smsNotifications),
    autoAcceptOrders: Boolean(source.autoAcceptOrders),
  };
};

const appendFormValue = (form, key, value) => {
  form.append(key, value == null ? "" : String(value));
};

const mapProductPayloadToFormData = (d = {}) => {
  const form = new FormData();
  appendFormValue(form, "CategoryId", d.categoryId);
  appendFormValue(form, "Name", d.name);
  appendFormValue(form, "Description", d.description);
  appendFormValue(form, "Price", Number(d.price) || 0);
  appendFormValue(form, "StockQuantity", Number(d.stockQuantity) || 0);

  form.append("Image", d.image || "");
  appendFormValue(form, "ImageUrl", d.imageUrl);
  return form;
};

export const getDashboard = async () => {
  const raw = await api.get("/seller/dashboard");
  return mapDashboard(raw);
};

export const getProducts = async () => {
  const raw = await api.get("/seller/products");
  return mapProducts(raw);
};

export const getCategories = async () => {
  const raw = await api.get("/seller/categories");
  return mapCategories(raw);
};

export const getOrders = async () => {
  const raw = await api.get("/seller/orders");
  return mapOrders(raw);
};

export const getOrdersStats = async () => {
  const raw = await api.get("/seller/orders/stats");
  return mapOrdersStats(raw);
};

export const getAnalytics = async () => {
  const safe = (fn, fallback) => fn().catch(() => fallback);
  const [raw, dashboard, orders] = await Promise.all([
    safe(() => api.get("/seller/analytics"), null),
    safe(() => api.get("/seller/dashboard"), null),
    safe(() => api.get("/seller/orders"), []),
  ]);
  return mapAnalytics(raw, { dashboard, orders });
};

export const getStore = async () => {
  const raw = await api.get("/seller/store");
  return mapStore(raw);
};

export const getReviews = async () => {
  const raw = await api.get("/seller/reviews");
  return mapReviews(raw);
};

export const getSettings = async () => {
  const raw = await api.get("/seller/settings");
  return mapSettings(raw);
};

export const getOrderById = async (id) => {
  const raw = await api.get(`/seller/orders/${id}`);
  return mapOrders([raw])[0] || {};
};

export const addProduct = async (d) => {
  const raw = await api.post(
    "/seller/products",
    mapProductPayloadToFormData(d),
  );
  return raw ? mapProduct(raw) : null;
};

export const updateProduct = async (id, d) => {
  const raw = await api.put(
    `/seller/products/${id}`,
    mapProductPayloadToFormData(d),
  );
  return raw ? mapProduct(raw) : null;
};

export const removeProduct = async (id) => api.delete(`/seller/products/${id}`);

const mapCategoryPayload = (d = {}) => ({
  name: d?.name?.trim() || "",
  description: d?.description?.trim() || "",
});

export const addCategory = async (d) =>
  api.post("/seller/categories", mapCategoryPayload(d));

export const updateCategory = async (id, d) =>
  api.put(`/seller/categories/${id}`, mapCategoryPayload(d));

export const removeCategory = async (id) =>
  api.delete(`/seller/categories/${id}`);

export const prepareOrder = async (id) =>
  api.post(`/seller/orders/${id}/prepare`);

export const restockProduct = async (id, quantity) =>
  api.post(`/seller/products/${id}/restock`, { quantity: Number(quantity) });

export const updateStore = async (d) =>
  api.put("/seller/store", {
    name: d?.name?.trim() || "",
    description: d?.description?.trim() || "",
    logo: d?.logo?.trim() || "",
  });

export const updateSettings = async (d) =>
  api.put("/seller/settings", mapSettingsPayload(d));
