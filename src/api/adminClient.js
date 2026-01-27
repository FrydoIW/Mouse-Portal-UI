const BASE_URL = "/api";

async function apiFetch(path, { method = "POST", body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    data = null;
  }

  if (!res.ok) {
    const msg =
      data?.remark ||
      data?.message ||
      `Request failed with status ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

// =======================
// 1) REGISTER ADMIN (adm0100)
// POST /api/register/adm0100
// body: { name, address, birthDt, gender, email, password }
// =======================
export async function registerAdminAdm0100(payload) {
  return apiFetch("/register/adm0100", { method: "POST", body: payload });
}

// =======================
// 8) SEND VERIFICATION EMAIL (ema0100)
// POST /api/sendMail/ema0100
// body: { adminEmail }
// =======================
export async function sendVerificationEmailEma0100(adminEmail) {
  return apiFetch("/sendMail/ema0100", {
    method: "POST",
    body: { adminEmail },
  });
}

// =======================
// 11) CHECK EMAIL VERIFIED STATUS (ema0400)
// POST /api/emailVerified/ema0400
// body: { emailAdmin }
// =======================
export async function checkEmailVerifiedEma0400(emailAdmin) {
  return apiFetch("/emailVerified/ema0400", {
    method: "POST",
    body: { emailAdmin },
  });
}

// =======================
// 2) GENERATE QR CODE 2FA (adm0200)
// POST /api/register2fa/adm0200
// body: { adminEmail }
// =======================
export async function generate2faQrAdm0200(adminEmail) {
  return apiFetch("/register2fa/adm0200", {
    method: "POST",
    body: { adminEmail },
  });
}

// =======================
// 4) VERIFY PASSWORD (adm0400)
// POST /api/verifyPass/adm0400
// body: { password, email }
// =======================
export async function verifyPasswordAdm0400(email, password) {
  return apiFetch("/verifyPass/adm0400", {
    method: "POST",
    body: { password, email },
  });
}

// =======================
// 7) VERIFY 2FA (adm0700)
// POST /api/verify2fa/adm0700
// body: { adminEmail, googleOtp }
// =======================
export async function verify2faAdm0700(adminEmail, googleOtp) {
  return apiFetch("/verify2fa/adm0700", {
    method: "POST",
    body: { adminEmail, googleOtp },
  });
}

// =======================
// 3) RESET PASSWORD (adm0300)
// POST /api/resetPass/adm0300
// body: { adminEmail, newPassword }
// =======================
export async function resetPasswordAdm0300(adminEmail, newPassword) {
  return apiFetch("/resetPass/adm0300", {
    method: "POST",
    body: { adminEmail, newPassword },
  });
}

// =======================
// 6) GET DATA ADMIN (adm0600)
// POST /api/getAdminData/adm0600
// body: { email }
// =======================
export async function getAdminDataAdm0600(email) {
  // NOTE: backend kamu memakai path /getData/adm0600
  return apiFetch("/getData/adm0600", {
    method: "POST",
    body: { email },
  });
}

// =======================
// 5) EDIT PROFILE (adm0500)
// POST /api/editProfile/adm0500
// body: { name, birthDt, gender, id }
// =======================
export async function editProfileAdm0500(payload) {
  return apiFetch("/editProfile/adm0500", { method: "POST", body: payload });
}

// =======================
// 10) EDIT EMAIL (ema0300)
// POST /api/editMail/ema0300
// body: { newAdminEmail, adminId }
// =======================
export async function editEmailEma0300(payload) {
  return apiFetch("/editMail/ema0300", { method: "POST", body: payload });
}

// =======================
// WORKSPACE (WSPxxxx)
// =======================
// (1) ADD ADMIN TO WORKSPACE (wsp0100)
// POST /api/insert/wsp0100
// body: { workspaceId, email }
export async function addAdminToWorkspaceWsp0100(payload) {
  return apiFetch("/insert/wsp0100", { method: "POST", body: payload });
}

// (2) EDIT WORKSPACE NAME (wsp0200)
// POST /api/edit/wsp0200
// body: { workspaceId, workspaceName }
export async function editWorkspaceNameWsp0200(payload) {
  return apiFetch("/edit/wsp0200", { method: "POST", body: payload });
}

// (3) GET ALL WORKSPACES FOR ADMIN (wsp0300)
// POST /api/getAllData/wsp0300
// body: { adminEmail }
export async function getAllWorkspaceByAdminWsp0300(adminEmail) {
  return apiFetch("/getAllData/wsp0300", {
    method: "POST",
    body: { adminEmail },
  });
}

// (4) DELETE WORKSPACE (wsp0400)
// POST /api/delete/wsp0400
// body: { workspaceId, adminId }
export async function deleteWorkspaceWsp0400(payload) {
  return apiFetch("/delete/wsp0400", { method: "POST", body: payload });
}
