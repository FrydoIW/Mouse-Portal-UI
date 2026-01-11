// Simple client-side session helper (20 minutes).
// This is for UX (auto-logout / route guard). Backend must still enforce auth.

export const SESSION_MINUTES = 20;

const KEY_EMAIL = "authEmail";
const KEY_EXPIRES_AT = "tkSessionExpiresAt";

export function startSession(email) {
  if (email) localStorage.setItem(KEY_EMAIL, email);
  refreshSession();
}

export function refreshSession() {
  const expiresAt = Date.now() + SESSION_MINUTES * 60 * 1000;
  localStorage.setItem(KEY_EXPIRES_AT, String(expiresAt));
  return expiresAt;
}

export function getExpiresAt() {
  const v = Number(localStorage.getItem(KEY_EXPIRES_AT) || 0);
  return Number.isFinite(v) ? v : 0;
}

export function isSessionValid() {
  const email = localStorage.getItem(KEY_EMAIL);
  const exp = getExpiresAt();
  return Boolean(email) && exp > 0 && Date.now() < exp;
}

export function getSessionEmail() {
  if (!isSessionValid()) return "";
  return localStorage.getItem(KEY_EMAIL) || "";
}

export function clearSession() {
  // keep list explicit so behavior stays predictable
  const keys = [
    KEY_EMAIL,
    KEY_EXPIRES_AT,
    "token",
    "accessToken",
    "isLogin",
    "isLoggedIn",
    "user",
  ];
  keys.forEach((k) => localStorage.removeItem(k));
}
