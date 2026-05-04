const API_BASE = "http://localhost:5000/api";

export const getStoredAuth = () => {
  const raw = localStorage.getItem("sparekart_auth");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setStoredAuth = (auth) => {
  localStorage.setItem("sparekart_auth", JSON.stringify(auth));
};

export const clearStoredAuth = () => {
  localStorage.removeItem("sparekart_auth");
};

export const isAdminLoggedIn = () => localStorage.getItem("sparekart_admin") === "true";
export const setAdminLogin = (value) =>
  localStorage.setItem("sparekart_admin", value ? "true" : "false");

// Simple in-memory cache with TTL (time-to-live)
const apiCache = {};
const CACHE_TTL = 30000; // 30 seconds — data stays fresh for 30s

/**
 * Invalidate cache for a specific path or all paths
 * Call this after any mutation (POST/PUT/DELETE) that changes data
 */
export const invalidateCache = (pathPrefix) => {
  if (!pathPrefix) {
    // Clear everything
    Object.keys(apiCache).forEach((k) => delete apiCache[k]);
    return;
  }
  // Clear any cache key whose path portion starts with the prefix
  // Keys are now formatted as "token::path"
  Object.keys(apiCache).forEach((k) => {
    const pathPart = k.includes("::") ? k.split("::")[1] : k;
    if (pathPart.startsWith(pathPrefix)) delete apiCache[k];
  });
};

/** Clear ALL cached data — call on login, logout, or register to prevent cross-user data leaks */
export const clearAllCache = () => {
  Object.keys(apiCache).forEach((k) => delete apiCache[k]);
};

export const apiFetch = async (path, options = {}) => {
  const auth = getStoredAuth();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (auth?.token) headers.Authorization = `Bearer ${auth.token}`;

  const isGet = (!options.method || options.method.toUpperCase() === "GET");
  // ✅ Include token in cache key so different users NEVER share cached data
  const cacheKey = `${auth?.token || "anon"}::${path}`;

  // For GET requests, return cached data if it's still fresh
  if (isGet && apiCache[cacheKey]) {
    const cached = apiCache[cacheKey];
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data; // Return fresh cached data instantly
    }
    // Cache is stale — delete it and fetch fresh
    delete apiCache[cacheKey];
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  // Cache GET responses with timestamp
  if (isGet) {
    apiCache[cacheKey] = { data, timestamp: Date.now() };
  }

  // After any mutation, invalidate related caches for this user's token
  if (!isGet) {
    // Extract the resource path (e.g., "/products/123" -> "/products")
    const basePath = "/" + path.split("/").filter(Boolean)[0];
    invalidateCache(basePath);
    // Also invalidate admin dashboard since it depends on multiple resources
    invalidateCache("/admin");
  }

  return data;
};
