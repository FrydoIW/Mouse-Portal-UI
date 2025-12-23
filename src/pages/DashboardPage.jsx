import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllAtmAtm0200 } from "../api/tikusClient.js";

const primaryCtaStyle = {
  padding: "0.75rem 1.4rem",
  borderRadius: "999px",
  border: "none",
  background: "linear-gradient(135deg, #3b82f6 0%, #22c55e 40%, #06b6d4 100%)",
  color: "#0b1120",
  fontSize: "0.9rem",
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.65)",
};

function formatRupiah(val) {
  const n = Number(val ?? 0);
  if (Number.isNaN(n)) return "-";
  return n.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatShort(val) {
  const n = Number(val ?? 0);
  if (Number.isNaN(n)) return "-";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000_000) return `${(n / 1_000_000_000_000).toFixed(1)}T`;
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n.toFixed(0)}`;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/** ===== Skeleton ===== */
function Skeleton({ h = 16, w = "100%", r = 12, style = {} }) {
  return (
    <div
      style={{
        height: h,
        width: w,
        borderRadius: r,
        background:
          "linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.14) 37%, rgba(255,255,255,0.06) 63%)",
        backgroundSize: "400% 100%",
        animation: "tkShimmer 1.15s ease-in-out infinite",
        border: "1px solid rgba(148,163,184,0.14)",
        ...style,
      }}
    />
  );
}

// ===== Donut Chart (pure SVG) =====
function DonutChart({ items, size = 220 }) {
  const total = items.reduce((a, x) => a + (Number(x.value) || 0), 0) || 1;

  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  let acc = 0;

  const palette = [
    "rgba(0, 200, 255, 0.75)",
    "rgba(34, 197, 94, 0.7)",
    "rgba(250, 204, 21, 0.75)",
    "rgba(244, 63, 94, 0.7)",
    "rgba(168, 85, 247, 0.7)",
    "rgba(148, 163, 184, 0.6)",
  ];

  return (
    <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
      <svg width={size} height={size} style={{ display: "block" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />

        {items.map((it, idx) => {
          const v = Number(it.value) || 0;
          const frac = v / total;
          const dash = frac * c;

          const dasharray = `${dash} ${c - dash}`;
          const dashoffset = -acc * c;

          acc += frac;

          return (
            <circle
              key={it.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={palette[idx % palette.length]}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={dasharray}
              strokeDashoffset={dashoffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
        })}

        <text
          x="50%"
          y="48%"
          textAnchor="middle"
          fill="rgba(255,255,255,0.92)"
          fontSize="16"
          fontWeight="800"
        >
          Total
        </text>
        <text
          x="50%"
          y="58%"
          textAnchor="middle"
          fill="rgba(255,255,255,0.92)"
          fontSize="14"
          fontWeight="800"
        >
          Rp {formatRupiah(total)}
        </text>
      </svg>

      <div style={{ display: "grid", gap: 8, minWidth: 220 }}>
        {items.map((it, idx) => (
          <div
            key={it.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid var(--card-border)",
              background: "rgba(0,0,0,0.16)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: palette[idx % palette.length],
                  boxShadow: "0 0 16px rgba(0, 200, 255, 0.25)",
                }}
              />
              <div style={{ fontWeight: 800 }}>{it.label}</div>
            </div>
            <div style={{ opacity: 0.9, fontWeight: 800 }}>Rp {formatRupiah(it.value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== Clear Chart: Top 5 Balance Bar Chart (SVG) =====
function Top5BalanceChart({ items, height = 240 }) {
  const data = (items || []).slice(0, 5);
  const W = 920; // viewBox width (responsive)
  const H = height;

  if (!data.length) {
    return <div style={{ opacity: 0.75, marginTop: 10 }}>Belum ada data.</div>;
  }

  const maxV = Math.max(...data.map((x) => Number(x.value ?? 0))) || 1;

  const pad = { top: 22, right: 220, bottom: 34, left: 240 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const rowH = innerH / data.length;
  const barH = Math.min(18, rowH * 0.58);

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    t,
    x: pad.left + innerW * t,
    v: maxV * t,
  }));

  return (
    <div style={{ marginTop: 10 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H, display: "block" }}>
        <defs>
          <linearGradient id="barFill" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="rgba(0, 200, 255, 0.55)" />
            <stop offset="100%" stopColor="rgba(0, 200, 255, 0.25)" />
          </linearGradient>
        </defs>

        {/* vertical grid + tick labels */}
        {ticks.map((tk) => (
          <g key={tk.t}>
            <line x1={tk.x} y1={pad.top} x2={tk.x} y2={pad.top + innerH} stroke="rgba(148,163,184,0.16)" />
            <text
              x={tk.x}
              y={pad.top + innerH + 22}
              textAnchor="middle"
              fill="rgba(255,255,255,0.62)"
              fontSize="12"
              fontWeight="700"
            >
              {formatShort(tk.v)}
            </text>
          </g>
        ))}

        {/* bars + labels */}
        {data.map((d, i) => {
          const v = Number(d.value ?? 0);
          const w = (v / maxV) * innerW;
          const cy = pad.top + rowH * i + rowH / 2;
          const y = cy - barH / 2;

          return (
            <g key={d.id ?? `${d.label}-${i}`}>
              {/* left label */}
              <text
                x={pad.left - 10}
                y={cy + 4}
                textAnchor="end"
                fill="rgba(255,255,255,0.9)"
                fontSize="13"
                fontWeight="800"
              >
                {`${i + 1}. ${d.label}`}
              </text>

              {/* bar background */}
              <rect
                x={pad.left}
                y={y}
                width={innerW}
                height={barH}
                rx="999"
                fill="rgba(255,255,255,0.06)"
                stroke="rgba(148,163,184,0.14)"
              />

              {/* bar */}
              <rect
                x={pad.left}
                y={y}
                width={clamp(w, 0, innerW)}
                height={barH}
                rx="999"
                fill="url(#barFill)"
                stroke="rgba(0, 200, 255, 0.25)"
              />

              {/* value (full, jelas) */}
              <text
                x={pad.left + innerW + 10}
                y={cy + 4}
                textAnchor="start"
                fill="rgba(255,255,255,0.9)"
                fontSize="13"
                fontWeight="900"
              >
                Rp {formatRupiah(v)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** ===== NEW: Line Chart (SVG) ===== */
function BalanceLineChart({ points, height = 260 }) {
  const data = (points || []).slice(0, 8);
  const W = 920;
  const H = height;

  if (!data.length) return <div style={{ opacity: 0.75, marginTop: 10 }}>Belum ada data.</div>;

  const maxV = Math.max(...data.map((x) => Number(x.value ?? 0))) || 1;
  const minV = Math.min(...data.map((x) => Number(x.value ?? 0))) || 0;
  const range = maxV - minV || 1;

  const pad = { top: 22, right: 24, bottom: 54, left: 70 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    t,
    v: minV + range * (1 - t),
    y: pad.top + innerH * t,
  }));

  const pts = data.map((d, i) => {
    const x = pad.left + (i / (data.length - 1 || 1)) * innerW;
    const y = pad.top + (1 - (Number(d.value ?? 0) - minV) / range) * innerH;
    return { ...d, x, y, i };
  });

  const dLine = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div style={{ marginTop: 10 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H, display: "block" }}>
        {/* grid + y ticks */}
        {yTicks.map((tk) => (
          <g key={tk.t}>
            <line x1={pad.left} y1={tk.y} x2={pad.left + innerW} y2={tk.y} stroke="rgba(148,163,184,0.16)" />
            <text
              x={pad.left - 10}
              y={tk.y + 4}
              textAnchor="end"
              fill="rgba(255,255,255,0.62)"
              fontSize="12"
              fontWeight="700"
            >
              {formatShort(tk.v)}
            </text>
          </g>
        ))}

        {/* line */}
        <path d={dLine} fill="none" stroke="rgba(0, 200, 255, 0.88)" strokeWidth="3" />

        {/* points + value labels */}
        {pts.map((p) => (
          <g key={p.key ?? `${p.label}-${p.i}`}>
            <circle cx={p.x} cy={p.y} r="5.2" fill="rgba(0, 200, 255, 0.95)">
              <title>
                {p.label} • Rp {formatRupiah(p.value)}
              </title>
            </circle>
            <text
              x={p.x}
              y={p.y - 10}
              textAnchor="middle"
              fill="rgba(255,255,255,0.85)"
              fontSize="12"
              fontWeight="800"
            >
              {formatShort(p.value)}
            </text>
          </g>
        ))}

        {/* x labels (#rank) */}
        {pts.map((p) => (
          <g key={`x-${p.i}`}>
            <text
              x={p.x}
              y={pad.top + innerH + 26}
              textAnchor="middle"
              fill="rgba(255,255,255,0.72)"
              fontSize="12"
              fontWeight="800"
            >
              #{p.i + 1}
            </text>
          </g>
        ))}

        {/* legend mapping (bottom) */}
        <text x={pad.left} y={H - 10} textAnchor="start" fill="rgba(255,255,255,0.62)" fontSize="12" fontWeight="700">
          #1..#5 = Top balance (lihat list TOP 5 DETAIL)
        </text>
      </svg>
    </div>
  );
}

/** ===== NEW: Area Chart (SVG) - cumulative top balances ===== */
function CumulativeAreaChart({ points, height = 260 }) {
  const base = (points || []).slice(0, 8);
  if (!base.length) return <div style={{ opacity: 0.75, marginTop: 10 }}>Belum ada data.</div>;

  // cumulative series (descending order)
  const data = base.map((d, i) => {
    const prev = i === 0 ? 0 : base.slice(0, i).reduce((a, x) => a + Number(x.value ?? 0), 0);
    return { ...d, cum: prev + Number(d.value ?? 0), i };
  });

  const W = 920;
  const H = height;

  const maxV = Math.max(...data.map((x) => Number(x.cum ?? 0))) || 1;

  const pad = { top: 22, right: 24, bottom: 54, left: 70 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    t,
    v: maxV * (1 - t),
    y: pad.top + innerH * t,
  }));

  const pts = data.map((d, i) => {
    const x = pad.left + (i / (data.length - 1 || 1)) * innerW;
    const y = pad.top + (1 - Number(d.cum ?? 0) / maxV) * innerH;
    return { ...d, x, y };
  });

  const dLine = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const dArea = `${dLine} L ${pad.left + innerW} ${pad.top + innerH} L ${pad.left} ${pad.top + innerH} Z`;

  return (
    <div style={{ marginTop: 10 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H, display: "block" }}>
        <defs>
          <linearGradient id="areaFill2" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(34, 197, 94, 0.28)" />
            <stop offset="100%" stopColor="rgba(34, 197, 94, 0.02)" />
          </linearGradient>
        </defs>

        {/* grid + y ticks */}
        {yTicks.map((tk) => (
          <g key={tk.t}>
            <line x1={pad.left} y1={tk.y} x2={pad.left + innerW} y2={tk.y} stroke="rgba(148,163,184,0.16)" />
            <text
              x={pad.left - 10}
              y={tk.y + 4}
              textAnchor="end"
              fill="rgba(255,255,255,0.62)"
              fontSize="12"
              fontWeight="700"
            >
              {formatShort(tk.v)}
            </text>
          </g>
        ))}

        {/* area + line */}
        <path d={dArea} fill="url(#areaFill2)" />
        <path d={dLine} fill="none" stroke="rgba(34, 197, 94, 0.9)" strokeWidth="3" />

        {/* points */}
        {pts.map((p) => (
          <g key={`cum-${p.i}`}>
            <circle cx={p.x} cy={p.y} r="5.0" fill="rgba(34, 197, 94, 0.95)">
              <title>
                Cum #{p.i + 1} • Rp {formatRupiah(p.cum)}
              </title>
            </circle>
            <text
              x={p.x}
              y={p.y - 10}
              textAnchor="middle"
              fill="rgba(255,255,255,0.85)"
              fontSize="12"
              fontWeight="800"
            >
              {formatShort(p.cum)}
            </text>
          </g>
        ))}

        {/* x labels */}
        {pts.map((p) => (
          <text
            key={`cx-${p.i}`}
            x={p.x}
            y={pad.top + innerH + 26}
            textAnchor="middle"
            fill="rgba(255,255,255,0.72)"
            fontSize="12"
            fontWeight="800"
          >
            #{p.i + 1}
          </text>
        ))}

        <text x={pad.left} y={H - 10} textAnchor="start" fill="rgba(255,255,255,0.62)" fontSize="12" fontWeight="700">
          Cumulative (akumulasi) Top balance
        </text>
      </svg>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const email = localStorage.getItem("authEmail") || "";
  const [theme, setTheme] = useState(() => localStorage.getItem("tk-theme") || "dark");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("tk-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((p) => (p === "dark" ? "light" : "dark"));

  const handleLogout = () => {
    localStorage.removeItem("authEmail");
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("isLogin");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllAtmAtm0200({ getAllData: "" });
      const list = Array.isArray(res?.resultList) ? res.resultList : [];
      setRows(list);
      setLastRefresh(new Date().toLocaleString("id-ID"));
    } catch (e) {
      setError(e?.message || "Gagal ambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const summary = useMemo(() => {
    const count = rows.length;
    const total = rows.reduce((a, r) => a + Number(r.amount ?? 0), 0);
    const avg = count ? total / count : 0;

    const bankCount = rows.reduce((acc, r) => {
      const k = (r.bank || "-").toUpperCase();
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    const topBank = Object.entries(bankCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

    const maxRow = [...rows].sort((a, b) => Number(b.amount ?? 0) - Number(a.amount ?? 0))[0];

    return {
      count,
      total,
      avg,
      topBank,
      maxOwner: maxRow?.owner || "-",
      maxAmount: Number(maxRow?.amount ?? 0),
    };
  }, [rows]);

  const top5 = useMemo(() => {
    return [...rows]
      .sort((a, b) => Number(b.amount ?? 0) - Number(a.amount ?? 0))
      .slice(0, 5)
      .map((r) => ({
        id: r.id,
        label: `${r.owner} • ${r.bank}`,
        value: Number(r.amount ?? 0),
        bank: (r.bank || "-").toUpperCase(),
        nomorRekening: r.nomorRekening,
      }));
  }, [rows]);

  const donutData = useMemo(() => {
    const byBank = rows.reduce((acc, r) => {
      const bank = (r.bank || "-").toUpperCase();
      acc[bank] = (acc[bank] || 0) + Number(r.amount ?? 0);
      return acc;
    }, {});
    return Object.entries(byBank)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [rows]);

  // NEW: series for line & area (based on top5)
  const lineSeries = useMemo(() => {
    return (top5 || []).map((x, idx) => ({
      key: x.id ?? `${idx}`,
      label: x.label,
      value: Number(x.value ?? 0),
      i: idx,
    }));
  }, [top5]);

  // ===== styles =====
  const pageWrap = { width: "100%", maxWidth: 1400, margin: "0 auto", padding: 14 };
  const card = {
    borderRadius: 18,
    border: "1px solid var(--card-border)",
    background: "var(--card-bg)",
    padding: 14,
    backdropFilter: "blur(10px)",
  };

  const topGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
    marginTop: 14,
  };

  const pillBtn = (active) => ({
    borderRadius: 999,
    padding: "10px 16px",
    border: "1px solid var(--card-border)",
    background: active ? "rgba(0, 200, 255, 0.25)" : "rgba(0,0,0,0.16)",
    color: "var(--card-text-main)",
    cursor: active ? "default" : "pointer",
    fontWeight: 800,
  });

  const ghostBtn = {
    borderRadius: 999,
    padding: "10px 14px",
    border: "1px solid var(--card-border)",
    background: "rgba(0,0,0,0.16)",
    color: "var(--card-text-main)",
    cursor: "pointer",
    fontWeight: 800,
  };

  const topBarStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1.5rem",
    marginBottom: 10,
  };
  const brandWrapperStyle = { display: "flex", alignItems: "center", gap: "0.75rem" };
  const logoCircleStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "999px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "radial-gradient(circle at 30% 0, #e0f2fe 0, #2563eb 40%, #0b1120 100%)",
    color: "#f9fafb",
    fontSize: "1.15rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.6)",
  };
  const brandTitleStyle = {
    fontSize: "1.15rem",
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  };
  const brandSubtitleStyle = { fontSize: "0.8rem", color: "var(--card-text-sub)" };
  const topRightStyle = { display: "flex", alignItems: "center", gap: "1rem" };
  const welcomeTextStyle = { fontSize: "0.9rem", color: "var(--card-text-sub)" };
  const themeToggleStyle = {
    padding: "0.25rem 0.6rem",
    borderRadius: "999px",
    border: "1px solid rgba(148,163,184,0.6)",
    background: "var(--toggle-bg)",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    fontSize: "0.75rem",
    color: "var(--toggle-text)",
    cursor: "pointer",
    backdropFilter: "blur(12px)",
  };
  const themeDotStyle = { width: "0.6rem", height: "0.6rem", borderRadius: "999px" };
  const logoutButtonStyle = {
    padding: "0.55rem 1rem",
    borderRadius: "999px",
    background: "rgba(15, 23, 42, 0.85)",
    border: "1px solid rgba(148, 163, 184, 0.5)",
    color: "#f9fafb",
    fontSize: "0.85rem",
    fontWeight: 500,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    backdropFilter: "blur(16px)",
  };

  const sectionTitle = { fontWeight: 900, letterSpacing: 0.4 };
  const subInfo = { fontSize: 12, opacity: 0.75 };

  const isInitialLoading = loading && rows.length === 0;

  return (
    <div className="tk-page" style={pageWrap}>
      <style>{`
        @keyframes tkShimmer {
          0% { background-position: 100% 0; }
          100% { background-position: 0 0; }
        }
      `}</style>

      {/* TOP BAR */}
      <header style={topBarStyle}>
        <div style={brandWrapperStyle}>
          <div style={logoCircleStyle}>TK</div>
          <div>
            <div style={brandTitleStyle}>Tikus Dashboard</div>
            <div style={brandSubtitleStyle}>Monitor Your Data Realtime</div>
          </div>
        </div>

        <div style={topRightStyle} className="desktop-menu">
          <button style={themeToggleStyle} onClick={toggleTheme}>
            <div
              style={{
                ...themeDotStyle,
                background: theme === "light" ? "#facc15" : "rgba(148,163,184,0.6)",
              }}
            />
            <span>{theme === "light" ? "Light" : "Dark"}</span>
          </button>

          <div style={welcomeTextStyle}>{email ? `Hi, ${email}` : "Hi, selamat datang 👋"}</div>

          <button style={logoutButtonStyle} onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* MOBILE MENU */}
        <div className="mobile-menu-container">
          <button
            className="hamburger-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          <div className={`mobile-menu-dropdown ${isMobileMenuOpen ? "show" : ""}`}>
            <div className="mobile-welcome-text">{email ? `Hi, ${email}` : "Hi, selamat datang 👋"}</div>

            <button
              className="mobile-menu-item"
              onClick={() => {
                toggleTheme();
                setIsMobileMenuOpen(false);
              }}
            >
              <span>Theme: {theme === "light" ? "Light" : "Dark"}</span>
              <div
                className="theme-dot-small"
                style={{
                  background: theme === "light" ? "#facc15" : "rgba(148,163,184,0.6)",
                }}
              />
            </button>

            <button
              className="mobile-menu-item"
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              style={{ color: "#ef4444", justifyContent: "center" }}
            >
              <span>Logout</span>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
              background: "transparent",
            }}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </header>

      {/* HERO + TABS */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 1.4, opacity: 0.8 }}>COMPANY PROFILES</div>
          <h1 style={{ fontSize: 40, margin: "6px 0 0 0" }}>
            DASH<span style={{ color: "#42c2ff" }}>BOARD</span>.
          </h1>
          <div style={{ color: "var(--card-text-sub)", fontSize: 13.5 }}>Summary Data</div>

          <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button style={pillBtn(false)} onClick={() => navigate("/home")}>
              TEAM INFORMATION
            </button>
            <button style={pillBtn(false)} onClick={() => navigate("/bank-info")}>
              BANK INFO
            </button>
            <button style={{ ...pillBtn(true), ...primaryCtaStyle, padding: "10px 16px" }} disabled>
              DASHBOARD
            </button>
          </div>
        </div>

        <button style={ghostBtn} onClick={fetchAll} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* KPI CARDS */}
      {isInitialLoading ? (
        <div style={topGrid}>
          {[1, 2, 3, 4, 5].map((x) => (
            <div key={x} style={card}>
              <Skeleton h={12} w="45%" r={999} />
              <div style={{ height: 10 }} />
              <Skeleton h={26} w="70%" r={12} />
              <div style={{ height: 10 }} />
              <Skeleton h={12} w="60%" r={999} />
            </div>
          ))}
        </div>
      ) : (
        <div style={topGrid}>
          <div style={card}>
            <div style={subInfo}>ATM ACCOUNTS</div>
            <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>{summary.count}</div>
            <div style={subInfo}>Total rekening terdaftar</div>
          </div>

          <div style={card}>
            <div style={subInfo}>TOTAL BALANCE</div>
            <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>Rp {formatRupiah(summary.total)}</div>
            <div style={subInfo}>Akumulasi saldo seluruh rekening</div>
          </div>

          <div style={card}>
            <div style={subInfo}>AVG BALANCE</div>
            <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>Rp {formatRupiah(summary.avg)}</div>
            <div style={subInfo}>Rata-rata saldo per rekening</div>
          </div>

          <div style={card}>
            <div style={subInfo}>TOP BANK</div>
            <div style={{ fontSize: 18, fontWeight: 900, marginTop: 8 }}>{summary.topBank}</div>
            <div style={subInfo}>Bank dengan rekening terbanyak</div>
          </div>

          <div style={card}>
            <div style={subInfo}>HIGHEST BALANCE</div>
            <div style={{ fontSize: 16, fontWeight: 900, marginTop: 8 }}>{summary.maxOwner}</div>
            <div style={subInfo}>Rp {formatRupiah(summary.maxAmount)}</div>
          </div>
        </div>
      )}

      {/* =========================
          BARIS 1: DONUT + TOP BALANCE
         ========================= */}
      {isInitialLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 12, marginTop: 14 }}>
          <div style={card}>
            <Skeleton h={14} w="55%" r={999} />
            <div style={{ height: 12 }} />
            <Skeleton h={220} w="100%" r={16} />
          </div>

          <div style={card}>
            <Skeleton h={14} w="45%" r={999} />
            <div style={{ height: 12 }} />
            <Skeleton h={240} w="100%" r={16} />
            <div style={{ height: 10 }} />
            <Skeleton h={12} w="70%" r={999} />
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 12, marginTop: 14 }}>
          <div style={card}>
            <div style={sectionTitle}>BALANCE BY BANK</div>
            <div style={{ marginTop: 10 }}>
              <DonutChart items={donutData.length ? donutData : [{ label: "N/A", value: 0 }]} />
            </div>
          </div>

          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
              <div style={sectionTitle}>TOP 5 BALANCE CHART</div>
              <div style={subInfo}>Last refresh: {lastRefresh || "-"}</div>
            </div>

            {/* ✅ chart yang datanya jelas */}
            <Top5BalanceChart items={top5} height={240} />

            <div style={{ marginTop: 8, ...subInfo }}>*Real Time.</div>
          </div>
        </div>
      )}

      {/* =========================
          BARIS 2 (NEW): LINE + AREA
         ========================= */}
      {isInitialLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
          <div style={card}>
            <Skeleton h={14} w="45%" r={999} />
            <div style={{ height: 12 }} />
            <Skeleton h={260} w="100%" r={16} />
          </div>
          <div style={card}>
            <Skeleton h={14} w="45%" r={999} />
            <div style={{ height: 12 }} />
            <Skeleton h={260} w="100%" r={16} />
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
              <div style={sectionTitle}>TOP BALANCE (LINE)</div>
              <div style={subInfo}>Based on Top 5</div>
            </div>
            <BalanceLineChart points={lineSeries} height={260} />
            <div style={{ marginTop: 8, ...subInfo }}>* Line Chart Overview *</div>
          </div>

          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
              <div style={sectionTitle}>CUMULATIVE (AREA)</div>
              <div style={subInfo}>Akumulasi Top 5</div>
            </div>
            <CumulativeAreaChart points={lineSeries} height={260} />
            <div style={{ marginTop: 8, ...subInfo }}>* Area Top 5 *</div>
          </div>
        </div>
      )}

      {/* =========================
          BARIS 3: TOP 5 RANK + DETAIL (existing)
         ========================= */}
      {isInitialLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 12, marginTop: 14 }}>
          <div style={card}>
            <Skeleton h={14} w="40%" r={999} />
            <div style={{ height: 14 }} />
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "190px 1fr 120px",
                  gap: 12,
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Skeleton h={14} w="100%" r={999} />
                <Skeleton h={22} w="100%" r={999} />
                <Skeleton h={14} w="100%" r={999} />
              </div>
            ))}
          </div>

          <div style={card}>
            <Skeleton h={14} w="45%" r={999} />
            <div style={{ height: 12 }} />
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <Skeleton h={70} w="100%" r={14} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 12, marginTop: 14 }}>
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
              <div style={sectionTitle}>TOP 5 ATM BALANCE</div>
              <div style={subInfo}>Ranking saldo tertinggi</div>
            </div>

            {error ? (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid var(--card-border)",
                  background: "rgba(255,0,0,0.08)",
                  color: "var(--card-text-main)",
                }}
              >
                {error}
              </div>
            ) : null}

            <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
              {top5.length === 0 ? (
                <div style={{ opacity: 0.75 }}>Belum ada data.</div>
              ) : (
                top5.map((x) => {
                  const max = top5[0]?.value || 1;
                  const pct = clamp((x.value / max) * 100, 0, 100);

                  return (
                    <div
                      key={x.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "190px 1fr 120px",
                        gap: 12,
                        alignItems: "center",
                      }}
                    >
                      <div style={{ fontWeight: 900, opacity: 0.9 }}>{x.label}</div>

                      <div
                        style={{
                          height: 22,
                          borderRadius: 999,
                          border: "1px solid rgba(148,163,184,0.18)",
                          background: "rgba(255,255,255,0.06)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            borderRadius: 999,
                            background: "rgba(0, 200, 255, 0.35)",
                            border: "1px solid rgba(0, 200, 255, 0.35)",
                          }}
                        />
                      </div>

                      <div style={{ fontWeight: 900, color: "#42c2ff" }}>Rp {formatRupiah(x.value)}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div style={card}>
            <div style={sectionTitle}>TOP 5 DETAIL</div>
            <div style={{ ...subInfo, marginTop: 4 }}>Detail rekening berdasarkan ranking saldo</div>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              {top5.length === 0 ? (
                <div style={{ opacity: 0.75 }}>Belum ada data.</div>
              ) : (
                top5.map((x, idx) => (
                  <div
                    key={x.id}
                    style={{
                      borderRadius: 14,
                      border: "1px solid var(--card-border)",
                      background: "rgba(0,0,0,0.16)",
                      padding: 12,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ fontWeight: 900 }}>
                        #{idx + 1} {x.label}
                      </div>
                      <div style={{ fontWeight: 900, color: "#42c2ff" }}>Rp {formatRupiah(x.value)}</div>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>Rekening: {x.nomorRekening}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
