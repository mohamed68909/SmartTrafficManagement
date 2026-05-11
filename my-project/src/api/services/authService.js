// ═══ AUTH SERVICE ═══
import { API_CONFIG } from "../config";
import api from "../apiClient";
import { MOCK_ACCOUNTS, MOCK_ME } from "../mock/authMock";

// Role → route mapping
const ROLE_ROUTES = {
  provider: "/provider",
  seller: "/seller",
  admin: "/admin",
  cs: "/cs-agent",
};

const normalizeRole = (role) => {
  const value = String(role || "")
    .trim()
    .toLowerCase();
  if (
    [
      "cs",
      "csagent",
      "cs_agent",
      "cs-agent",
      "customer_support",
      "customer support",
    ].includes(value)
  ) {
    return "cs";
  }
  if (["administrator"].includes(value)) return "admin";
  return value;
};

// resonse
const extractRole = (data) => {
  return (
    data?.data?.user?.role ||
    data?.user?.role ||
    data?.data?.role ||
    data?.role ||
    data?.Role ||
    null
  );
};

const extractToken = (data) => {
  return (
    data?.data?.accessToken ||
    data?.data?.token ||
    data?.accessToken ||
    data?.access_token ||
    data?.token ||
    null
  );
};

export const login = async (email, password) => {
  if (!API_CONFIG.BASE_URL) {
    const account = MOCK_ACCOUNTS.find(
      (a) => a.email === email && a.password === password,
    );
    if (!account) {
      const lang =
        typeof localStorage !== "undefined" &&
        localStorage.getItem("lang") === "en"
          ? "en"
          : "ar";
      throw new Error(
        lang === "en"
          ? "Invalid email or password"
          : "البريد الإلكتروني أو كلمة المرور غير صحيحة",
      );
    }
    localStorage.setItem("token", "mock-token");
    localStorage.setItem("role", account.role);
    localStorage.setItem("email", account.email);
    return {
      token: "mock-token",
      role: account.role,
      email: account.email,
      redirect: ROLE_ROUTES[account.role],
    };
  }

  // ── Live API ──
  const data = await api.post("/Auth/login", { email, password });

  const token = extractToken(data);
  const role = normalizeRole(extractRole(data));

  if (!token) throw new Error("لم يتم استلام token من الـ API");
  if (!role) throw new Error("لم يتم استلام role من الـ API");

  const userData = data?.data?.user || data?.user || {};

  const refreshToken = data?.data?.refreshToken ?? data?.refreshToken ?? "";
  localStorage.setItem("token", token);
  localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("role", role);
  localStorage.setItem("email", userData?.email || email);
  localStorage.setItem(
    "user",
    JSON.stringify({
      name: `${userData?.firstName || ""} ${userData?.lastName || ""}`.trim(),
      email: userData?.email || email,
      role,
      id: userData?.id || "",
      profilePicture: userData?.profilePicture || null,
    }),
  );

  return {
    token,
    role,
    email: userData?.email || email,
    redirect: ROLE_ROUTES[role] || "/",
  };
};

export const register = async (payload) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.post("/Auth/register", payload);
};

export const logout = async () => {
  const refreshToken = localStorage.getItem("refreshToken") || "";

  if (!API_CONFIG.BASE_URL) {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("user");
    return { success: true };
  }
  try {
    await api.post("/Auth/logout", { refreshToken });
  } catch {
    /* ignore */
  }
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
  localStorage.removeItem("user");
  return { success: true };
};

export const getMe = async () => {
  if (!API_CONFIG.BASE_URL) {
    const role = localStorage.getItem("role");
    return role ? MOCK_ME[role] : null;
  }
  return api.get("/Auth/me");
};

export const getProfile = async () => {
  if (!API_CONFIG.BASE_URL) return {};
  return api.get("/Auth/profile");
};
export const updateProfile = async (payload) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.put("/Auth/profile/update", payload);
};
export const changePassword = async (payload) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.patch("/Auth/change-password", payload);
};
export const forgotPassword = async (email) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.post("/Auth/forgot-password", { email });
};
export const resetPassword = async (payload) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.post("/Auth/reset-password", payload);
};
export const verifyOtp = async (payload) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.post("/Auth/verify-otp", payload);
};
export const refreshToken = async (payload) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.post("/Auth/refresh-token", payload);
};
export const googleLogin = async (payload) => {
  if (!API_CONFIG.BASE_URL) return { success: true };
  return api.post("/Auth/google-login", payload);
};

export const getRoleRoute = (role) => ROLE_ROUTES[normalizeRole(role)] || "/";
