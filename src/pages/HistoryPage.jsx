import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAllWorkspaceByAdminWsp0300 } from "../api/adminClient.js";
import { getHistoryHis0100 } from "../api/tikusClient.js";
import { clearSession } from "../utils/auth.js";

const ACTION_OPTIONS = [
  { value: "INSERT", label: "INSERT" },
  { value: "REGISTER", label: "REGISTER" },
  { value: "UPDATE", label: "UPDATE" },
];

const SECTION_OPTIONS = [
  { value: "TEAM_INFORMATION", label: "TEAM INFORMATION" },
  { value: "BANK_INFO", label: "BANK INFO" },
  { value: "EXPENSE", label: "EXPENSE" },
];

const SECTION_TABLE_MAP = {
  TEAM_INFORMATION: ["member", "member_info", "payroll"],
  BANK_INFO: ["rekening"],
  EXPENSE: ["expense"],
};

const DEFAULT_ACTION = "INSERT";
const DEFAULT_SECTION = "TEAM_INFORMATION";

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function formatShortDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
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

function shiftDays(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function safeParseChangeJson(value) {
  if (!value) return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getActionTone(actionType) {
  const key = String(actionType || "").toUpperCase();
  if (key === "REGISTER") {
    return {
      border: "1px solid rgba(250,204,21,0.32)",
      background: "rgba(250,204,21,0.12)",
      color: "#fde68a",
    };
  }
  if (key === "INSERT") {
    return {
      border: "1px solid rgba(34,197,94,0.32)",
      background: "rgba(34,197,94,0.12)",
      color: "#86efac",
    };
  }
  if (key === "UPDATE") {
    return {
      border: "1px solid rgba(56,189,248,0.32)",
      background: "rgba(56,189,248,0.12)",
      color: "#7dd3fc",
    };
  }
  return {
    border: "1px solid var(--card-border)",
    background: "var(--badge-bg)",
    color: "var(--text)",
  };
}

function countChangedKeys(changeObj) {
  const fromObj = changeObj?.from;
  const toObj = changeObj?.to;
  const fromKeys = fromObj && typeof fromObj === "object" ? Object.keys(fromObj) : [];
  const toKeys = toObj && typeof toObj === "object" ? Object.keys(toObj) : [];
  return new Set([...fromKeys, ...toKeys]).size;
}

function humanizeKey(value) {
  return String(value || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function prettyValue(value, depth = 0) {
  if (value === null || value === undefined || value === "") return "-";

  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return formatDateTime(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return formatShortDate(value);
    return value.length > 60 ? `${value.slice(0, 57)}...` : value;
  }

  if (typeof value === "number" || typeof value === "bigint") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";

  if (Array.isArray(value)) {
    const list = value.slice(0, 3).map((item) => prettyValue(item, depth + 1)).filter(Boolean);
    const suffix = value.length > 3 ? ` +${value.length - 3} lain` : "";
    return `${list.join(", ")}${suffix}` || "-";
  }

  if (typeof value === "object") {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return "-";
    const limited = entries.slice(0, depth > 0 ? 2 : 3);
    const text = limited
      .map(([key, val]) => `${humanizeKey(key)}: ${prettyValue(val, depth + 1)}`)
      .join(", ");
    const suffix = entries.length > limited.length ? ` +${entries.length - limited.length} field` : "";
    return `${text}${suffix}`;
  }

  return String(value);
}

function buildFriendlySummary(row) {
  const parsed = safeParseChangeJson(row?.changeJson);
  if (!parsed || (typeof parsed !== "object" && !Array.isArray(parsed))) {
    return row?.summary || "-";
  }

  const fromObj = parsed?.from && typeof parsed.from === "object" ? parsed.from : {};
  const toObj = parsed?.to && typeof parsed.to === "object" ? parsed.to : {};
  const keys = Array.from(new Set([...Object.keys(fromObj), ...Object.keys(toObj)]));

  if (keys.length === 0) return row?.summary || "-";

  const parts = keys.slice(0, 4).map((key) => {
    const title = humanizeKey(key);
    const fromText = prettyValue(fromObj?.[key]);
    const toText = prettyValue(toObj?.[key]);
    const action = String(row?.actionType || "").toUpperCase();

    if (action === "INSERT" || action === "REGISTER") {
      return `${title}: ${toText}`;
    }

    return `${title}: ${fromText} → ${toText}`;
  });

  if (keys.length > 4) parts.push(`+${keys.length - 4} perubahan lain`);
  return parts.join(" • ");
}

function getSectionTables(sectionKey) {
  return SECTION_TABLE_MAP[String(sectionKey || DEFAULT_SECTION).toUpperCase()] || SECTION_TABLE_MAP[DEFAULT_SECTION];
}

function getSectionLabel(sectionKey) {
  return SECTION_OPTIONS.find((item) => item.value === sectionKey)?.label || SECTION_OPTIONS[0].label;
}

function buildRowKey(row, idx) {
  return [
    row?.id ?? idx,
    row?.tableName || "",
    row?.pkValue || "",
    row?.changeAt || "",
    row?.actionType || "",
  ].join("::");
}

function sortRowsDesc(a, b) {
  const aTime = new Date(a?.changeAt || 0).getTime() || 0;
  const bTime = new Date(b?.changeAt || 0).getTime() || 0;
  if (bTime !== aTime) return bTime - aTime;
  return Number(b?.id || 0) - Number(a?.id || 0);
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
  minHeight: 50,
  padding: "12px 14px",
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

const label = {
  fontSize: 12.5,
  color: "var(--card-text-sub)",
  fontWeight: 700,
  letterSpacing: 0.2,
};

const fieldWrap = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  minWidth: 0,
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = localStorage.getItem("authEmail") || "";

  const wsFromUrl = useMemo(() => {
    const qs = new URLSearchParams(location.search);
    return String(qs.get("workspaceId") || "").trim();
  }, [location.search]);

  const [theme, setTheme] = useState(() => localStorage.getItem("tk-theme") || "dark");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("tk-theme", theme);
  }, [theme]);
  const toggleTheme = () => setTheme((p) => (p === "dark" ? "light" : "dark"));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workspaceValid, setWorkspaceValid] = useState(true);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() =>
    String(localStorage.getItem("tk-workspaceId") || "").trim()
  );
  const [workspaceName, setWorkspaceName] = useState("-");

  const today = useMemo(() => new Date(), []);
  const [filters, setFilters] = useState(() => ({
    actionType: DEFAULT_ACTION,
    sectionKey: DEFAULT_SECTION,
    fromDt: toDateInput(shiftDays(today, -14)),
    toDt: toDateInput(today),
    page: 0,
    size: 10,
  }));
  const [searchQuery, setSearchQuery] = useState("");

  const [historyRows, setHistoryRows] = useState([]);
  const [totalData, setTotalData] = useState(0);

  const resolveWorkspaceContext = async () => {
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

    if (!candidateWsId) {
      localStorage.removeItem("tk-workspaceId");
      setWorkspaceValid(false);
      setActiveWorkspaceId("");
      setWorkspaceName("-");
      return "";
    }

    localStorage.setItem("tk-workspaceId", candidateWsId);
    setWorkspaceValid(true);
    setActiveWorkspaceId(candidateWsId);

    const matched = wsRows.find((r) => String(r?.workspaceId || "").trim() === candidateWsId);
    const nextName = String(
      matched?.namaWorkspace || matched?.workspaceName || matched?.workspace_name || matched?.name || "-"
    ).trim() || "-";
    setWorkspaceName(nextName);

    return candidateWsId;
  };

  const fetchHistory = async (nextFilters, opts = {}) => {
    const merged = nextFilters || filters;
    const workspaceId = activeWorkspaceId || (await resolveWorkspaceContext());
    if (!workspaceId) {
      setHistoryRows([]);
      setTotalData(0);
      return;
    }

    if (!opts.keepLoading) setLoading(true);
    setError("");

    try {
      const page = Math.max(0, Number(merged.page || 0));
      const size = Math.max(1, Number(merged.size || 10));
      const requestSize = Math.max((page + 1) * size, size, 10);
      const tableNames = getSectionTables(merged.sectionKey);

      const responses = await Promise.all(
        tableNames.map((tableName) =>
          getHistoryHis0100({
            workspaceId,
            adminId: 0,
            actionType: String(merged.actionType || DEFAULT_ACTION).trim(),
            tableName,
            page: 0,
            size: requestSize,
            fromDt: merged.fromDt || null,
            toDt: merged.toDt || null,
          })
        )
      );

      const total = responses.reduce((sum, item) => sum + Number(item?.totalData || 0), 0);
      const mergedRows = responses
        .flatMap((item) => (Array.isArray(item?.data) ? item.data : []))
        .sort(sortRowsDesc);

      const dedupedRows = Array.from(
        new Map(mergedRows.map((row, idx) => [buildRowKey(row, idx), row])).values()
      );

      const pagedRows = dedupedRows.slice(page * size, page * size + size);
      setHistoryRows(pagedRows);
      setTotalData(total);
    } catch (e) {
      setError(e?.message || "Gagal mengambil history");
      setHistoryRows([]);
      setTotalData(0);
    } finally {
      if (!opts.keepLoading) setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError("");
        const wsId = await resolveWorkspaceContext();
        if (!alive) return;

        if (!wsId) {
          setHistoryRows([]);
          setTotalData(0);
          return;
        }

        const next = {
          actionType: DEFAULT_ACTION,
          sectionKey: DEFAULT_SECTION,
          fromDt: toDateInput(shiftDays(today, -14)),
          toDt: toDateInput(today),
          page: 0,
          size: 10,
        };

        setFilters(next);

        const tableNames = getSectionTables(next.sectionKey);
        const responses = await Promise.all(
          tableNames.map((tableName) =>
            getHistoryHis0100({
              workspaceId: wsId,
              adminId: 0,
              actionType: next.actionType,
              tableName,
              page: 0,
              size: next.size,
              fromDt: next.fromDt || null,
              toDt: next.toDt || null,
            })
          )
        );

        if (!alive) return;

        const total = responses.reduce((sum, item) => sum + Number(item?.totalData || 0), 0);
        const mergedRows = responses
          .flatMap((item) => (Array.isArray(item?.data) ? item.data : []))
          .sort(sortRowsDesc);
        const dedupedRows = Array.from(
          new Map(mergedRows.map((row, idx) => [buildRowKey(row, idx), row])).values()
        );

        setHistoryRows(dedupedRows.slice(0, next.size));
        setTotalData(total);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Gagal mengambil history");
        setHistoryRows([]);
        setTotalData(0);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [email, wsFromUrl, today]);

  const displayRows = useMemo(
    () =>
      historyRows.map((row) => ({
        ...row,
        friendlySummary: buildFriendlySummary(row),
        changeBy: row?.adminName || "-",
      })),
    [historyRows]
  );

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return displayRows;
    return displayRows.filter((row) => {
      const hay = [row?.friendlySummary, row?.changeBy, row?.actionType, row?.pkValue]
        .map((x) => String(x || "").toLowerCase())
        .join(" ");
      return hay.includes(q);
    });
  }, [displayRows, searchQuery]);

  const totalPages = useMemo(() => {
    const size = Number(filters.size || 10) || 10;
    return Math.max(1, Math.ceil(Number(totalData || 0) / size));
  }, [filters.size, totalData]);

  const latestRow = displayRows?.[0] || null;
  const latestChange = safeParseChangeJson(latestRow?.changeJson);

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  const submitFilter = async () => {
    const next = { ...filters, page: 0 };
    setFilters(next);
    await fetchHistory(next);
  };

  const changePage = async (nextPage) => {
    const page = Math.max(0, Math.min(nextPage, totalPages - 1));
    const next = { ...filters, page };
    setFilters(next);
    await fetchHistory(next, { keepLoading: false });
  };

  const resetFilter = async () => {
    const next = {
      actionType: DEFAULT_ACTION,
      sectionKey: DEFAULT_SECTION,
      fromDt: toDateInput(shiftDays(new Date(), -14)),
      toDt: toDateInput(new Date()),
      page: 0,
      size: 10,
    };
    setSearchQuery("");
    setFilters(next);
    await fetchHistory(next);
  };

  return (
    <div style={{ minHeight: "100vh", padding: "22px 26px 20px" }}>
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
          <button style={smallBtn()} onClick={() => navigate("/profile")}>Profile</button>
          <button style={smallBtn("danger")} onClick={handleLogout}>Logout</button>
        </div>
      </div>

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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.45fr) minmax(320px, 0.95fr)",
            gap: 18,
            alignItems: "stretch",
          }}
        >
          <div>
            <div style={{ fontSize: 12, letterSpacing: 2.3, color: "rgba(148,163,184,0.9)", fontWeight: 800 }}>PROFILES</div>
            <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: 12 }}>
              <h1 style={{ fontSize: 44, lineHeight: 1.05, margin: 0, fontWeight: 900 }}>
                HISTORY <span style={{ color: "#38bdf8" }}>727 GROUP</span>.
              </h1>
            </div>

            <p style={{ marginTop: 8, color: "var(--card-text-sub)", fontSize: 13.5 }}>
              Audit trail perubahan data workspace secara realtime.
            </p>

            <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button style={pillBtn(false)} onClick={() => navigate("/home")}>TEAM INFORMATION</button>
              <button style={pillBtn(false)} onClick={() => navigate("/bank-info")}>BANK INFO</button>
              <button style={pillBtn(false)} onClick={() => navigate("/expense")}>EXPENSE</button>
              <button style={pillBtn(false)} onClick={() => navigate("/dashboard")}>DASHBOARD</button>
              <button style={pillBtn(true)} disabled>HISTORY</button>
            </div>
          </div>

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
              gap: 14,
            }}
          >
            <div>
              <div style={{ fontSize: 12, letterSpacing: 2.3, color: "#facc15", fontWeight: 900 }}>HISTORY OVERVIEW</div>
              <div style={{ marginTop: 10, fontWeight: 900, fontSize: 18 }}>{workspaceName || "-"}</div>
              <div style={{ marginTop: 4, color: "var(--card-text-sub)", fontSize: 13.5 }}>Workspace ID: {activeWorkspaceId || "-"}</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
              <div style={{ ...card, padding: 14, background: "rgba(2, 6, 23, 0.42)", boxShadow: "none" }}>
                <div style={{ ...label, marginBottom: 8 }}>Total Data</div>
                <div style={{ fontSize: 18, fontWeight: 900 }}>{Number(totalData || 0).toLocaleString("id-ID")}</div>
              </div>
              <div style={{ ...card, padding: 14, background: "rgba(2, 6, 23, 0.42)", boxShadow: "none" }}>
                <div style={{ ...label, marginBottom: 8 }}>Periode</div>
                <div style={{ fontSize: 13.5, fontWeight: 800 }}>{filters.fromDt || "-"} s/d {filters.toDt || "-"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: 12 }}>
        <div style={card}>
          <div style={{ ...label, marginBottom: 8 }}>Latest Change</div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>{latestRow?.friendlySummary || "Belum ada data"}</div>
          <div style={{ marginTop: 6, color: "var(--card-text-sub)", fontSize: 13.5 }}>
            {latestRow ? `${latestRow.changeBy || "Unknown"} • ${formatDateTime(latestRow.changeAt)}` : "-"}
          </div>
        </div>

        <div style={card}>
          <div style={{ ...label, marginBottom: 8 }}>Filter Aktif</div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>{filters.actionType || DEFAULT_ACTION}</div>
          <div style={{ marginTop: 6, color: "var(--card-text-sub)", fontSize: 13.5 }}>
            Section: {getSectionLabel(filters.sectionKey)}
          </div>
        </div>

        <div style={card}>
          <div style={{ ...label, marginBottom: 8 }}>Changed Keys</div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>{latestChange ? countChangedKeys(latestChange) : 0}</div>
          <div style={{ marginTop: 6, color: "var(--card-text-sub)", fontSize: 13.5 }}>
            Dari record terbaru di halaman ini
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18, ...card }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
          <div style={fieldWrap}>
            <div style={label}>Action</div>
            <select
              style={selectStyle}
              value={filters.actionType}
              onChange={(e) => setFilters((prev) => ({ ...prev, actionType: e.target.value }))}
            >
              {ACTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div style={fieldWrap}>
            <div style={label}>Section</div>
            <select
              style={selectStyle}
              value={filters.sectionKey}
              onChange={(e) => setFilters((prev) => ({ ...prev, sectionKey: e.target.value }))}
            >
              {SECTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div style={fieldWrap}>
            <div style={label}>From Date</div>
            <input
              style={input}
              type="date"
              value={filters.fromDt}
              onChange={(e) => setFilters((prev) => ({ ...prev, fromDt: e.target.value }))}
            />
          </div>

          <div style={fieldWrap}>
            <div style={label}>To Date</div>
            <input
              style={input}
              type="date"
              value={filters.toDt}
              onChange={(e) => setFilters((prev) => ({ ...prev, toDt: e.target.value }))}
            />
          </div>

          <div style={fieldWrap}>
            <div style={label}>Page Size</div>
            <select
              style={selectStyle}
              value={filters.size}
              onChange={(e) => setFilters((prev) => ({ ...prev, size: Number(e.target.value), page: 0 }))}
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>{n} / page</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 10, color: "var(--card-text-sub)", fontSize: 12.75 }}>
          {filters.sectionKey === "TEAM_INFORMATION"
            ? "Team Information akan ambil history dari member, member_info, dan payroll."
            : filters.sectionKey === "BANK_INFO"
            ? "Bank Info akan ambil history dari rekening."
            : "Expense akan ambil history dari expense."}
        </div>

        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "minmax(280px, 1fr) auto", gap: 14, alignItems: "end" }}>
          <div style={fieldWrap}>
            <div style={label}>Search on current page</div>
            <input
              style={input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari change by / action / isi perubahan..."
            />
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", justifyContent: "flex-end" }}>
            <button style={smallBtn()} onClick={resetFilter}>Reset Filter</button>
            <button style={smallBtn("primary")} onClick={submitFilter} disabled={!workspaceValid || loading}>
              {loading ? "Loading..." : "Apply Filter"}
            </button>
            <span style={badge}>Page {Number(filters.page || 0) + 1} / {totalPages}</span>
          </div>
        </div>

        {!workspaceValid ? (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 14, border: "1px solid rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.10)", color: "rgba(248,113,113,0.95)" }}>
            Workspace tidak valid untuk akun ini. Pilih workspace dulu dari halaman profile.
          </div>
        ) : null}

        {error ? (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 14, border: "1px solid rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.10)", color: "rgba(248,113,113,0.95)" }}>
            Ups, Error: {error}
          </div>
        ) : null}

        <div style={{ marginTop: 16, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
            <thead>
              <tr>
                {["Change At", "Change By", "Action", "Summary"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "12px 10px",
                      borderBottom: "1px solid var(--card-border)",
                      color: "var(--card-text-sub)",
                      fontSize: 12.5,
                      letterSpacing: 0.45,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!loading && filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 14, color: "var(--card-text-sub)" }}>No Data Found</td>
                </tr>
              ) : null}

              {filteredRows.map((row, idx) => {
                const tone = getActionTone(row?.actionType);
                return (
                  <tr key={buildRowKey(row, idx)}>
                    <td style={{ padding: "14px 10px", borderBottom: "1px solid rgba(148,163,184,0.12)", minWidth: 170 }}>
                      {formatDateTime(row?.changeAt)}
                    </td>
                    <td style={{ padding: "14px 10px", borderBottom: "1px solid rgba(148,163,184,0.12)", minWidth: 210 }}>
                      <div style={{ fontWeight: 800 }}>{row?.changeBy || "-"}</div>
                    </td>
                    <td style={{ padding: "14px 10px", borderBottom: "1px solid rgba(148,163,184,0.12)", whiteSpace: "nowrap", minWidth: 130 }}>
                      <span style={{ ...badge, ...tone }}>{row?.actionType || "-"}</span>
                    </td>
                    <td style={{ padding: "14px 10px", borderBottom: "1px solid rgba(148,163,184,0.12)", minWidth: 420 }}>
                      {row?.friendlySummary || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ color: "var(--card-text-sub)", fontSize: 13.5 }}>
            Menampilkan {filteredRows.length} data dari {Number(totalData || 0).toLocaleString("id-ID")} total history.
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              style={{ ...smallBtn(), opacity: Number(filters.page || 0) <= 0 ? 0.55 : 1 }}
              disabled={Number(filters.page || 0) <= 0 || loading}
              onClick={() => changePage(Number(filters.page || 0) - 1)}
            >
              Prev
            </button>
            <button
              style={{ ...smallBtn(), opacity: Number(filters.page || 0) >= totalPages - 1 ? 0.55 : 1 }}
              disabled={Number(filters.page || 0) >= totalPages - 1 || loading}
              onClick={() => changePage(Number(filters.page || 0) + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
