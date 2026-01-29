// src/pages/HomePage.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  // BRANCH
  getAllBranchBro0400,
  insertBranchBro0100,
  editBranchBro0200,
  deleteBranchBro0300,
  // TKD
  getAllDataTkd0200,
  registerTkd0100,
  updateTkd0300,
  deleteTkd0400,
} from "../api/tikusClient.js";
import { getAllWorkspaceByAdminWsp0300 } from "../api/adminClient.js";
import { clearSession } from "../utils/auth.js";

const POSITION_OPTIONS = [
  "Branch Manager",
  "Leader",
  "Marketing",
  "Costumer Service",
];

function normalizePosition(pos) {
  const p = String(pos || "").trim().toLowerCase();
  if (!p) return "";
  if (p === "branch manager") return "Branch Manager";
  if (p === "leader") return "Leader";
  if (p === "marketing") return "Marketing";
  if (p === "costumer service") return "Costumer Service";
  if (p === "customer service") return "Costumer Service";
  return pos;
}

function formatIdr(val) {
  const n = Number(val ?? 0);
  if (Number.isNaN(n)) return "-";
  return n.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatThb(val) {
  const n = Number(val ?? 0);
  if (Number.isNaN(n)) return "-";
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function toDateInput(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const primaryCtaStyle = {
  padding: "0.75rem 1.4rem",
  borderRadius: "999px",
  border: "none",
  background: "linear-gradient(135deg, #38bdf8 0%, #6366f1 55%, #22c55e 100%)",
  color: "#0b1120",
  fontSize: "0.9rem",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.65)",
};

const secondaryCtaStyle = {
  padding: "0.65rem 1.2rem",
  borderRadius: "999px",
  border: "1px solid var(--card-border)",
  background: "transparent",
  color: "var(--text)",
  fontSize: "0.9rem",
  fontWeight: 600,
  cursor: "pointer",
};

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
  background: "var(--input-bg)",
  color: "var(--text)",
  outline: "none",
};

const selectStyle = {
  ...input,
  padding: "12px 12px",
};

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
  background: "var(--badge-bg)",
  color: "var(--text)",
  fontWeight: 700,
  fontSize: 12.5,
};

const sectionTitle = { fontSize: 18, fontWeight: 900, letterSpacing: 0.5 };
const sectionSub = { marginTop: 6, color: "var(--card-text-sub)", fontSize: 13.5 };

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
  maxWidth: 820,
  borderRadius: 18,
  border: "1px solid var(--card-border)",
  background: "var(--card-bg)",
  backdropFilter: "blur(14px)",
  padding: 14,
};

const grid2 = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
};

const grid3 = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 12,
};

const field = { display: "flex", flexDirection: "column", gap: 6 };

const label = { fontSize: 12.5, color: "var(--card-text-sub)", fontWeight: 700 };

