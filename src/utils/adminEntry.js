import { getAdminDataAdm0600 } from "../api/adminClient.js";

const ADMIN_ENTRY_KEY = "tk-adminEntry";

export function getCachedAdminEntry() {
  return String(localStorage.getItem(ADMIN_ENTRY_KEY) || "").trim();
}

export async function resolveAdminEntry(email) {
  const cached = getCachedAdminEntry();
  if (cached) return cached;

  const normalizedEmail = String(email || "").trim();
  if (!normalizedEmail) {
    throw new Error("Session admin tidak ditemukan.");
  }

  const res = await getAdminDataAdm0600(normalizedEmail);
  const out = res?.output || {};
  const resolved = String(out?.id ?? out?.adminId ?? out?.admin_id ?? "").trim();

  if (!resolved) {
    throw new Error("Admin Entry tidak ditemukan. Silakan login ulang.");
  }

  localStorage.setItem(ADMIN_ENTRY_KEY, resolved);
  return resolved;
}
