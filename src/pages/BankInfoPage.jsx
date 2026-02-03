import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getAllBranchBro0400,
  addAtmAtm0100,
  getAllAtmAtm0200,
  editAtmAtm0300,
  deleteAtmAtm0400,
  uploadKtpAtm0500,
} from "../api/tikusClient.js";
import { getAllWorkspaceByAdminWsp0300 } from "../api/adminClient.js";
import { clearSession } from "../utils/auth.js";

function formatIdr(val) {
  const n = Number(val ?? 0);
  if (Number.isNaN(n)) return "-";
  return n.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

function dataUrlFromMaybeBase64(value) {
  if (!value) return "";
  const s = String(value);
  if (s.startsWith("data:")) return s;
  const head = s.slice(0, 12);
  let mime = "image/jpeg";
  if (head.startsWith("iVBORw0")) mime = "image/png";
  else if (head.startsWith("/9j")) mime = "image/jpeg";
  else if (head.startsWith("R0lGOD")) mime = "image/gif";
  else if (head.startsWith("UklGR")) mime = "image/webp";
  return "data:" + mime + ";base64," + s;
}

function fileToBase64Bytes(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error || new Error("Gagal baca file"));
    reader.readAsDataURL(file);
  });
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
  background: "var(--badge-bg)",
  color: "var(--text)",
  fontWeight: 700,
  fontSize: 12.5,
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: 24,
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  zIndex: 999,
};

const modalCard = {
  width: "100%",
  maxWidth: 920,
  borderRadius: 18,
  border: "1px solid var(--card-border)",
  background: "var(--card-bg)",
  backdropFilter: "blur(14px)",
  padding: 14,
  margin: "0 auto",
  maxHeight: "calc(100vh - 72px)",
  overflowY: "auto",
};

const grid3 = { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 };
const grid2 = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 };
const field = { display: "flex", flexDirection: "column", gap: 6 };
const label = { fontSize: 12.5, color: "var(--card-text-sub)", fontWeight: 700 };

/** ✅ NEW: rekType options (hasil interview) */
const REK_TYPE_OPTIONS = ["DEPOSIT", "WITHDRAW", "KAS", "TAMPUNGAN"];

/** ✅ NEW: status options */
const STATUS_OPTIONS = ["ACTIVE", "STOCK"];

const emptyAtmForm = {
  id: "",
  branchId: "",
  rekeningNm: "",
  ktpNo: "",
  motherNm: "",
  birthPlace: "",
  birthDt: "",
  homeAddr: "",
  rt: "",
  rw: "",
  kelurahan: "",
  kecamatan: "",
  kabupaten: "",
  province: "",
  gender: "",
  expiredKtpDt: "",
  rekNo: "",
  pinNo: "",
  atmNo: "",
  rekType: "",
  atmExpiredDt: "",
  userIdMobile: "",
  passMBanking: "",
  bankNm: "",
  remark: "",
  noHp: "",
  email: "",
  passEmail: "",
  masaSewaBank: "",
  saldo: "",
  /** ✅ NEW */
  status: "",
};

