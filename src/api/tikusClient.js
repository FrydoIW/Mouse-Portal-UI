// src/api/tikusClient.js

const BASE_URL = "http://localhost:8080/api";

// =======================
// REGISTER TKD0100
// =======================
// payload = { name, address, gender, birthDate, position, email, passwordCredential }
export async function registerTkd0100(payload) {
  const response = await fetch(`${BASE_URL}/tikus/tkd0100`, {
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
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data.message) {
        message = data.message;
      }
    } catch (_) {
      // abaikan kalau nggak ada JSON error
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
    } catch (_) {
      // abaikan kalau nggak ada JSON error
    }
    throw new Error(message);
  }

  const data = await response.json();
  // contoh sukses:
  // VERIFY_EMAIL: { "status": "00", "remark": "Email Correct" }
  // CHANGE_PASS:  { "status": "00", "remark": "Success Change Password" }
  return data;
}

export async function getAllDataTkd0400() {
  const response = await fetch("http://localhost:8080/api/getAllData/tkd0400", {
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
