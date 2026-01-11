// src/pages/ExpensePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllBranchBro0400,
  // expense
  getAllExpenseExp0400,
  insertExpenseExp0100,
  editExpenseExp0200,
  deleteExpenseExp0300,
} from "../api/tikusClient.js";
import { clearSession } from "../utils/auth.js";

function toDateInput(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatIdr(val) {
  const n = Number(val ?? 0);
  if (Number.isNaN(n)) return "-";
  return n.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const pillBtn = (active) => ({
  padding: "10px 16px",
  borderRadius: 999,
  border: active ? "none" : "1px solid var(--card-border)",
  background: active ? "linear-gradient(135deg, #38bdf8 0%, #6366f1 55%, #22c55e 100%)" : "transparent",
  color: active ? "#071021" : "var(--text)",
  fontWeight: 700,
  cursor: active ? "default" : "pointer",
  boxShadow: active ? "0 18px 40px rgba(15, 23, 42, 0.55)" : "none",
});

const card = {
  borderRadius: 18,
  border: "1px solid var(--card-border)",
  background: "var(--card-bg)",
  backdropFilter: "blur(14px)",
  padding: 16,
  boxShadow: "0 30px 60px rgba(2, 6, 23, 0.55)",
};

const input = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid var(--card-border)",
  background: "rgba(2, 6, 23, 0.25)",
  color: "var(--text)",
  outline: "none",
};

const selectStyle = { ...input };

const smallBtn = (variant = "default") => ({
  padding: "10px 14px",
  borderRadius: 999,
  border: variant === "danger" ? "1px solid rgba(239,68,68,0.45)" : "1px solid var(--card-border)",
  background:
    variant === "primary"
      ? "linear-gradient(135deg, #38bdf8 0%, #6366f1 55%, #22c55e 100%)"
      : variant === "danger"
      ? "rgba(239,68,68,0.10)"
      : "transparent",
  color: variant === "primary" ? "#071021" : "var(--text)",
  fontWeight: 700,
  cursor: "pointer",
});

const badge = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 12px",
  borderRadius: 999,
  border: "1px solid var(--card-border)",
  background: "rgba(2, 6, 23, 0.25)",
  color: "var(--text)",
  fontWeight: 700,
  fontSize: 12.5,
};

const label = { fontSize: 12.5, color: "var(--card-text-sub)", fontWeight: 700 };

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 18,
  zIndex: 999,
};

const modalCard = {
  width: "100%",
  maxWidth: 720,
  borderRadius: 18,
  border: "1px solid var(--card-border)",
  background: "var(--card-bg)",
  backdropFilter: "blur(14px)",
  padding: 14,
};

