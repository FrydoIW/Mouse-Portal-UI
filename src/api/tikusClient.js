// src/api/tikusClient.js
const BASE_URL = "/api";

async function postJson(path, payload) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload ?? {}),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.remark || data?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  // most endpoints use status: "00" for success
  if (data?.status && data.status !== "00") {
    // Some older endpoints might use "09" for success; keep compatibility.
    const okAlt = data.status === "09" && /success/i.test(String(data.remark || ""));
    if (!okAlt) throw new Error(data?.remark || "Request failed");
  }

  return data;
}

// =======================
// BRANCH (BROxxxx)
// =======================
export async function insertBranchBro0100(payload) {
  // { branchName }
  return postJson("/insertBranch/bro0100", payload);
}

export async function editBranchBro0200(payload) {
  // { branchId, branchName }
  return postJson("/editBranch/bro0200", payload);
}

export async function deleteBranchBro0300(payload) {
  // { branchId }
  return postJson("/deleteBranch/bro0300", payload);
}

export async function getAllBranchBro0400() {
  // backend expects a body
  return postJson("/getAllBranch/bro0400", { getAllBranch: "GetAllData" });
}

// =======================
// TKD MEMBER (TKDxxxx)
// =======================
export async function registerTkd0100(payload) {
  // full payload from your spec
  return postJson("/register/tkd0100", payload);
}

export async function getAllDataTkd0200() {
  return postJson("/getAllData/tkd0200", { showAllData: "" });
}

export async function updateTkd0300(payload) {
  return postJson("/updateData/tkd0300", payload);
}

export async function deleteTkd0400(payload) {
  return postJson("/deleteData/tkd0400", payload);
}

// =======================
// ATM / BANK INFO (ATMxxxx)
// =======================
export async function addAtmAtm0100(payload) {
  return postJson("/addAtm/atm0100", payload);
}

export async function getAllAtmAtm0200() {
  return postJson("/getAllAtmData/atm0200", { getAllData: "getAll" });
}

export async function editAtmAtm0300(payload) {
  return postJson("/editAtmData/atm0300", payload);
}

export async function deleteAtmAtm0400(payload) {
  // { atmId }
  return postJson("/deleteAtm/atm0400", payload);
}

// =======================
// EXPENSE (EXPxxxx)
// =======================
export async function insertExpenseExp0100(payload) {
  return postJson("/insertExpense/exp0100", payload);
}

export async function editExpenseExp0200(payload) {
  return postJson("/editExpense/exp0200", payload);
}

export async function deleteExpenseExp0300(payload) {
  return postJson("/deleteExpense/exp0300", payload);
}

export async function getAllExpenseExp0400() {
  return postJson("/getAllExpense/exp0400", { getAllData: "" });
}
