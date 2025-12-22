// src/api/tikusClient.js

const BASE_URL = "/api";

// =======================
// REGISTER TKD0100
// =======================
// payload = { name, address, gender, birthDate, position, email, passwordCredential }
export async function registerTkd0100(payload) {
  const response = await fetch(`${BASE_URL}/register/tkd0100`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data.message) {
        message = data.message;
      }
    } catch (_) {
      // kalau backend nggak kirim JSON error, abaikan
    }
    throw new Error(message);
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

// =======================
// LOGIN TKD0200
// =======================
// endpoint: http://localhost:8080/api/login/tkd0200
// payload = { email, password }
export async function loginTkd0200(payload) {
  const response = await fetch(`${BASE_URL}/login/tkd0200`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "";

    // coba ambil error dari backend (remark/message)
    try {
      const data = await response.json();
      message = data?.remark || data?.message || "";
    } catch (_) {
      // ignore kalau bukan JSON
    }

    // fallback message yang "ramah", jangan tampil status 400 ke user
    if (!message) {
      const isOtpFlow = payload?.verifyOtp === true;

      if ([400, 401, 403].includes(response.status)) {
        message = isOtpFlow
          ? "OTP salah atau sudah kedaluwarsa."
          : "Email atau password salah.";
      } else {
        message = "Terjadi kesalahan saat login. Coba lagi.";
      }
    }

    throw new Error(message);
  }

  const data = await response.json();
  // contoh sukses:
  // { "status": "00", "remark": "Validating Auth Complete" }
  return data;
}

// =======================
// RESET / FORGOT PASSWORD TKD0300
// =======================
// endpoint: http://localhost:8080/api/reset/tkd0300
// VERIFY_EMAIL:
// {
//   "email": "johndoe@example.com",
//   "procType": "VERIFY_EMAIL",
//   "newPassword": ""
// }
//
// CHANGE_PASS:
// {
//   "email": "johndoe@example.com",
//   "procType": "CHANGE_PASS",
//   "newPassword": "root"
// }
export async function resetTkd0300(payload) {
  const response = await fetch(`${BASE_URL}/reset/tkd0300`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data.message) {
        message = data.message;
      }
    } catch (_) {}
    throw new Error(message);
  }

  const data = await response.json();
  // contoh sukses:
  // VERIFY_EMAIL: { "status": "00", "remark": "Email Correct" }
  // CHANGE_PASS:  { "status": "00", "remark": "Success Change Password" }
  return data;
}

export async function getAllDataTkd0400() {
  const response = await fetch(`${BASE_URL}/getAllData/tkd0400`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ showAllData: "" }),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data;
}

// =======================
// UPDATE TKD0500
// =======================
// payload = { address, gender, name, position, email, trxAmt }
export async function updateTkd0500(payload) {
  const response = await fetch(`${BASE_URL}/updateData/tkd0500`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data.remark || data.message) {
        message = data.remark || data.message;
      }
    } catch (_) {}
    throw new Error(message);
  }

  const data = await response.json(); // { status, remark }
  return data;
}

// =======================
// DELETE TKD0600
// =======================
// payload = { email, status: "00" }
export async function deleteTkd0600(payload) {
  const response = await fetch(`${BASE_URL}/deleteData/tkd0600`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data.remark || data.message) {
        message = data.remark || data.message;
      }
    } catch (_) {}
    throw new Error(message);
  }

  const data = await response.json(); // { status, remark }
  return data;
}

// =======================
// ATM APIs (ATM0100 - ATM0400)
// =======================

// ADD ATM0100
// payload = { nomorRekening, bank, owner, amount }
export async function addAtmAtm0100(payload) {
  const response = await fetch(`${BASE_URL}/addAtm/atm0100`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      message = data?.remark || data?.message || message;
    } catch (_) {}
    throw new Error(message);
  }

  return await response.json();
}

// GET ALL ATM0200
// payload = { getAllData: "" }
export async function getAllAtmAtm0200(payload = { getAllData: "" }) {
  const response = await fetch(`${BASE_URL}/getAllAtmData/atm0200`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      message = data?.remark || data?.message || message;
    } catch (_) {}
    throw new Error(message);
  }

  return await response.json();
}

// EDIT ATM0300
// payload = { id, nomorRekening, bank, owner, amount }
export async function editAtmAtm0300(payload) {
  const response = await fetch(`${BASE_URL}/editAtmData/atm0300`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      message = data?.remark || data?.message || message;
    } catch (_) {}
    throw new Error(message);
  }

  return await response.json();
}

// DELETE ATM0400
// payload = { atmId: "4" }
export async function deleteAtmAtm0400(payload) {
  const response = await fetch(`${BASE_URL}/deleteAtm/atm0400`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      message = data?.remark || data?.message || message;
    } catch (_) {}
    throw new Error(message);
  }

  return await response.json();
}
