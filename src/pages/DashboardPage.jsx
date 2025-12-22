import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllAtmAtm0200 } from "../api/tikusClient.js";

function formatRupiah(val) {
  const n = Number(val ?? 0);
  if (Number.isNaN(n)) return "-";
  return n.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

// ===== Sparkline (trend) =====
function Sparkline({ values, width = 520, height = 140 }) {
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;

  const pad = 12;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1 || 1)) * innerW;
    const y = pad + (1 - (v - minV) / range) * innerH;
    return { x, y };
  });

  const dLine = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const dArea = `${dLine} L ${pad + innerW} ${pad + innerH} L ${pad} ${pad + innerH} Z`;

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(0, 200, 255, 0.35)" />
          <stop offset="100%" stopColor="rgba(0, 200, 255, 0.0)" />
        </linearGradient>
      </defs>

      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={pad}
          y1={pad + innerH * t}
          x2={pad + innerW}
          y2={pad + innerH * t}
          stroke="rgba(148,163,184,0.18)"
        />
      ))}

      <path d={dArea} fill="url(#sparkFill)" />
      <path d={dLine} fill="none" stroke="rgba(0, 200, 255, 0.85)" strokeWidth="3" />

      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4.2" fill="rgba(0, 200, 255, 0.9)" />
      ))}
    </svg>
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

  const sparkValues = useMemo(() => {
    const base = top5.map((x) => x.value);
    if (base.length === 0) return [0, 0, 0, 0, 0];

    const points = [];
    for (let i = 0; i < 12; i++) {
      const idx = i % base.length;
      const v = base[idx];
      const wave = Math.sin(i / 1.6) * (v * 0.06);
      points.push(Math.max(0, v + wave));
    }
    return points;
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
    background:
      "radial-gradient(circle at 30% 0, #e0f2fe 0, #2563eb 40%, #0b1120 100%)",
    color: "#f9fafb",
    fontSize: "1.15rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.6)",
  };
  const brandTitleStyle = { fontSize: "1.15rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" };
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
      {/* keyframes for skeleton */}
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
            <div className="mobile-welcome-text">
              {email ? `Hi, ${email}` : "Hi, selamat datang 👋"}
            </div>

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
          <div style={{ color: "var(--card-text-sub)", fontSize: 13.5 }}>
            Ringkasan data (Top 5 saldo ATM + visual chart)
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button style={pillBtn(false)} onClick={() => navigate("/home")}>TEAM INFORMATION</button>
            <button style={pillBtn(false)} onClick={() => navigate("/bank-info")}>BANK INFO</button>
            <button style={pillBtn(true)} disabled>DASHBOARD</button>
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

      {/* MAIN CHART AREA */}
      {isInitialLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 12, marginTop: 14 }}>
          <div style={card}>
            <Skeleton h={14} w="45%" r={999} />
            <div style={{ height: 12 }} />
            <Skeleton h={140} w="100%" r={16} />
            <div style={{ height: 10 }} />
            <Skeleton h={12} w="70%" r={999} />
          </div>

          <div style={card}>
            <Skeleton h={14} w="55%" r={999} />
            <div style={{ height: 12 }} />
            <Skeleton h={220} w="100%" r={16} />
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 12, marginTop: 14 }}>
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
              <div style={sectionTitle}>BALANCE TREND (sparkline)</div>
              <div style={subInfo}>Last refresh: {lastRefresh || "-"}</div>
            </div>
            <div style={{ marginTop: 10 }}>
              <Sparkline values={sparkValues} />
            </div>
            <div style={{ marginTop: 8, ...subInfo }}>
              *Trend dibuat dari pola Top 5 (API belum ada histori transaksi).
            </div>
          </div>

          <div style={card}>
            <div style={sectionTitle}>BALANCE BY BANK (donut)</div>
            <div style={{ marginTop: 10 }}>
              <DonutChart items={donutData.length ? donutData : [{ label: "N/A", value: 0 }]} />
            </div>
          </div>
        </div>
      )}

      {/* TOP 5 + DETAIL */}
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
                      <div style={{ fontWeight: 900 }}>#{idx + 1} {x.label}</div>
                      <div style={{ fontWeight: 900, color: "#42c2ff" }}>Rp {formatRupiah(x.value)}</div>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
                      Rekening: {x.nomorRekening}
                    </div>
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