function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = localStorage.getItem("authEmail") || "";

  // Workspace scope (via query param atau cache)
  const wsFromUrl = useMemo(() => {
    const qs = new URLSearchParams(location.search);
    return String(qs.get("workspaceId") || "").trim();
  }, [location.search]);

  const branchFromUrl = useMemo(() => {
    const qs = new URLSearchParams(location.search);
    return String(qs.get("branchId") || "").trim();
  }, [location.search]);

  // THEME
  const [theme, setTheme] = useState(() => localStorage.getItem("tk-theme") || "dark");
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("tk-theme", theme);
  }, [theme]);
  const toggleTheme = () => setTheme((p) => (p === "dark" ? "light" : "dark"));

  // DATA
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [workspaceValid, setWorkspaceValid] = useState(true);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() =>
    String(localStorage.getItem("tk-workspaceId") || "").trim()
  );

  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(() => {
    const v = localStorage.getItem("tk-branchId");
    return v ? Number(v) : "";
  });

  const [members, setMembers] = useState([]);

  // UI
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null); // {type,text}

  // Branch modals
  const [branchModal, setBranchModal] = useState(null); // {mode:'add'|'edit', name:''}
  const [branchName, setBranchName] = useState("");
  const [branchBusy, setBranchBusy] = useState(false);

  // Member modals
  const emptyMemberForm = useMemo(() => ({
    refNo: "",
    branchId: "",
    name: "",
    address: "",
    gender: "",
    email: "",
    position: "",
    joinWorkDt: "",
    religion: "",
    workingWeb: "",
    cuti: "",
    salaryAmt: "",
    remark: "",
    foodAmount: "",
    thr: "",
    bonus: "",
    noRekening: "",
    lastSalaryIncreaseDt: "",
  }), []);

  const [memberModal, setMemberModal] = useState(null); // {mode:'add'|'edit', item}
  const [memberForm, setMemberForm] = useState(emptyMemberForm);
  const [memberBusy, setMemberBusy] = useState(false);

  // expand/collapse detail per member (key: refNo)
  const [expandedMembers, setExpandedMembers] = useState(() => ({}));

  const [confirmDelete, setConfirmDelete] = useState(null); // {type:'branch'|'member', payload}

  async function reloadBranches(scopeWorkspaceId = activeWorkspaceId) {
    if (!scopeWorkspaceId) {
      setBranches([]);
      return [];
    }

    const res = await getAllBranchBro0400();
    const all = Array.isArray(res?.resultList) ? res.resultList : [];
    const scoped = all.filter((b) => String(b.workspaceId || "").trim() === String(scopeWorkspaceId).trim());
    setBranches(scoped);
    return scoped;
  }

  async function reloadMembers(allowedBranchIds) {
    const res = await getAllDataTkd0200();
    const all = Array.isArray(res?.resultList) ? res.resultList : [];
    const filtered = allowedBranchIds
      ? all.filter((m) => allowedBranchIds.has(Number(m.branchId)))
      : all;

    // normalize positions for consistent grouping
    const normalized = filtered.map((x) => ({ ...x, position: normalizePosition(x.position) }));
    setMembers(normalized);
    return normalized;
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");

        // Reset state dulu biar tidak ada data "sisa" dari workspace lain
        setBranches([]);
        setMembers([]);

        // 1) validasi workspace user (wsp0300)
        const wsRes = email ? await getAllWorkspaceByAdminWsp0300(email) : { resultList: [] };
        const wsRows = Array.isArray(wsRes?.resultList) ? wsRes.resultList : [];
        const allowedWorkspaceIds = Array.from(
          new Set(wsRows.map((r) => String(r.workspaceId || "").trim()).filter(Boolean))
        );

        // resolve workspace yang diminta (url > cache > first)
        const cachedWsId = String(localStorage.getItem("tk-workspaceId") || "").trim();
        let candidateWsId = "";
        if (cachedWsId && allowedWorkspaceIds.includes(cachedWsId)) candidateWsId = cachedWsId;
        else if (wsFromUrl && allowedWorkspaceIds.includes(String(wsFromUrl).trim())) candidateWsId = String(wsFromUrl).trim();
        else if (allowedWorkspaceIds.length === 1) candidateWsId = allowedWorkspaceIds[0];

        const wsOk = !!candidateWsId;

        if (!wsOk) {
          // workspace tidak valid untuk user
          localStorage.removeItem("tk-workspaceId");
          localStorage.removeItem("tk-branchId");
          if (!alive) return;
          setWorkspaceValid(false);
          setActiveWorkspaceId("");
          setSelectedBranchId("");
          setBranches([]);
          setMembers([]);
          return;
        }

        // workspace valid
        localStorage.setItem("tk-workspaceId", candidateWsId);
        if (!alive) return;
        setWorkspaceValid(true);
        setActiveWorkspaceId(candidateWsId);

        // 2) load branches scoped by workspace
        const b = await reloadBranches(candidateWsId);
        if (!alive) return;

        // 3) resolve branch yang diminta (url > cache > first)
        const candidateBranchIdRaw = String(branchFromUrl || localStorage.getItem("tk-branchId") || "").trim();
        const candidateBranchId = candidateBranchIdRaw ? Number(candidateBranchIdRaw) : "";
        const firstBranchId = b?.[0]?.branchId ?? "";
        let pickBranchId = candidateBranchId || firstBranchId || "";

        if (pickBranchId && !b.some((x) => Number(x.branchId) === Number(pickBranchId))) {
          pickBranchId = firstBranchId || "";
        }

        if (pickBranchId) {
          setSelectedBranchId(pickBranchId);
          localStorage.setItem("tk-branchId", String(pickBranchId));
        } else {
          setSelectedBranchId("");
          localStorage.removeItem("tk-branchId");
        }

        // 4) load members lalu filter by branch yang ada di workspace ini
        const allowedBranchIds = new Set((b || []).map((x) => Number(x.branchId)));
        await reloadMembers(allowedBranchIds);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Gagal mengambil data");
        setWorkspaceValid(false);
        setBranches([]);
        setMembers([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, wsFromUrl, branchFromUrl]);

  const selectedBranch = useMemo(() => {
    const id = Number(selectedBranchId);
    return branches.find((b) => Number(b.branchId) === id) || null;
  }, [branches, selectedBranchId]);

  const filteredMembers = useMemo(() => {
    const id = Number(selectedBranchId);
    const q = searchQuery.trim().toLowerCase();
    return members.filter((m) => {
      if (id && Number(m.branchId) !== id) return false;
      if (!q) return true;
      return (
        String(m.name || "").toLowerCase().includes(q) ||
        String(m.email || "").toLowerCase().includes(q) ||
        String(m.position || "").toLowerCase().includes(q)
      );
    });
  }, [members, searchQuery, selectedBranchId]);

  const grouped = useMemo(() => {
    const groups = new Map();
    for (const pos of POSITION_OPTIONS) groups.set(pos, []);
    groups.set("Other", []);
    for (const m of filteredMembers) {
      const p = POSITION_OPTIONS.includes(m.position) ? m.position : "Other";
      groups.get(p).push(m);
    }
    return groups;
  }, [filteredMembers]);

  const membersInBranch = useMemo(() => {
    const id = Number(selectedBranchId);
    if (!id) return members;
    return members.filter((m) => Number(m.branchId) === id);
  }, [members, selectedBranchId]);

  const branchManagerCard = useMemo(() => {
    const list = membersInBranch
      .map((x) => ({ ...x, position: normalizePosition(x.position) }))
      .filter((x) => x.position === "Branch Manager");
    return list[0] || null;
  }, [membersInBranch]);

  const summary = useMemo(() => {
    const count = filteredMembers.length;
    const totalSalary = filteredMembers.reduce((acc, x) => acc + Number(x.salaryAmt ?? x.salaryAmt ?? 0), 0);
    const totalThr = filteredMembers.reduce((acc, x) => acc + Number(x.thr ?? 0), 0);
    return { count, totalSalary, totalThr };
  }, [filteredMembers]);

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  const pickBranch = (val) => {
    setSelectedBranchId(val);
    if (val) localStorage.setItem("tk-branchId", String(val));
  };

  // Branch actions
  const openAddBranch = () => {
    setBranchName("");
    setBranchModal({ mode: "add" });
  };

  const openEditBranch = () => {
    if (!selectedBranch) {
      setToast({ type: "error", text: "Pilih branch dulu." });
      return;
    }
    setBranchName(selectedBranch.branchName || "");
    setBranchModal({ mode: "edit" });
  };

  const askDeleteBranch = () => {
    if (!selectedBranch) {
      setToast({ type: "error", text: "Pilih branch dulu." });
      return;
    }
    setConfirmDelete({ type: "branch", payload: { branchId: selectedBranch.branchId, branchName: selectedBranch.branchName } });
  };

  const submitBranch = async () => {
    const name = branchName.trim();
    if (!name) return setToast({ type: "error", text: "Nama branch wajib diisi." });

    try {
      setBranchBusy(true);
      if (branchModal?.mode === "add") {
        const workspaceId = String(activeWorkspaceId || "").trim();

        if (!workspaceValid || !workspaceId) {
          throw new Error("Pilih workspace aktif dulu via Profile → Workspaces → Switch Workspace.");
        }

        await insertBranchBro0100({ branchName: name, workspaceId });
        setToast({ type: "success", text: "Branch berhasil ditambahkan." });
      } else if (branchModal?.mode === "edit") {
        await editBranchBro0200({ branchId: selectedBranch?.branchId, branchName: name });
        setToast({ type: "success", text: "Branch berhasil diubah." });
      }
      setBranchModal(null);
      const b = await reloadBranches();
      // keep selection
      if (branchModal?.mode === "add") {
        const found = b.find((x) => String(x.branchName).toLowerCase() === name.toLowerCase());
        if (found) pickBranch(found.branchId);
      }
    } catch (e) {
      setToast({ type: "error", text: e?.message || "Gagal proses branch" });
    } finally {
      setBranchBusy(false);
    }
  };

  const doDeleteBranch = async (branchId) => {
    try {
      setBranchBusy(true);
      await deleteBranchBro0300({ branchId });
      setToast({ type: "success", text: "Branch berhasil dihapus." });
      setConfirmDelete(null);
      const b = await reloadBranches();
      const nextId = b?.[0]?.branchId ?? "";
      pickBranch(nextId);
    } catch (e) {
      setToast({ type: "error", text: e?.message || "Gagal hapus branch" });
    } finally {
      setBranchBusy(false);
    }
  };

  // Member actions
  const openAddMember = () => {
    if (!selectedBranchId) {
      setToast({ type: "error", text: "Pilih branch dulu sebelum tambah user." });
      return;
    }
    setMemberForm({ ...emptyMemberForm, branchId: Number(selectedBranchId), position: "Costumer Service" });
    setMemberModal({ mode: "add" });
  };

  const openEditMember = (item) => {
    setMemberForm({
      ...emptyMemberForm,
      ...item,
      branchId: Number(item.branchId ?? selectedBranchId),
      salaryAmt: item.salaryAmt ?? item.salaryAmt ?? "",
      foodAmount: item.foodAmount ?? item.foodAmount ?? "",
    });
    setMemberModal({ mode: "edit", item });
  };

  const askDeleteMember = (item) => {
    setConfirmDelete({ type: "member", payload: { refNo: item.refNo, name: item.name, email: item.email } });
  };

  const submitMember = async () => {
    const payload = { ...memberForm };
    payload.branchId = Number(payload.branchId || selectedBranchId || 0);

    // validation minimal
    if (!payload.branchId) return setToast({ type: "error", text: "Branch wajib dipilih." });
    if (!payload.name.trim()) return setToast({ type: "error", text: "Nama wajib diisi." });
    if (!payload.email.trim()) return setToast({ type: "error", text: "Email wajib diisi." });
    if (!POSITION_OPTIONS.includes(payload.position)) return setToast({ type: "error", text: "Position tidak valid." });

    // cast numbers
    const numFields = ["salaryAmt", "foodAmount", "thr", "bonus"];
    for (const k of numFields) {
      if (payload[k] === "") continue;
      const n = Number(payload[k]);
      if (!Number.isNaN(n)) payload[k] = n;
    }

    try {
      setMemberBusy(true);
      if (memberModal?.mode === "add") {
        // register endpoint does not need refNo
        delete payload.refNo;
        await registerTkd0100(payload);
        setToast({ type: "success", text: "User berhasil ditambahkan." });
      } else {
        await updateTkd0300(payload);
        setToast({ type: "success", text: "User berhasil diupdate." });
      }
      setMemberModal(null);
      await reloadMembers();
    } catch (e) {
      setToast({ type: "error", text: e?.message || "Gagal simpan user" });
    } finally {
      setMemberBusy(false);
    }
  };

  const doDeleteMember = async (refNo) => {
    try {
      setMemberBusy(true);
      await deleteTkd0400({ refNo });
      setToast({ type: "success", text: "User berhasil dihapus." });
      setConfirmDelete(null);
      await reloadMembers();
    } catch (e) {
      setToast({ type: "error", text: e?.message || "Gagal hapus user" });
    } finally {
      setMemberBusy(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* TOP BAR */}
      <div style={{ padding: "22px 26px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "linear-gradient(135deg, #38bdf8, #6366f1)",
              display: "grid", placeItems: "center",
              color: "#071021", fontWeight: 900,
            }}>
              727
            </div>
            <div>
              <div style={{ fontWeight: 900, letterSpacing: 0.6 }}>GROUP</div>
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
        <div style={{ marginTop: 20, padding: "22px 24px", borderRadius: 22, border: "1px solid var(--card-border)", background: "var(--panel-bg)", backdropFilter: "blur(14px)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.55fr) minmax(0, 0.95fr)", gap: 18, alignItems: "stretch" }}>
            <div>
              <div style={{ fontSize: 12, letterSpacing: 2.3, color: "rgba(148,163,184,0.9)", fontWeight: 800 }}>PROFILES</div>
              <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: 12 }}>
                <h1 style={{ fontSize: 44, lineHeight: 1.05, margin: 0, fontWeight: 900 }}>
                  MONITORING <span style={{ color: "#38bdf8" }}>727 GROUP</span>.
                </h1>
              </div>

              <p style={{ marginTop: 8, ...sectionSub }}>727 GROUP TEAM OVERVIEW</p>

              <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button style={pillBtn(true)} disabled>TEAM INFORMATION</button>
                <button style={pillBtn(false)} onClick={() => navigate("/bank-info")}>BANK INFO</button>
                <button style={pillBtn(false)} onClick={() => navigate("/expense")}>EXPENSE</button>
                <button style={pillBtn(false)} onClick={() => navigate("/dashboard")}>DASHBOARD</button>
              </div>
            </div>

            {/* Right-side card (keep the old box) */}
            <div
              style={{
                borderRadius: 22,
                border: "1px solid rgba(234,179,8,0.35)",
                background: "linear-gradient(135deg, rgba(234,179,8,0.26) 0%, rgba(250,204,21,0.10) 55%, rgba(2,6,23,0.18) 100%)",
                boxShadow: "0 24px 60px rgba(2,6,23,0.55)",
                padding: 18,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontSize: 12, letterSpacing: 2.1, fontWeight: 900, color: "rgba(250,204,21,0.95)" }}>
                  BRANCH MANAGER CARD
                </div>
                <div style={{ marginTop: 10, fontSize: 18, fontWeight: 900 }}>
                  {branchManagerCard?.name || "No Branch Manager"}
                </div>
                <div style={{ marginTop: 6, color: "rgba(226,232,240,0.85)", fontSize: 12.5 }}>
                  {branchManagerCard?.email || "-"}
                </div>
              </div>

              <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ padding: 12, borderRadius: 16, border: "1px solid rgba(234,179,8,0.25)", background: "var(--input-bg)" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(226,232,240,0.75)" }}>Salary</div>
                  <div style={{ marginTop: 4, fontWeight: 900 }}>Rp {formatIdr(branchManagerCard?.salaryAmt)}</div>
                </div>
                <div style={{ padding: 12, borderRadius: 16, border: "1px solid rgba(234,179,8,0.25)", background: "var(--input-bg)" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(226,232,240,0.75)" }}>Join</div>
                  <div style={{ marginTop: 4, fontWeight: 900 }}>{branchManagerCard?.joinWorkDt || "-"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TOP SUMMARY */}
        <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }}>
          <div style={card}>
            <div style={{ ...sectionSub, marginTop: 0 }}>Branch</div>
            <div style={{ marginTop: 6, fontSize: 18, fontWeight: 900 }}>{selectedBranch?.branchName || "—"}</div>
            <div style={{ marginTop: 10, ...badge }}>Total branch: {branches.length}</div>
          </div>

          <div style={card}>
            <div style={{ ...sectionSub, marginTop: 0 }}>Anggota Aktif</div>
            <div style={{ marginTop: 6, fontSize: 28, fontWeight: 900 }}>{summary.count}</div>
            <div style={{ marginTop: 10, ...badge }}>Terfilter branch + search</div>
          </div>

          <div style={card}>
            <div style={{ ...sectionSub, marginTop: 0 }}>Salary Information</div>
            <div style={{ marginTop: 6, fontSize: 20, fontWeight: 900 }}>Rp {formatIdr(summary.totalSalary)}</div>
            <div style={{ marginTop: 10, ...badge }}>THR Rp {formatIdr(summary.totalThr)}</div>
          </div>
        </div>

        {/* DATA SECTION */}
        <div style={{ marginTop: 18, ...card }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={sectionTitle}>DATA ACTIVE USER</div>
              <div style={sectionSub}>Data Summary</div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <input
                style={{ ...input, width: 240 }}
                placeholder="Search name / email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button style={smallBtn("primary")} onClick={openAddMember}>+ Add User</button>
              <span style={badge}>{filteredMembers.length} / {members.filter((m)=> !selectedBranchId || Number(m.branchId)===Number(selectedBranchId)).length} data</span>
            </div>
          </div>

          {/* branch controls */}
          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ minWidth: 260, flex: "1 1 260px" }}>
              <div style={label}>Choose Branch</div>
              <select
                style={selectStyle}
                value={selectedBranchId}
                onChange={(e) => pickBranch(Number(e.target.value))}
              >
                <option value="">-- pilih branch --</option>
                {branches.map((b) => (
                  <option key={b.branchId} value={b.branchId}>
                    {b.branchName}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
              <button style={smallBtn()} onClick={openAddBranch}>+ Add Branch</button>
              <button style={smallBtn()} onClick={openEditBranch}>Edit Branch</button>
              <button style={smallBtn("danger")} onClick={askDeleteBranch}>Delete Branch</button>
            </div>
          </div>

          {/* status */}
          <div style={{ marginTop: 14 }}>
            {loading && <div style={{ color: "var(--card-text-sub)" }}>Get Data From Backend ...</div>}
            {!loading && error && (
              <div style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.10)", color: "rgba(248,113,113,0.95)" }}>
                Ups, Error: {error}
              </div>
            )}
          </div>

          {/* grouped list */}
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 18 }}>
            {[...grouped.entries()].map(([pos, list]) => {
              if (pos === "Other" && list.length === 0) return null;
              return (
                <div key={pos}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 900, fontSize: 14.5, letterSpacing: 0.4 }}>
                      {pos}
                    </div>
                    <div style={badge}>{list.length} user</div>
                  </div>

                  <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
                    {list.length === 0 ? (
                      <div style={{ ...badge, justifyContent: "center" }}>No Data Found</div>
                    ) : (
                      list.map((m) => (
                        <div key={m.refNo} style={{ ...card, padding: 14 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                            <div>
                              <div style={{ fontWeight: 900, fontSize: 16 }}>{m.name}</div>
                              <div style={{ marginTop: 4, color: "var(--card-text-sub)", fontSize: 12.5 }}>
                                {m.position || "-"}
                              </div>
                            </div>
                            <span style={badge}>{m.position || "-"}</span>
                          </div>

                          <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            <div>
                              <div style={label}>Email</div>
                              <div style={{ fontWeight: 700 }}>{m.email}</div>
                            </div>
                            <div>
                              <div style={label}>Join</div>
                              <div style={{ fontWeight: 700 }}>{toDateInput(m.joinWorkDt) || "-"}</div>
                            </div>
                            <div>
                              <div style={label}>Salary</div>
                              <div style={{ fontWeight: 900 }}>Rp {formatIdr(m.salaryAmt)}</div>
                            </div>
                            <div>
                              <div style={label}>Cuti</div>
                              <div style={{ fontWeight: 800 }}>{m.cuti ?? "-"}</div>
                            </div>
                          </div>

                          <div
                            style={{
                              marginTop: 10,
                              color: "var(--card-text-sub)",
                              fontSize: 12.5,
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {m.remark || "—"}
                          </div>

                          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button style={smallBtn()} onClick={() => openEditMember(m)}>Update</button>
                            <button style={smallBtn("danger")} onClick={() => askDeleteMember(m)}>Delete</button>
                            <button
                              style={smallBtn()}
                              onClick={() => setExpandedMembers((p) => ({ ...p, [m.refNo]: !p[m.refNo] }))}
                            >
                              {expandedMembers[m.refNo] ? "Hide Detail" : "Detail"}
                            </button>
                          </div>

                          {expandedMembers[m.refNo] ? (
                            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(148,163,184,0.12)" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                                <div>
                                  <div style={label}>Tiket</div>
                                  <div style={{ fontWeight: 650, fontSize: 12.8 }}>{m.address || "-"}</div>
                                </div>
                                <div>
                                  <div style={label}>Gender</div>
                                  <div style={{ fontWeight: 650, fontSize: 12.8 }}>{m.gender || "-"}</div>
                                </div>

                                <div>
                                  <div style={label}>Position</div>
                                  <div style={{ fontWeight: 650, fontSize: 12.8 }}>{m.position || "-"}</div>
                                </div>
                                <div>
                                  <div style={label}>Religion</div>
                                  <div style={{ fontWeight: 650, fontSize: 12.8 }}>{m.religion || "-"}</div>
                                </div>

                                <div>
                                  <div style={label}>Working Web</div>
                                  <div style={{ fontWeight: 650, fontSize: 12.8 }}>{m.workingWeb || "-"}</div>
                                </div>
                                <div>
                                  <div style={label}>No Rekening</div>
                                  <div style={{ fontWeight: 650, fontSize: 12.8 }}>{m.noRekening || "-"}</div>
                                </div>

                                <div>
                                  <div style={label}>Uang Makan (฿)</div>
                                  <div style={{ fontWeight: 650, fontSize: 12.8 }}>฿ {formatThb(m.foodAmount)}</div>
                                </div>
                                <div>
                                  <div style={label}>THR</div>
                                  <div style={{ fontWeight: 650, fontSize: 12.8 }}>Rp {formatIdr(m.thr)}</div>
                                </div>

                                <div>
                                  <div style={label}>Bonus</div>
                                  <div style={{ fontWeight: 650, fontSize: 12.8 }}>Rp {formatIdr(m.bonus)}</div>
                                </div>
                                <div>
                                  <div style={label}>Last Salary Increase</div>
                                  <div style={{ fontWeight: 650, fontSize: 12.8 }}>{toDateInput(m.lastSalaryIncreaseDt) || "-"}</div>
                                </div>

                                <div style={{ gridColumn: "1 / -1" }}>
                                  <div style={label}>Remark</div>
                                  <div style={{ fontWeight: 650, fontSize: 12.8, whiteSpace: "pre-wrap" }}>{m.remark || "-"}</div>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TOAST */}
        {toast ? (
          <div style={{
            position: "fixed", left: 18, bottom: 18, zIndex: 999,
            padding: "12px 14px",
            borderRadius: 14,
            border: toast.type === "error" ? "1px solid rgba(239,68,68,0.35)" : "1px solid rgba(34,197,94,0.35)",
            background: toast.type === "error" ? "rgba(239,68,68,0.10)" : "rgba(34,197,94,0.10)",
            color: toast.type === "error" ? "rgba(248,113,113,0.95)" : "rgba(134,239,172,0.95)",
            backdropFilter: "blur(14px)",
            maxWidth: 520,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontWeight: 800 }}>{toast.text}</div>
              <button style={smallBtn()} onClick={() => setToast(null)}>OK</button>
            </div>
          </div>
        ) : null}

        {/* BRANCH MODAL */}
        {branchModal ? (
          <div style={modalOverlay} onClick={() => !branchBusy && setBranchModal(null)}>
            <div style={modalCard} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontWeight: 900, fontSize: 16 }}>
                  {branchModal.mode === "add" ? "Add Branch" : "Edit Branch"}
                </div>
                <button style={smallBtn()} onClick={() => setBranchModal(null)} disabled={branchBusy}>✕</button>
              </div>

              <div style={{ marginTop: 12, ...field }}>
                <div style={label}>Branch Name</div>
                <input style={input} value={branchName} onChange={(e) => setBranchName(e.target.value)} placeholder="Nama branch..." />
              </div>

              <div style={{ marginTop: 14, display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
                <button style={smallBtn()} onClick={() => setBranchModal(null)} disabled={branchBusy}>Cancel</button>
                <button style={smallBtn("primary")} onClick={submitBranch} disabled={branchBusy}>
                  {branchBusy ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* MEMBER MODAL */}
        {memberModal ? (
          <div style={modalOverlay} onClick={() => !memberBusy && setMemberModal(null)}>
            <div style={modalCard} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontWeight: 900, fontSize: 16 }}>
                  {memberModal.mode === "add" ? "Add User" : "Update User"}
                </div>
                <button style={smallBtn()} onClick={() => setMemberModal(null)} disabled={memberBusy}>✕</button>
              </div>

              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={grid3}>
                  <div style={field}>
                    <div style={label}>Branch</div>
                    <input style={input} value={selectedBranch?.branchName || "-"} disabled />
                  </div>
                  <div style={field}>
                    <div style={label}>Position</div>
                    <select
                      style={selectStyle}
                      value={memberForm.position}
                      onChange={(e) => setMemberForm((p) => ({ ...p, position: e.target.value }))}
                    >
                      <option value="">-- pilih posisi --</option>
                      {POSITION_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div style={field}>
                    <div style={label}>Gender</div>
                    <select
                      style={selectStyle}
                      value={memberForm.gender}
                      onChange={(e) => setMemberForm((p) => ({ ...p, gender: e.target.value }))}
                    >
                      <option value="">-- pilih --</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div style={grid2}>
                  <div style={field}>
                    <div style={label}>Name</div>
                    <input style={input} value={memberForm.name} onChange={(e) => setMemberForm((p) => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div style={field}>
                    <div style={label}>Email</div>
                    <input style={input} value={memberForm.email} onChange={(e) => setMemberForm((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                </div>

                <div style={field}>
                  <div style={label}>Tiket</div>
                  <input style={input} value={memberForm.address} onChange={(e) => setMemberForm((p) => ({ ...p, address: e.target.value }))} />
                </div>

                <div style={grid3}>
                  <div style={field}>
                    <div style={label}>Join Work Date</div>
                    <input type="date" style={input} value={toDateInput(memberForm.joinWorkDt)} onChange={(e) => setMemberForm((p) => ({ ...p, joinWorkDt: e.target.value }))} />
                  </div>
                  <div style={field}>
                    <div style={label}>Last Salary Increase</div>
                    <input type="date" style={input} value={toDateInput(memberForm.lastSalaryIncreaseDt)} onChange={(e) => setMemberForm((p) => ({ ...p, lastSalaryIncreaseDt: e.target.value }))} />
                  </div>
                  <div style={field}>
                    <div style={label}>Cuti</div>
                    <input style={input} value={memberForm.cuti} onChange={(e) => setMemberForm((p) => ({ ...p, cuti: e.target.value }))} />
                  </div>
                </div>

                <div style={grid3}>
                  <div style={field}>
                    <div style={label}>Salary Amount</div>
                    <input style={input} value={memberForm.salaryAmt} onChange={(e) => setMemberForm((p) => ({ ...p, salaryAmt: e.target.value }))} placeholder="contoh: 25000000.50" />
                  </div>
                  <div style={field}>
                    <div style={label}>Uang Makan (฿)</div>
                    <input style={input} value={memberForm.foodAmount} onChange={(e) => setMemberForm((p) => ({ ...p, foodAmount: e.target.value }))} placeholder="contoh: 1200.00 (THB)" />
                  </div>
                  <div style={field}>
                    <div style={label}>THR</div>
                    <input style={input} value={memberForm.thr} onChange={(e) => setMemberForm((p) => ({ ...p, thr: e.target.value }))} />
                  </div>
                </div>

                <div style={grid3}>
                  <div style={field}>
                    <div style={label}>Bonus</div>
                    <input style={input} value={memberForm.bonus} onChange={(e) => setMemberForm((p) => ({ ...p, bonus: e.target.value }))} />
                  </div>
                  <div style={field}>
                    <div style={label}>No Rekening</div>
                    <input style={input} value={memberForm.noRekening} onChange={(e) => setMemberForm((p) => ({ ...p, noRekening: e.target.value }))} />
                  </div>
                  <div style={field}>
                    <div style={label}>Religion</div>
                    <input style={input} value={memberForm.religion} onChange={(e) => setMemberForm((p) => ({ ...p, religion: e.target.value }))} />
                  </div>
                </div>

                <div style={grid2}>
                  <div style={field}>
                    <div style={label}>Working Web</div>
                    <input style={input} value={memberForm.workingWeb} onChange={(e) => setMemberForm((p) => ({ ...p, workingWeb: e.target.value }))} />
                  </div>
                  <div style={field}>
                    <div style={label}>Remark</div>
                    <input style={input} value={memberForm.remark} onChange={(e) => setMemberForm((p) => ({ ...p, remark: e.target.value }))} />
                  </div>
                </div>

              </div>

              <div style={{ marginTop: 14, display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
                <button style={smallBtn()} onClick={() => setMemberModal(null)} disabled={memberBusy}>Cancel</button>
                <button style={smallBtn("primary")} onClick={submitMember} disabled={memberBusy}>
                  {memberBusy ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* CONFIRM DELETE */}
        {confirmDelete ? (
          <div style={modalOverlay} onClick={() => !branchBusy && !memberBusy && setConfirmDelete(null)}>
            <div style={{ ...modalCard, maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
              <div style={{ fontWeight: 900, fontSize: 16 }}>Confirm Delete</div>
              <div style={{ marginTop: 8, color: "var(--card-text-sub)", fontSize: 13.5 }}>
                {confirmDelete.type === "branch"
                  ? `Hapus branch "${confirmDelete.payload.branchName}"?`
                  : `Hapus user "${confirmDelete.payload.name}" (${confirmDelete.payload.email})?`
                }
              </div>

              <div style={{ marginTop: 14, display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button style={smallBtn()} onClick={() => setConfirmDelete(null)}>Cancel</button>
                <button
                  style={smallBtn("danger")}
                  onClick={() => {
                    if (confirmDelete.type === "branch") doDeleteBranch(confirmDelete.payload.branchId);
                    if (confirmDelete.type === "member") doDeleteMember(confirmDelete.payload.refNo);
                  }}
                  disabled={branchBusy || memberBusy}
                >
                  {branchBusy || memberBusy ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default HomePage;