export default function ExpensePage() {
  const navigate = useNavigate();
  const email = localStorage.getItem("authEmail") || "";

  const [theme, setTheme] = useState(() => localStorage.getItem("tk-theme") || "dark");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("tk-theme", theme);
  }, [theme]);
  const toggleTheme = () => setTheme((p) => (p === "dark" ? "light" : "dark"));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(() => {
    const v = localStorage.getItem("tk-branchId");
    return v ? Number(v) : "";
  });

  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("add"); // add | edit
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    id: "",
    expenseName: "",
    cost: "",
    dueDate: "",
    memo: "",
    branchId: "",
  });

  const [confirmDelete, setConfirmDelete] = useState(null); // {id, expenseName}

  async function reloadBranches() {
    const res = await getAllBranchBro0400();
    const list = Array.isArray(res?.resultList) ? res.resultList : [];
    setBranches(list);
    return list;
  }

  async function reloadExpense(branchIdFallback) {
    const res = await getAllExpenseExp0400();
    const list = Array.isArray(res?.resultList) ? res.resultList : [];
    // Beberapa response backend tidak mengembalikan branchId/memo.
    // Supaya list tetap tampil, kita normalisasi field yang sering kosong.
    const bid = branchIdFallback ? Number(branchIdFallback) : undefined;
    const normalized = list.map((it) => ({
      ...it,
      branchId: it?.branchId ?? bid,
      memo: it?.memo ?? "",
    }));
    setItems(normalized);
    return normalized;
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const [b] = await Promise.all([reloadBranches(), reloadExpense()]);
        if (!alive) return;
        const firstId = b?.[0]?.branchId ?? "";
        const stored = localStorage.getItem("tk-branchId");
        const pick = stored ? Number(stored) : firstId;
        if (pick && !selectedBranchId) {
          setSelectedBranchId(pick);
          localStorage.setItem("tk-branchId", String(pick));
        }
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Gagal mengambil data");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedBranch = useMemo(() => {
    const id = Number(selectedBranchId);
    return branches.find((b) => Number(b.branchId) === id) || null;
  }, [branches, selectedBranchId]);

  const filtered = useMemo(() => {
    const id = Number(selectedBranchId);
    const q = searchQuery.trim().toLowerCase();
    return items.filter((x) => {
      // filter branch hanya jika data memang membawa branchId
      if (id && x.branchId != null && Number(x.branchId) !== id) return false;
      if (!q) return true;
      return (
        String(x.expenseName || "").toLowerCase().includes(q) ||
        String(x.memo || "").toLowerCase().includes(q)
      );
    });
  }, [items, selectedBranchId, searchQuery]);

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  const pickBranch = (val) => {
    setSelectedBranchId(val);
    if (val) localStorage.setItem("tk-branchId", String(val));
  };

  const openAdd = () => {
    if (!selectedBranchId) return;
    setMode("add");
    setForm({ id: "", expenseName: "", cost: "", dueDate: "", memo: "", branchId: Number(selectedBranchId) });
    setModalOpen(true);
  };

  const openEdit = (it) => {
    setMode("edit");
    setForm({
      id: it.id,
      expenseName: it.expenseName || "",
      cost: it.cost ?? "",
      dueDate: toDateInput(it.dueDate),
      memo: it.memo || "",
      branchId: Number(it.branchId ?? selectedBranchId),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (busy) return;
    setModalOpen(false);
  };

  const submit = async () => {
    const payload = { ...form, branchId: Number(form.branchId || selectedBranchId || 0) };
    if (!payload.branchId) return;
    if (!payload.expenseName.trim()) return;

    const costNum = Number(payload.cost);
    if (!Number.isNaN(costNum)) payload.cost = costNum;

    try {
      setBusy(true);
      if (mode === "add") {
        delete payload.id;
        await insertExpenseExp0100(payload);
      } else {
        await editExpenseExp0200(payload);
      }
      await reloadExpense(selectedBranchId);
      closeModal();
    } catch (e) {
      setError(e?.message || "Gagal simpan expense");
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async (id) => {
    try {
      setBusy(true);
      await deleteExpenseExp0300({ id: String(id) });
      setConfirmDelete(null);
      await reloadExpense(selectedBranchId);
    } catch (e) {
      setError(e?.message || "Gagal hapus expense");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: "22px 26px 0" }}>
      {/* TOP BAR */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "linear-gradient(135deg, #38bdf8, #6366f1)",
            display: "grid", placeItems: "center",
            color: "#071021", fontWeight: 900,
          }}>
            TK
          </div>
          <div>
            <div style={{ fontWeight: 900, letterSpacing: 0.6 }}>TIKUS DASHBOARD</div>
            <div style={{ fontSize: 12.5, color: "var(--card-text-sub)" }}>Monitor Your Data Realtime</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button style={smallBtn()} onClick={toggleTheme}>
            {theme === "dark" ? "☀️ Light mode" : "🌙 Dark mode"}
          </button>
          <div style={{ color: "var(--card-text-sub)", fontSize: 13.5 }}>Hi,</div>
          <div style={{ fontWeight: 800 }}>{email}</div>
          <button style={smallBtn()} onClick={() => navigate("/profile")}>Profile</button>
          <button style={smallBtn("danger")} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* HERO */}
      <div style={{ marginTop: 20, padding: "22px 24px", borderRadius: 22, border: "1px solid var(--card-border)", background: "rgba(2,6,23,0.35)", backdropFilter: "blur(14px)" }}>
        <div style={{ fontSize: 12, letterSpacing: 2.3, color: "rgba(148,163,184,0.9)", fontWeight: 800 }}>COMPANY PROFILES</div>
        <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ fontSize: 44, lineHeight: 1.05, margin: 0, fontWeight: 900 }}>
            MONITORING <span style={{ color: "#38bdf8" }}>MY COMPANY</span>.
          </h1>
        </div>

        <div style={{ marginTop: 8, color: "var(--card-text-sub)", fontSize: 13.5 }}>Kelola pengeluaran (Expense)</div>

        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={pillBtn(false)} onClick={() => navigate("/home")}>TEAM INFORMATION</button>
          <button style={pillBtn(false)} onClick={() => navigate("/bank-info")}>BANK INFO</button>
          <button style={pillBtn(true)} disabled>EXPENSE</button>
          <button style={pillBtn(false)} onClick={() => navigate("/dashboard")}>DASHBOARD</button>
        </div>
      </div>

      {/* FILTERS + TABLE */}
      <div style={{ marginTop: 18, ...card }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ minWidth: 260 }}>
              <div style={label}>Choose Branch</div>
              <select
                style={selectStyle}
                value={selectedBranchId}
                onChange={(e) => {
                  const v = e.target.value;
                  pickBranch(v ? Number(v) : "");
                  // reload supaya data yang tidak punya branchId tetap dianggap ke branch yang dipilih
                  if (v) reloadExpense(Number(v));
                }}
              >
                <option value="">-- pilih branch --</option>
                {branches.map((b) => (
                  <option key={b.branchId} value={b.branchId}>{b.branchName}</option>
                ))}
              </select>
            </div>

            <div style={{ minWidth: 260 }}>
              <div style={label}>Search</div>
              <input style={input} placeholder="Search expense / memo..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button style={smallBtn("primary")} onClick={openAdd}>+ Add Expense</button>
            <span style={badge}>{filtered.length} data</span>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          {selectedBranch ? <span style={badge}>Branch: {selectedBranch.branchName}</span> : null}
        </div>

        {loading ? <div style={{ marginTop: 12, color: "var(--card-text-sub)" }}>Loading...</div> : null}
        {!loading && error ? (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 14, border: "1px solid rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.10)", color: "rgba(248,113,113,0.95)" }}>
            Ups, Error: {error}
          </div>
        ) : null}

        <div style={{ marginTop: 14, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780 }}>
            <thead>
              <tr>
                {["#", "Expense", "Cost", "Due Date", "Memo", "Action"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 10px", borderBottom: "1px solid var(--card-border)", color: "var(--card-text-sub)", fontSize: 12.5, letterSpacing: 0.5 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 14, color: "var(--card-text-sub)" }}>No Data Found</td></tr>
              ) : (
                filtered.map((it, idx) => (
                  <tr key={it.id ?? idx}>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid rgba(148,163,184,0.12)" }}>{idx + 1}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid rgba(148,163,184,0.12)", fontWeight: 900 }}>{it.expenseName}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid rgba(148,163,184,0.12)" }}>Rp {formatIdr(it.cost)}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid rgba(148,163,184,0.12)" }}>{toDateInput(it.dueDate) || "-"}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid rgba(148,163,184,0.12)", color: "var(--card-text-sub)" }}>{it.memo || "-"}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid rgba(148,163,184,0.12)" }}>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button style={smallBtn()} onClick={() => openEdit(it)}>Update</button>
                        <button style={smallBtn("danger")} onClick={() => setConfirmDelete({ id: it.id, expenseName: it.expenseName })}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen ? (
        <div style={modalOverlay} onClick={closeModal}>
          <div style={modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontWeight: 900, fontSize: 16 }}>{mode === "add" ? "Add Expense" : "Edit Expense"}</div>
              <button style={smallBtn()} onClick={closeModal} disabled={busy}>✕</button>
            </div>

            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <div style={label}>Branch</div>
                <input style={input} value={selectedBranch?.branchName || "-"} disabled />
              </div>

              <div>
                <div style={label}>Expense Name</div>
                <input style={input} value={form.expenseName} onChange={(e) => setForm((p) => ({ ...p, expenseName: e.target.value }))} />
              </div>

              <div>
                <div style={label}>Cost</div>
                <input style={input} value={form.cost} onChange={(e) => setForm((p) => ({ ...p, cost: e.target.value }))} placeholder="contoh: 250000" />
              </div>

              <div>
                <div style={label}>Due Date</div>
                <input type="date" style={input} value={toDateInput(form.dueDate)} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} />
              </div>

              <div>
                <div style={label}>Memo</div>
                <input style={input} value={form.memo} onChange={(e) => setForm((p) => ({ ...p, memo: e.target.value }))} />
              </div>
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button style={smallBtn()} onClick={closeModal} disabled={busy}>Cancel</button>
              <button style={smallBtn("primary")} onClick={submit} disabled={busy}>
                {busy ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* CONFIRM DELETE */}
      {confirmDelete ? (
        <div style={modalOverlay} onClick={() => !busy && setConfirmDelete(null)}>
          <div style={{ ...modalCard, maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 900, fontSize: 16 }}>Confirm Delete</div>
            <div style={{ marginTop: 8, color: "var(--card-text-sub)", fontSize: 13.5 }}>
              Hapus expense "{confirmDelete.expenseName}"?
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button style={smallBtn()} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button style={smallBtn("danger")} onClick={() => doDelete(confirmDelete.id)} disabled={busy}>
                {busy ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