export default function BankInfoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = localStorage.getItem("authEmail") || "";

  const wsFromUrl = useMemo(() => {
    const qs = new URLSearchParams(location.search);
    return String(qs.get("workspaceId") || "").trim();
  }, [location.search]);

  const branchFromUrl = useMemo(() => {
    const qs = new URLSearchParams(location.search);
    return String(qs.get("branchId") || "").trim();
  }, [location.search]);

  // theme
  const [theme, setTheme] = useState(() => localStorage.getItem("tk-theme") || "dark");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("tk-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((p) => (p === "dark" ? "light" : "dark"));

  // data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [ktpBusyId, setKtpBusyId] = useState(null);

  const [workspaceValid, setWorkspaceValid] = useState(true);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() =>
    String(localStorage.getItem("tk-workspaceId") || "").trim()
  );

  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(() => {
    const v = localStorage.getItem("tk-branchId");
    return v ? Number(v) : "";
  });

  /** ✅ NEW: filter rekType + status */
  const [rekTypeFilter, setRekTypeFilter] = useState("ALL"); // ALL | DEPOSIT | WITHDRAW | KAS | TAMPUNGAN
  const [statusFilter, setStatusFilter] = useState("ACTIVE"); // ALL | ACTIVE | STOCK

  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // modal + confirm
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("add"); // add | edit
  const [form, setForm] = useState(emptyAtmForm);
  const [busy, setBusy] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(null); // {id, rekeningNm}

  // detail modal
  const [detailItem, setDetailItem] = useState(null);
  const [showSensitive, setShowSensitive] = useState(false);

  const mask = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    const s = String(value);
    if (showSensitive) return s;
    if (s.length <= 4) return "••••";
    return `${s.slice(0, 2)}••••${s.slice(-2)}`;
  };

  // ATM No formatting: group by 4 digits with '-' and limit to 12 digits (backend limit)
  const sanitizeAtmNo = (v) => String(v ?? "").replace(/\D/g, "").slice(0, 16);
  const formatAtmNo = (v) => {
    const digits = sanitizeAtmNo(v);
    const groups = digits.match(/.{1,4}/g) || [];
    return groups.join("-");
  };

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

  async function reloadAtm(allowedBranchIdsSet) {
    const res = await getAllAtmAtm0200();
    const all = Array.isArray(res?.resultList) ? res.resultList : [];
    const scoped = allowedBranchIdsSet
      ? all.filter((x) => x?.branchId != null && allowedBranchIdsSet.has(Number(x.branchId)))
      : [];
    setItems(scoped);
    return scoped;
  }
  const pickAndUploadKtp = (atmId) => {
    if (!atmId) return;
    const inputEl = document.createElement("input");
    inputEl.type = "file";
    inputEl.accept = "image/*";
    inputEl.onchange = async (e) => {
      const file = e?.target?.files?.[0];
      if (!file) return;
      try {
        setInfo("");
        setError("");
        setKtpBusyId(atmId);
        const base64 = await fileToBase64Bytes(file);
        await uploadKtpAtm0500({ atmId: Number(atmId), ktpImage: base64 });
        setInfo("SUCCESS UPLOAD KTP");
        await reloadAtm(allowedBranchIds);
      } catch (err) {
        setError(err?.message || "Gagal upload KTP");
      } finally {
        setKtpBusyId(null);
      }
    };
    inputEl.click();
  };


  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        setInfo("");

        // reset agar tidak ada data "sisa" dari workspace lain
        setBranches([]);
        setItems([]);

        // 1) validasi workspace user (wsp0300)
        const wsRes = email ? await getAllWorkspaceByAdminWsp0300(email) : { resultList: [] };
        const wsRows = Array.isArray(wsRes?.resultList) ? wsRes.resultList : [];
        const allowedWorkspaceIds = Array.from(
          new Set(wsRows.map((r) => String(r.workspaceId || "").trim()).filter(Boolean))
        );

        const cachedWsId = String(localStorage.getItem("tk-workspaceId") || "").trim();
        let candidateWsId = "";
        if (cachedWsId && allowedWorkspaceIds.includes(cachedWsId)) candidateWsId = cachedWsId;
        else if (wsFromUrl && allowedWorkspaceIds.includes(String(wsFromUrl).trim())) candidateWsId = String(wsFromUrl).trim();
        else if (allowedWorkspaceIds.length === 1) candidateWsId = allowedWorkspaceIds[0];

        const wsOk = !!candidateWsId;

        if (!wsOk) {
          localStorage.removeItem("tk-workspaceId");
          localStorage.removeItem("tk-branchId");
          if (!alive) return;
          setWorkspaceValid(false);
          setActiveWorkspaceId("");
          setSelectedBranchId("");
          setBranches([]);
          setItems([]);
          return;
        }

        localStorage.setItem("tk-workspaceId", candidateWsId);
        if (!alive) return;
        setWorkspaceValid(true);
        setActiveWorkspaceId(candidateWsId);

        // 2) branches scoped by workspace
        const b = await reloadBranches(candidateWsId);
        if (!alive) return;

        const allowedBranchIdsSet = new Set((b || []).map((x) => Number(x.branchId)));

        // 3) ATM scoped by allowed branches
        await reloadAtm(allowedBranchIdsSet);
        if (!alive) return;

        // 4) resolve branch yang dipilih (url > cache > first)
        const candidateBranchIdRaw = String(
          branchFromUrl || localStorage.getItem("tk-branchId") || ""
        ).trim();
        const candidateBranchId = candidateBranchIdRaw ? Number(candidateBranchIdRaw) : "";
        const firstBranchId = b?.[0]?.branchId ?? "";
        let pick = candidateBranchId || firstBranchId || "";

        if (pick && !b.some((x) => Number(x.branchId) === Number(pick))) {
          pick = firstBranchId || "";
        }

        if (pick) {
          setSelectedBranchId(pick);
          localStorage.setItem("tk-branchId", String(pick));
        } else {
          setSelectedBranchId("");
          localStorage.removeItem("tk-branchId");
        }
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Gagal mengambil data");
        setWorkspaceValid(false);
        setActiveWorkspaceId("");
        setBranches([]);
        setItems([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [email, wsFromUrl, branchFromUrl]);

  const selectedBranch = useMemo(() => {
    const id = Number(selectedBranchId);
    return branches.find((b) => Number(b.branchId) === id) || null;
  }, [branches, selectedBranchId]);

  const allowedBranchIds = useMemo(() => {
    return new Set((branches || []).map((b) => Number(b.branchId)));
  }, [branches]);

  const filtered = useMemo(() => {
    const id = Number(selectedBranchId);
    const q = searchQuery.trim().toLowerCase();

    return items.filter((x) => {
      if (id && Number(x.branchId) !== id) return false;

      const rekType = String(x.rekType || "").toUpperCase();
      const status = String(x.status || "ACTIVE").toUpperCase(); // fallback biar data lama aman

      // ✅ filter rekType
      if (rekTypeFilter !== "ALL" && rekType !== rekTypeFilter) return false;

      // ✅ filter status
      if (statusFilter !== "ALL" && status !== statusFilter) return false;

      if (!q) return true;
      return (
        String(x.rekeningNm || "").toLowerCase().includes(q) ||
        String(x.bankNm || "").toLowerCase().includes(q) ||
        String(x.rekNo || "").toLowerCase().includes(q) ||
        String(x.atmNo || "").toLowerCase().includes(q) ||
        String(x.email || "").toLowerCase().includes(q)
      );
    });
  }, [items, selectedBranchId, rekTypeFilter, statusFilter, searchQuery]);

  const openAdd = () => {
    if (!selectedBranchId) return;

    const defaultRekType = rekTypeFilter !== "ALL" ? rekTypeFilter : "DEPOSIT";
    const defaultStatus = statusFilter !== "ALL" ? statusFilter : "ACTIVE";

    setMode("add");
    setForm({
      ...emptyAtmForm,
      branchId: Number(selectedBranchId),
      rekType: defaultRekType,
      status: defaultStatus,
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setMode("edit");
    setForm({
      ...emptyAtmForm,
      ...item,
      branchId: Number(item.branchId ?? selectedBranchId),
      atmNo: formatAtmNo(item.atmNo),
      expiredKtpDt: toDateInput(item.expiredKtpDt),
      atmExpiredDt: toDateInput(item.atmExpiredDt),
      birthDt: toDateInput(item.birthDt),
      masaSewaBank: item.masaSewaBank ?? "",
      saldo: item.saldo ?? "",
      rekType: String(item.rekType || ""),
      status: String(item.status || "ACTIVE"),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (busy) return;
    setModalOpen(false);
    setForm(emptyAtmForm);
  };

  const submit = async () => {
    const payload = { ...form, branchId: Number(form.branchId || selectedBranchId || 0) };

    // backend stores ATM No as max 12 digits
    payload.atmNo = sanitizeAtmNo(payload.atmNo);

    payload.saldo = Number(payload.saldo || 0);
    payload.masaSewaBank = payload.masaSewaBank === "" ? "" : Number(payload.masaSewaBank || 0);

    payload.rekType = String(payload.rekType || "").toUpperCase();
    payload.status = String(payload.status || "").toUpperCase();
    payload.birthDt = payload.birthDt ? String(payload.birthDt).slice(0, 10) : "";


    if (!payload.branchId) return;
    if (!payload.rekType) {
      setError("Rek Type wajib diisi");
      return;
    }
    if (!payload.status) {
      setError("Status wajib diisi");
      return;
    }

    try {
      setBusy(true);
      setError("");

      if (mode === "add") {
        delete payload.id;
        await addAtmAtm0100(payload);
      } else {
        await editAtmAtm0300(payload);
      }

      await reloadAtm(allowedBranchIds);
      closeModal();
    } catch (e) {
      setError(e?.message || "Gagal simpan data");
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async (id) => {
    try {
      setBusy(true);
      setError("");
      await deleteAtmAtm0400({ atmId: String(id) });
      setConfirmDelete(null);
      await reloadAtm(allowedBranchIds);
    } catch (e) {
      setError(e?.message || "Gagal hapus data");
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  const pickBranch = (val) => {
    setSelectedBranchId(val);
    if (val) localStorage.setItem("tk-branchId", String(val));
    else localStorage.removeItem("tk-branchId");
  };

  return (
    <div style={{ minHeight: "100vh", padding: "22px 26px 0" }}>
      {/* TOP BAR */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #38bdf8, #6366f1)",
              display: "grid",
              placeItems: "center",
              color: "#071021",
              fontWeight: 900,
            }}
          >
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
          <button style={smallBtn()} onClick={() => navigate("/profile")}>
            Profile
          </button>
          <button style={smallBtn("danger")} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* HERO */}
      <div
        style={{
          marginTop: 20,
          padding: "22px 24px",
          borderRadius: 22,
          border: "1px solid var(--card-border)",
          background: "var(--panel-bg)",
          backdropFilter: "blur(14px)",
        }}
      >
        <div style={{ fontSize: 12, letterSpacing: 2.3, color: "rgba(148,163,184,0.9)", fontWeight: 800 }}>PROFILES</div>
        <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ fontSize: 44, lineHeight: 1.05, margin: 0, fontWeight: 900 }}>
            BANK INFO <span style={{ color: "#38bdf8" }}>727</span>.
          </h1>
        </div>

        <div style={{ marginTop: 8, color: "var(--card-text-sub)", fontSize: 13.5 }}>Kelola rekening ATM</div>

        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={pillBtn(false)} onClick={() => navigate("/home")}>
            TEAM INFORMATION
          </button>
          <button style={pillBtn(true)} disabled>
            BANK INFO
          </button>
          <button style={pillBtn(false)} onClick={() => navigate("/expense")}>
            EXPENSE
          </button>
          <button style={pillBtn(false)} onClick={() => navigate("/dashboard")}>
            DASHBOARD
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ marginTop: 18, ...card }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ minWidth: 260 }}>
              <div style={label}>Choose Branch</div>
              <select style={selectStyle} value={selectedBranchId} onChange={(e) => pickBranch(Number(e.target.value))}>
                <option value="">-- pilih branch --</option>
                {branches.map((b) => (
                  <option key={b.branchId} value={b.branchId}>
                    {b.branchName}
                  </option>
                ))}
              </select>
            </div>

            {/* ✅ NEW: Rek Type filter */}
            <div style={{ minWidth: 220 }}>
              <div style={label}>Rek Type</div>
              <select style={selectStyle} value={rekTypeFilter} onChange={(e) => setRekTypeFilter(e.target.value)}>
                <option value="ALL">ALL</option>
                {REK_TYPE_OPTIONS.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </div>

            {/* ✅ NEW: Status filter */}
            <div style={{ minWidth: 200 }}>
              <div style={label}>Status</div>
              <select style={selectStyle} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="ALL">ALL</option>
                {STATUS_OPTIONS.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ minWidth: 260 }}>
              <div style={label}>Search</div>
              <input style={input} placeholder="Search name / email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button style={{ ...primaryCtaStyle, padding: "10px 16px", opacity: !workspaceValid || !selectedBranchId ? 0.5 : 1, cursor: !workspaceValid || !selectedBranchId ? "not-allowed" : "pointer" }} onClick={openAdd} disabled={!workspaceValid || !selectedBranchId}>
              + Add ATM
            </button>
            <span style={badge}>
              {filtered.length} / {items.filter((x) => !selectedBranchId || Number(x.branchId) === Number(selectedBranchId)).length} data
            </span>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          {selectedBranch ? <span style={badge}>Branch: {selectedBranch.branchName}</span> : null}
        </div>

        {loading ? <div style={{ marginTop: 12, color: "var(--card-text-sub)" }}>Loading...</div> : null}
        {!loading && error ? (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 14,
              border: "1px solid rgba(239,68,68,0.35)",
              background: "rgba(239,68,68,0.10)",
              color: "rgba(248,113,113,0.95)",
            }}
          >
            Ups, Error: {error}
          </div>
        ) : null}

        {!loading && info ? (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 14,
              border: "1px solid rgba(34,197,94,0.35)",
              background: "rgba(34,197,94,0.10)",
              color: "rgba(34,197,94,0.95)",
              fontWeight: 700,
            }}
          >
            {info}
          </div>
        ) : null}


        {/* TABLE */}
        <div style={{ marginTop: 14, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
            <thead>
              <tr>
                {["#", "Rekening", "Bank", "Rek No", "ATM No", "Rek Type", "Status", "Saldo", "Phone", "Email", "Action"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "12px 10px",
                      borderBottom: "1px solid var(--card-border)",
                      color: "var(--card-text-sub)",
                      fontSize: 12.5,
                      letterSpacing: 0.5,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ padding: 14, color: "var(--card-text-sub)" }}>
                    No Data Found
                  </td>
                </tr>
              ) : (
                filtered.map((it, idx) => (
                  <tr key={it.id ?? idx}>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid rgba(148,163,184,0.12)" }}>{idx + 1}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid rgba(148,163,184,0.12)", fontWeight: 800 }}>{it.rekeningNm}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid rgba(148,163,184,0.12)" }}>{it.bankNm}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid rgba(148,163,184,0.12)" }}>{it.rekNo}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid rgba(148,163,184,0.12)" }}>{formatAtmNo(it.atmNo)}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid rgba(148,163,184,0.12)" }}>{it.rekType}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid rgba(148,163,184,0.12)" }}>{String(it.status || "ACTIVE")}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid rgba(148,163,184,0.12)" }}>Rp {formatIdr(it.saldo)}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid rgba(148,163,184,0.12)" }}>{it.noHp}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid rgba(148,163,184,0.12)" }}>{it.email}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid rgba(148,163,184,0.12)" }}>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button style={smallBtn()} onClick={() => { setDetailItem(it); setShowSensitive(false); }}>
                          Detail
                        </button>
                        <button style={smallBtn()} onClick={() => openEdit(it)}>
                          Update
                        </button>
                        <button
                          style={smallBtn()}
                          onClick={() => pickAndUploadKtp(it.id ?? it.atmId)}
                          disabled={ktpBusyId === (it.id ?? it.atmId)}
                        >
                          {ktpBusyId === (it.id ?? it.atmId) ? "Uploading..." : "🪪 KTP"}
                        </button>
                        <button style={smallBtn("danger")} onClick={() => setConfirmDelete({ id: it.id, rekeningNm: it.rekeningNm })}>
                          Delete
                        </button>
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
              <div style={{ fontWeight: 900, fontSize: 16 }}>{mode === "add" ? "Add ATM" : "Edit ATM"}</div>
              <button style={smallBtn()} onClick={closeModal} disabled={busy}>
                ✕
              </button>
            </div>

            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Row 1: Branch + Status + Rek Type */}
              <div style={grid3}>
                <div style={field}>
                  <div style={label}>Branch</div>
                  <input style={input} value={selectedBranch?.branchName || "-"} disabled />
                </div>

                <div style={field}>
                  <div style={label}>Status</div>
                  <select style={selectStyle} value={form.status || "ACTIVE"} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                    {STATUS_OPTIONS.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={field}>
                  <div style={label}>Rek Type</div>
                  <select style={selectStyle} value={form.rekType || ""} onChange={(e) => setForm((p) => ({ ...p, rekType: e.target.value }))}>
                    <option value="">-- pilih rek type --</option>
                    {REK_TYPE_OPTIONS.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Bank + Name + Rek No */}
              <div style={grid3}>
                <div style={field}>
                  <div style={label}>Bank</div>
                  <input style={input} value={form.bankNm} onChange={(e) => setForm((p) => ({ ...p, bankNm: e.target.value }))} />
                </div>
                <div style={field}>
                  <div style={label}>Rekening Name</div>
                  <input style={input} value={form.rekeningNm} onChange={(e) => setForm((p) => ({ ...p, rekeningNm: e.target.value }))} />
                </div>
                <div style={field}>
                  <div style={label}>Rek No</div>
                  <input style={input} value={form.rekNo} onChange={(e) => setForm((p) => ({ ...p, rekNo: e.target.value }))} />
                </div>
              </div>

              {/* Row 3: ATM + Saldo + PIN */}
              <div style={grid3}>
                <div style={field}>
                  <div style={label}>ATM No</div>
                  <input
                    style={input}
                    inputMode="numeric"
                    placeholder="____-____-____"
                    maxLength={14}
                    value={form.atmNo}
                    onChange={(e) => setForm((p) => ({ ...p, atmNo: formatAtmNo(e.target.value) }))}
                  />
                </div>
                <div style={field}>
                  <div style={label}>Saldo (Rp)</div>
                  <input style={input} value={form.saldo} onChange={(e) => setForm((p) => ({ ...p, saldo: e.target.value }))} />
                </div>
                <div style={field}>
                  <div style={label}>PIN</div>
                  <input style={input} value={form.pinNo} onChange={(e) => setForm((p) => ({ ...p, pinNo: e.target.value }))} />
                </div>
              </div>

              {/* Row 4: ATM Expired + Phone + Email */}
              <div style={grid3}>
                <div style={field}>
                  <div style={label}>ATM Expired</div>
                  <input
                    type="date"
                    style={input}
                    value={toDateInput(form.atmExpiredDt)}
                    onChange={(e) => setForm((p) => ({ ...p, atmExpiredDt: e.target.value }))}
                  />
                </div>
                <div style={field}>
                  <div style={label}>No HP</div>
                  <input style={input} value={form.noHp} onChange={(e) => setForm((p) => ({ ...p, noHp: e.target.value }))} />
                </div>
                <div style={field}>
                  <div style={label}>Email</div>
                  <input style={input} value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                </div>
              </div>

              <div style={grid3}>
                <div style={field}>
                  <div style={label}>User ID Mobile</div>
                  <input style={input} value={form.userIdMobile} onChange={(e) => setForm((p) => ({ ...p, userIdMobile: e.target.value }))} />
                </div>
                <div style={field}>
                  <div style={label}>Pass M-Banking</div>
                  <input style={input} value={form.passMBanking} onChange={(e) => setForm((p) => ({ ...p, passMBanking: e.target.value }))} />
                </div>
                <div style={field} />
              </div>

              <div style={grid2}>
                <div style={field}>
                  <div style={label}>KTP No</div>
                  <input style={input} value={form.ktpNo} onChange={(e) => setForm((p) => ({ ...p, ktpNo: e.target.value }))} />
                </div>
                <div style={field}>
                  <div style={label}>Expired KTP</div>
                  <input
                    type="date"
                    style={input}
                    value={toDateInput(form.expiredKtpDt)}
                    onChange={(e) => setForm((p) => ({ ...p, expiredKtpDt: e.target.value }))}
                  />
                </div>
              </div>

              <div style={grid3}>
                <div style={field}>
                  <div style={label}>Tanggal Lahir</div>
                  <input
                    type="date"
                    style={input}
                    value={toDateInput(form.birthDt)}
                    onChange={(e) => setForm((p) => ({ ...p, birthDt: e.target.value }))}
                  />
                </div>
                                
                <div style={field}>
                  <div style={label}>Birth Place</div>
                  <input
                    style={input}
                    value={form.birthPlace}
                    onChange={(e) => setForm((p) => ({ ...p, birthPlace: e.target.value }))}
                  />
                </div>
                                
                <div style={field}>
                  <div style={label}>Mother Name</div>
                  <input
                    style={input}
                    value={form.motherNm}
                    onChange={(e) => setForm((p) => ({ ...p, motherNm: e.target.value }))}
                  />
                </div>
              </div>
                                
              <div style={grid3}>
                <div style={field}>
                  <div style={label}>Gender</div>
                  <input
                    style={input}
                    value={form.gender}
                    onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
                    placeholder="M / F"
                  />
                </div>
                <div style={field} />
                <div style={field} />
              </div>


              <div style={field}>
                <div style={label}>Home Address</div>
                <input style={input} value={form.homeAddr} onChange={(e) => setForm((p) => ({ ...p, homeAddr: e.target.value }))} />
              </div>

              <div style={grid3}>
                <div style={field}>
                  <div style={label}>RT</div>
                  <input style={input} value={form.rt} onChange={(e) => setForm((p) => ({ ...p, rt: e.target.value }))} />
                </div>
                <div style={field}>
                  <div style={label}>RW</div>
                  <input style={input} value={form.rw} onChange={(e) => setForm((p) => ({ ...p, rw: e.target.value }))} />
                </div>
                <div style={field}>
                  <div style={label}>Kelurahan</div>
                  <input style={input} value={form.kelurahan} onChange={(e) => setForm((p) => ({ ...p, kelurahan: e.target.value }))} />
                </div>
              </div>

              <div style={grid3}>
                <div style={field}>
                  <div style={label}>Kecamatan</div>
                  <input style={input} value={form.kecamatan} onChange={(e) => setForm((p) => ({ ...p, kecamatan: e.target.value }))} />
                </div>
                <div style={field}>
                  <div style={label}>Kabupaten</div>
                  <input style={input} value={form.kabupaten} onChange={(e) => setForm((p) => ({ ...p, kabupaten: e.target.value }))} />
                </div>
                <div style={field}>
                  <div style={label}>Province</div>
                  <input style={input} value={form.province} onChange={(e) => setForm((p) => ({ ...p, province: e.target.value }))} />
                </div>
              </div>

              <div style={grid2}>
                <div style={field}>
                  <div style={label}>Pass Email</div>
                  <input style={input} value={form.passEmail} onChange={(e) => setForm((p) => ({ ...p, passEmail: e.target.value }))} />
                </div>
                <div style={field}>
                  <div style={label}>Remark</div>
                  <input style={input} value={form.remark} onChange={(e) => setForm((p) => ({ ...p, remark: e.target.value }))} />
                </div>
              </div>

              <div style={field}>
                <div style={label}>Masa Sewa (bulan)</div>
                <input style={input} value={form.masaSewaBank} onChange={(e) => setForm((p) => ({ ...p, masaSewaBank: e.target.value }))} />
              </div>
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button style={smallBtn()} onClick={closeModal} disabled={busy}>
                Cancel
              </button>
              <button style={smallBtn("primary")} onClick={submit} disabled={busy}>
                {busy ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* DETAIL MODAL */}
      {detailItem ? (
        <div style={modalOverlay} onClick={() => setDetailItem(null)}>
          <div style={{ ...modalCard, maxWidth: 920 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 16 }}>ATM Detail</div>
                <div style={{ marginTop: 4, color: "var(--card-text-sub)", fontSize: 13 }}>
                  Branch: {selectedBranch?.branchName || "-"} • Rek Type: {detailItem.rekType || "-"} • Status: {String(detailItem.status || "ACTIVE")}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button style={smallBtn()} onClick={() => setShowSensitive((p) => !p)}>
                  {showSensitive ? "Hide sensitive" : "Show sensitive"}
                </button>
                <button style={smallBtn()} onClick={() => setDetailItem(null)}>
                  ✕
                </button>
              </div>
            </div>

            <div style={{ marginTop: 12, ...card, padding: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 900 }}>KTP Image</div>
                <button
                  style={smallBtn()}
                  onClick={() => pickAndUploadKtp(detailItem.id ?? detailItem.atmId)}
                  disabled={ktpBusyId === (detailItem.id ?? detailItem.atmId)}
                >
                  {ktpBusyId === (detailItem.id ?? detailItem.atmId) ? "Uploading..." : "🪪 Upload / Replace"}
                </button>
              </div>

              {detailItem.ktpImage ? (
                <img
                  src={dataUrlFromMaybeBase64(detailItem.ktpImage)}
                  alt="KTP"
                  style={{
                    marginTop: 10,
                    width: "100%",
                    maxHeight: 320,
                    objectFit: "contain",
                    borderRadius: 14,
                    border: "1px solid var(--card-border)",
                    background: "rgba(0,0,0,0.03)",
                  }}
                />
              ) : (
                <div style={{ marginTop: 10, color: "var(--card-text-sub)", fontSize: 13.5 }}>Belum ada KTP yang diupload.</div>
              )}
            </div>

            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
              <div style={field}><div style={label}>Rekening Name</div><div style={{ fontWeight: 800, fontSize: 13 }}>{detailItem.rekeningNm || "-"}</div></div>
              <div style={field}><div style={label}>Bank</div><div style={{ fontWeight: 700, fontSize: 13 }}>{detailItem.bankNm || "-"}</div></div>
              <div style={field}><div style={label}>Rek No</div><div style={{ fontWeight: 700, fontSize: 13 }}>{detailItem.rekNo || "-"}</div></div>

              <div style={field}><div style={label}>Rek Type</div><div style={{ fontWeight: 700, fontSize: 13 }}>{detailItem.rekType || "-"}</div></div>
              <div style={field}><div style={label}>Status</div><div style={{ fontWeight: 700, fontSize: 13 }}>{String(detailItem.status || "ACTIVE")}</div></div>
              <div style={field}><div style={label}>Saldo</div><div style={{ fontWeight: 700, fontSize: 13 }}>Rp {formatIdr(detailItem.saldo)}</div></div>

              <div style={field}><div style={label}>ATM No</div><div style={{ fontWeight: 700, fontSize: 13 }}>{mask(detailItem.atmNo)}</div></div>
              <div style={field}><div style={label}>PIN No</div><div style={{ fontWeight: 700, fontSize: 13 }}>{mask(detailItem.pinNo)}</div></div>
              <div style={field}><div style={label}>ATM Expired</div><div style={{ fontWeight: 700, fontSize: 13 }}>{detailItem.atmExpiredDt || "-"}</div></div>

              <div style={field}><div style={label}>Phone</div><div style={{ fontWeight: 700, fontSize: 13 }}>{detailItem.noHp || "-"}</div></div>
              <div style={field}><div style={label}>Email</div><div style={{ fontWeight: 700, fontSize: 13 }}>{detailItem.email || "-"}</div></div>
              <div style={field}><div style={label}>Pass Email</div><div style={{ fontWeight: 700, fontSize: 13 }}>{mask(detailItem.passEmail)}</div></div>

              <div style={field}><div style={label}>User ID Mobile</div><div style={{ fontWeight: 700, fontSize: 13 }}>{detailItem.userIdMobile || "-"}</div></div>
              <div style={field}><div style={label}>Pass M-Banking</div><div style={{ fontWeight: 700, fontSize: 13 }}>{mask(detailItem.passMBanking)}</div></div>
              <div style={field}><div style={label}>Masa Sewa Bank</div><div style={{ fontWeight: 700, fontSize: 13 }}>{detailItem.masaSewaBank ?? "-"}</div></div>

              <div style={field}><div style={label}>KTP No</div><div style={{ fontWeight: 700, fontSize: 13 }}>{detailItem.ktpNo || "-"}</div></div>
              <div style={field}><div style={label}>Mother Name</div><div style={{ fontWeight: 700, fontSize: 13 }}>{detailItem.motherNm || "-"}</div></div>
              <div style={field}><div style={label}>Birth Place</div><div style={{ fontWeight: 700, fontSize: 13 }}>{detailItem.birthPlace || "-"}</div></div>

              <div style={{ ...field, gridColumn: "1 / -1" }}>
                <div style={label}>Home Address</div>
                <div style={{ fontWeight: 650, fontSize: 13, whiteSpace: "pre-wrap" }}>{detailItem.homeAddr || "-"}</div>
              </div>

              <div style={field}><div style={label}>RT/RW</div><div style={{ fontWeight: 650, fontSize: 13 }}>{(detailItem.rt || "-") + "/" + (detailItem.rw || "-")}</div></div>
              <div style={field}><div style={label}>Kelurahan</div><div style={{ fontWeight: 650, fontSize: 13 }}>{detailItem.kelurahan || "-"}</div></div>
              <div style={field}><div style={label}>Kecamatan</div><div style={{ fontWeight: 650, fontSize: 13 }}>{detailItem.kecamatan || "-"}</div></div>

              <div style={field}><div style={label}>Kabupaten</div><div style={{ fontWeight: 650, fontSize: 13 }}>{detailItem.kabupaten || "-"}</div></div>
              <div style={field}><div style={label}>Province</div><div style={{ fontWeight: 650, fontSize: 13 }}>{detailItem.province || "-"}</div></div>
              <div style={field}><div style={label}>Gender</div><div style={{ fontWeight: 650, fontSize: 13 }}>{detailItem.gender || "-"}</div></div>

              <div style={field}><div style={label}>Expired KTP</div><div style={{ fontWeight: 650, fontSize: 13 }}>{detailItem.expiredKtpDt || "-"}</div></div>
              <div style={field}><div style={label}>Reg Dt</div><div style={{ fontWeight: 650, fontSize: 13 }}>{detailItem.regDt || "-"}</div></div>
              <div style={field}><div style={label}>Upd Dt</div><div style={{ fontWeight: 650, fontSize: 13 }}>{detailItem.updDt || "-"}</div></div>

              <div style={{ ...field, gridColumn: "1 / -1" }}>
                <div style={label}>Remark</div>
                <div style={{ fontWeight: 650, fontSize: 13, whiteSpace: "pre-wrap" }}>{detailItem.remark || "-"}</div>
              </div>
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
              Hapus ATM "{confirmDelete.rekeningNm}"?
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button style={smallBtn()} onClick={() => setConfirmDelete(null)}>
                Cancel
              </button>
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
