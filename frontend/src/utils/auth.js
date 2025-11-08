import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "token";

// get the token from localStorage
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// set the token in localStorage
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

// remove the token from localStorage
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// decode the token to get user info
export function getUserFromToken() {
  const token = getToken();
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch (err) {
    // Invalid token: remove it to avoid repeated errors
    console.warn("Invalid token found and removed:", err);
    removeToken();
    return null;
  }
}

// check if the user is authenticated (valid token present)
export function isAuthenticated() {
  const payload = getUserFromToken();
  if (!payload) return false;

  // Check if token is expired
  if (payload.exp && typeof payload.exp === "number") {
    const now = Date.now() / 1000;
    if (payload.exp <= now) {
      removeToken();
      return false;
    }
  }
  return true;
}

// check if the user has admin privileges
export function isAdmin() {
  const payload = getUserFromToken();
  return !!(payload && payload.isAdmin);
}

// get authorization header for API requests
export function getAuthHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

