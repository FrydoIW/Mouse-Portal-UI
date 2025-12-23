import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addAtmAtm0100,
  getAllAtmAtm0200,
  editAtmAtm0300,
  deleteAtmAtm0400,
} from "../api/tikusClient.js";

const emptyForm = {
  id: "",
  nomorRekening: "",
  bank: "",
  owner: "",
  amount: "",
};

const primaryCtaStyle = { padding: "0.75rem 1.4rem", borderRadius: "999px", border: "none", background: "linear-gradient(135deg, #3b82f6 0%, #22c55e 40%, #06b6d4 100%)", color: "#0b1120", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", boxShadow: "0 18px 40px rgba(15, 23, 42, 0.65)", };

function formatRupiah(val) {
  const n = Number(val ?? 0);
  if (Number.isNaN(n)) return "-";
  return n.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function BankInfoPage() {
  const navigate = useNavigate();

  // ===== header user/theme (samain sama Home) =====
  const email = localStorage.getItem("authEmail") || "";

  const [theme, setTheme] = useState(() => localStorage.getItem("tk-theme") || "dark");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("tk-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const handleLogout = () => {
    // pakai key yg memang ada di app lu
    localStorage.removeItem("authEmail");
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("isLogin");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    navigate("/login"); // ganti kalau login route lu bukan /login
  };

  // ===== data state =====
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("add"); // add | edit
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteBusyId, setDeleteBusyId] = useState(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      [r.nomorRekening, r.bank, r.owner, String(r.id)]
        .filter(Boolean)
        .some((x) => String(x).toLowerCase().includes(s))
    );
  }, [rows, q]);

  const summary = useMemo(() => {
    const total = rows.reduce((acc, r) => acc + Number(r.amount ?? 0), 0);
    return { count: rows.length, total };
  }, [rows]);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllAtmAtm0200({ getAllData: "" });
      setRows(Array.isArray(res?.resultList) ? res.resultList : []);
    } catch (e) {
      setError(e?.message || "Gagal ambil data ATM");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openAdd = () => {
    setMode("add");
    setForm({ ...emptyForm, amount: "" });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setMode("edit");
    setForm({
      id: String(row.id ?? ""),
      nomorRekening: row.nomorRekening ?? "",
      bank: row.bank ?? "",
      owner: row.owner ?? "",
      amount: String(row.amount ?? ""),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const submit = async () => {
    if (!form.nomorRekening || !form.bank || !form.owner || form.amount === "") {
      setError("Lengkapi semua field (nomorRekening, bank, owner, amount).");
      return;
    }
    const amountNum = Number(form.amount);
    if (Number.isNaN(amountNum)) {
      setError("Amount harus angka.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      if (mode === "add") {
        await addAtmAtm0100({
          nomorRekening: form.nomorRekening,
          bank: form.bank,
          owner: form.owner,
          amount: amountNum,
        });
      } else {
        if (!form.id) {
          setError("ID kosong. Pilih data untuk diedit.");
          setSaving(false);
          return;
        }
        await editAtmAtm0300({
          id: form.id,
          nomorRekening: form.nomorRekening,
          bank: form.bank,
          owner: form.owner,
          amount: amountNum,
        });
      }

      setModalOpen(false);
      await fetchAll();
    } catch (e) {
      setError(e?.message || "Gagal simpan");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (row) => {
    const ok = window.confirm(`Hapus data ATM "${row.owner}" (ID ${row.id})?`);
    if (!ok) return;

    setDeleteBusyId(row.id);
    setError("");
    try {
      await deleteAtmAtm0400({ atmId: String(row.id) });
      await fetchAll();
    } catch (e) {
      setError(e?.message || "Gagal delete");
    } finally {
      setDeleteBusyId(null);
    }
  };

  // ===== styles (samain vibe home) =====
  const pageWrap = { width: "100%", maxWidth: 1400, margin: "0 auto", padding: 14 };
  const heroRow = { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 };
  const titleBlock = { display: "flex", flexDirection: "column", gap: 6 };
  const pills = { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" };

  const pillBtn = (active) => ({
    borderRadius: 999,
    padding: "10px 16px",
    border: "1px solid var(--card-border)",
    background: active ? "rgba(0, 200, 255, 0.25)" : "rgba(0,0,0,0.16)",
    color: "var(--card-text-main)",
    cursor: active ? "default" : "pointer",
    fontWeight: 800,
  });

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

  const input = {
    width: "100%",
    borderRadius: 14,
    padding: "12px 12px",
    border: "1px solid var(--card-border)",
    background: "var(--input-bg)",
    color: "var(--card-text-main)",
    outline: "none",
  };

  const primaryBtn = {
    borderRadius: 999,
    padding: "10px 14px",
    border: "1px solid rgba(0,0,0,0.15)",
    background: "rgba(0, 200, 255, 0.25)",
    color: "var(--card-text-main)",
    cursor: "pointer",
    fontWeight: 800,
  };

  const ghostBtn = {
    borderRadius: 999,
    padding: "10px 14px",
    border: "1px solid var(--card-border)",
    background: "rgba(0,0,0,0.16)",
    color: "var(--card-text-main)",
    cursor: "pointer",
    fontWeight: 800,
  };

  const tableWrap = { overflowX: "auto", borderRadius: 14, border: "1px solid var(--card-border)" };
  const th = { textAlign: "left", padding: "12px 10px", borderBottom: "1px solid var(--card-border)", opacity: 0.9 };
  const td = { padding: "12px 10px", borderBottom: "1px solid var(--card-border)" };

  // ===== topbar styles (lebih dekat HomePage) =====
  const topBarStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1.5rem",
    marginBottom: 10,
  };

  const brandWrapperStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  };

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

  const brandTitleStyle = {
    fontSize: "1.15rem",
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  };

  const brandSubtitleStyle = {
    fontSize: "0.8rem",
    color: "var(--card-text-sub)",
  };

  const topRightStyle = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  };

  const welcomeTextStyle = {
    fontSize: "0.9rem",
    color: "var(--card-text-sub)",
  };

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

  const themeDotStyle = {
    width: "0.6rem",
    height: "0.6rem",
    borderRadius: "999px",
  };

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

  return (
    <div className="tk-page" style={pageWrap}>
      {/* TOP BAR (konsisten kayak Home) */}
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

          <div style={welcomeTextStyle}>
            {email ? `Hi, ${email}` : "Hi, selamat datang 👋"}
          </div>

          <button style={logoutButtonStyle} onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* MOBILE MENU (CSS udah ada di index.css) */}
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

      {/* HERO */}
      <div style={heroRow}>
        <div style={titleBlock}>
          <div style={{ fontSize: 12, letterSpacing: 1.4, opacity: 0.8 }}>COMPANY PROFILES</div>

          <h1 style={{ fontSize: 40, margin: 0 }}>
            BANK <span style={{ color: "#42c2ff" }}>INFORMATION</span>.
          </h1>

          <div style={{ color: "var(--card-text-sub)", fontSize: 13.5 }}>
            Kelola rekening ATM
          </div>

          <div style={{ marginTop: 10, ...pills }}>
            <button style={pillBtn(false)} onClick={() => navigate("/home")}>
              TEAM INFORMATION
            </button>
            <button style={{...pillBtn(true),...primaryCtaStyle,padding:'10px 16px'}} disabled>
              BANK INFO
            </button>
            <button style={pillBtn(false)} onClick={() => navigate("/dashboard")}>
              DASHBOARD
            </button>
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div style={topGrid}>
        <div style={card}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>ATM ACCOUNTS</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>{summary.count}</div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>Total rekening terdaftar</div>
        </div>

        <div style={card}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>TOTAL BALANCE</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>
            Rp {formatRupiah(summary.total)}
          </div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>Akumulasi saldo seluruh rekening</div>
        </div>

        <div style={card}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>LAST REFRESH</div>
          <div style={{ fontSize: 16, fontWeight: 800, marginTop: 8 }}>
            {new Date().toLocaleString("id-ID")}
          </div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>Last Refresh</div>
        </div>
      </div>

      {/* TABLE */}
      <div style={{ ...card, marginTop: 14 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ fontWeight: 800, letterSpacing: 0.4 }}>DATA REKENING</div>

          <div style={{ flex: 1, minWidth: 240 }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search rekening"
              style={input}
            />
          </div>

          <button style={ghostBtn} onClick={fetchAll} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <button style={primaryBtn} onClick={openAdd}>
            TAMBAH DATA
          </button>
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

        <div style={{ marginTop: 12, ...tableWrap }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr>
                <th style={th}>ID</th>
                <th style={th}>Nomor Rekening</th>
                <th style={th}>Bank</th>
                <th style={th}>Owner</th>
                <th style={th}>Amount</th>
                <th style={th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td style={td} colSpan={6}>
                    Loading data...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td style={td} colSpan={6}>
                    Tidak ada data.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id}>
                    <td style={td}>{r.id}</td>
                    <td style={td}>{r.nomorRekening}</td>
                    <td style={td}>{r.bank}</td>
                    <td style={td}>{r.owner}</td>
                    <td style={td}>Rp {formatRupiah(r.amount)}</td>
                    <td style={td}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button style={ghostBtn} onClick={() => openEdit(r)}>
                          Edit
                        </button>
                        <button
                          style={{
                            ...ghostBtn,
                            border: "1px solid rgba(255,0,0,0.28)",
                            background: "rgba(255,0,0,0.08)",
                          }}
                          onClick={() => onDelete(r)}
                          disabled={deleteBusyId === r.id}
                        >
                          {deleteBusyId === r.id ? "Deleting..." : "Delete"}
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
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 14,
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 520,
              borderRadius: 18,
              border: "1px solid var(--card-border)",
              background: "var(--card-bg)",
              backdropFilter: "blur(14px)",
              padding: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                alignItems: "center",
                paddingBottom: 12,
                marginBottom: 10,
                borderBottom: "1px solid rgba(148,163,184,0.18)",
              }}
            >
              <div style={{ display: "grid", gap: 4 }}>
                <div style={{ fontSize: 12, opacity: 0.8, letterSpacing: 1.2 }}>
                  {mode === "add" ? "ADD" : "UPDATE"}
                </div>
                <h3 style={{ margin: 0, fontSize: 26, letterSpacing: 0.2 }}>
                  {mode === "add" ? "Tambah Rekening" : "Edit Rekening"}
                </h3>
              </div>
          
              <button
                style={{
                  ...ghostBtn,
                  width: 44,
                  height: 44,
                  padding: 0,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 999,
                }}
                onClick={closeModal}
                disabled={saving}
                aria-label="Close"
                title="Close"
              >
                ✕
              </button>
            </div>


            <div style={{ marginTop: 14, display: "grid", gap: 14 }}>
              {mode === "edit" ? (
                <div>
                  <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>ID</div>
                  <input value={form.id} style={input} disabled />
                </div>
              ) : null}

              <div>
                <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>Nomor Rekening</div>
                <input
                  value={form.nomorRekening}
                  onChange={(e) => setForm((p) => ({ ...p, nomorRekening: e.target.value }))}
                  style={input}
                  placeholder="contoh: 1234567890"
                />
              </div>

              <div>
                <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>Bank</div>
                <input
                  value={form.bank}
                  onChange={(e) => setForm((p) => ({ ...p, bank: e.target.value }))}
                  style={input}
                  placeholder="contoh: BCA / Mandiri / BRI"
                />
              </div>

              <div>
                <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>Owner</div>
                <input
                  value={form.owner}
                  onChange={(e) => setForm((p) => ({ ...p, owner: e.target.value }))}
                  style={input}
                  placeholder="contoh: Andi Pratama"
                />
              </div>

              <div>
                <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>Amount</div>
                <input
                  value={form.amount}
                  onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                  style={input}
                  placeholder="contoh: 1500000.50"
                />
              </div>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button style={ghostBtn} onClick={closeModal} disabled={saving}>
                Cancel
              </button>
              <button style={primaryBtn} onClick={submit} disabled={saving}>
                {saving ? "Saving..." : mode === "add" ? "Save" : "Update"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
