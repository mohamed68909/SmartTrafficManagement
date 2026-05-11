import { API_CONFIG } from "./config";

const ERROR_MESSAGES = {
  ar: {
    unauthorized: "غير مصرح – يرجى تسجيل الدخول مجدداً",
    timeout: "انتهت مهلة الاتصال – يرجى المحاولة مرة أخرى",
  },
  en: {
    unauthorized: "Unauthorized – please sign in again",
    timeout: "Connection timed out – please try again",
  },
};

const currentLang = () => {
  const saved =
    typeof localStorage !== "undefined" ? localStorage.getItem("lang") : null;
  return saved === "en" ? "en" : "ar";
};

class ApiError extends Error {
  constructor(status, message, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  refreshQueue = [];
};

const tryRefreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token");

  const response = await fetch(`${API_CONFIG.BASE_URL}/Auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json();

  if (!response.ok || !data?.isSuccess) {
    throw new Error("Refresh failed");
  }

  const newToken = data?.data?.accessToken ?? data?.data?.token;
  const newRefresh = data?.data?.refreshToken ?? refreshToken;

  if (!newToken) throw new Error("No token in refresh response");

  localStorage.setItem("token", newToken);
  localStorage.setItem("refreshToken", newRefresh);

  return newToken;
};

const clearAuthAndRedirect = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
  localStorage.removeItem("user");
  window.location.href = "/";
};

const isFormDataBody = (body) =>
  typeof FormData !== "undefined" && body instanceof FormData;

async function request(method, path, body = null, isRetry = false) {
  const token = localStorage.getItem("token");
  const isFormData = isFormDataBody(body);
  const headers = isFormData ? {} : { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const options = { method, headers };
  if (body && method !== "GET") {
    options.body = isFormData ? body : JSON.stringify(body);
  }

  const url = `${API_CONFIG.BASE_URL}${path}`;
  const response = await fetch(url, options);

  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  }

  const normalizedPath = (path || "").toLowerCase();
  const isLoginRequest = normalizedPath === "/auth/login";

  if (response.status === 401 && isLoginRequest) {
    const msg =
      data?.error?.message ||
      data?.message ||
      data?.title ||
      (currentLang() === "en"
        ? "Invalid email or password"
        : "البريد الإلكتروني أو كلمة المرور غير صحيحة");
    throw new ApiError(401, msg, data);
  }

  if (response.status === 401 && !isRetry) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((newToken) => {
        headers["Authorization"] = `Bearer ${newToken}`;
        return request(method, path, body, true);
      });
    }

    isRefreshing = true;
    try {
      const newToken = await tryRefreshToken();
      processQueue(null, newToken);
      isRefreshing = false;
      return request(method, path, body, true);
    } catch (refreshError) {
      processQueue(refreshError);
      isRefreshing = false;
      clearAuthAndRedirect();
      throw new ApiError(401, ERROR_MESSAGES[currentLang()].unauthorized, data);
    }
  }

  if (response.status === 401 && isRetry) {
    clearAuthAndRedirect();
    throw new ApiError(401, ERROR_MESSAGES[currentLang()].unauthorized, data);
  }

  // Other errors
  if (!response.ok) {
    const msg =
      data?.error?.message ||
      data?.message ||
      data?.title ||
      `HTTP ${response.status}`;
    throw new ApiError(response.status, msg, data);
  }

  if (data !== null && typeof data === "object" && "isSuccess" in data) {
    if (!data.isSuccess) {
      const msg =
        data?.error?.message || data?.message || `HTTP ${response.status}`;
      throw new ApiError(response.status, msg, data);
    }
    return data.data ?? data;
  }

  return data;
}

const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  patch: (path, body) => request("PATCH", path, body),
  delete: (path) => request("DELETE", path),
};

export default api;
