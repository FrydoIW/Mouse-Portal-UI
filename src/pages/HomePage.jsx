// src/pages/HomePage.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";   
import {
  getAllDataTkd0400,
  updateTkd0500,
  deleteTkd0600,
} from "../api/tikusClient.js";



function HomePage() {
  const navigate = useNavigate();
  const email = localStorage.getItem("authEmail");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resultList, setResultList] = useState([]);

  // state untuk edit/delete
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
  name: "",
  gender: "",
  position: "",
  address: "",
  email: "",
  salaryAmount: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [deletingEmail, setDeletingEmail] = useState("");
  const [actionMessage, setActionMessage] = useState(null); // {type,text}

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError("");
        const data = await getAllDataTkd0400();
        if (!isMounted) return;

        const list = Array.isArray(data?.resultList) ? data.resultList : [];
        setResultList(list);
      } catch (err) {
        if (!isMounted) return;
        setError(err?.message || "Gagal mengambil data TKD0400");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authEmail");
    navigate("/login");
  };

  const handleScrollToData = () => {
    const el = document.getElementById("tkd0400-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const totalTrx = useMemo(
    () =>
      resultList.reduce((sum, item) => {
        const value = Number(item?.trxAmt || 0);
        return Number.isNaN(value) ? sum : sum + value;
      }, 0),
    [resultList]
  );

  const formatIdr = (value) =>
    Number(value || 0).toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // ====== HANDLER EDIT / DELETE ======
  const openEditModal = (item) => {
    setEditingItem(item);
    setEditForm({
    name: item.name || "",
    gender: item.gender || "",
    position: item.position || "",
    address: item.address || "",
    email: item.email || "",
    salaryAmount: item.trxAmt ?? 0, // prefill dari trxAmt yang ada di TKD0400
    });

    setActionMessage(null);
  };

  const closeEditModal = () => {
    if (isSaving) return;
    setEditingItem(null);
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const reloadList = async () => {
    const data = await getAllDataTkd0400();
    const list = Array.isArray(data?.resultList) ? data.resultList : [];
    setResultList(list);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setActionMessage(null);

    try {
      const payload = {
        name: editForm.name,
        gender: editForm.gender,
        position: editForm.position,
        address: editForm.address,
        email: editForm.email,
        salaryAmount: Number(editForm.salaryAmount) || 0,
      };


      const res = await updateTkd0500(payload);

      if (res?.status && res.status !== "00") {
        throw new Error(res.remark || "Gagal update data");
      }

      setActionMessage({
        type: "success",
        text: res?.remark || "Berhasil update data user.",
      });
      setEditingItem(null);
      await reloadList();
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err?.message || "Terjadi kesalahan saat update data.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const ok = window.confirm(
      `Yakin mau hapus data ${item.name} (${item.email})?`
    );
    if (!ok) return;

    setDeletingEmail(item.email);
    setActionMessage(null);

    try {
      const res = await deleteTkd0600({
      email: item.email,
      status: "00",
    });


      if (res?.status && res.status !== "00") {
        throw new Error(res.remark || "Gagal menghapus data");
      }

      setActionMessage({
        type: "success",
        text: res?.remark || "Data berhasil dihapus.",
      });
      await reloadList();
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err?.message || "Terjadi kesalahan saat menghapus data.",
      });
    } finally {
      setDeletingEmail("");
    }
  };

  // ====== STYLING ======
  const pageStyle = {
    minHeight: "100vh",
    padding: "2rem 3.5rem",
    color: "var(--card-text-main)",
    display: "flex",
    flexDirection: "column",
    gap: "2.5rem",
  };

  const topBarStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1.5rem",
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

  const heroSectionStyle = {
    display: "flex",
    gap: "2.5rem",
    alignItems: "stretch",
    flexWrap: "wrap",
  };

  const heroTextColStyle = {
    flex: "1.2 1 260px",
    maxWidth: "640px",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  };

  const heroEyebrowStyle = {
    fontSize: "0.8rem",
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    color: "var(--card-text-sub)",
  };

  const heroTitleStyle = {
    fontSize: "2.4rem",
    lineHeight: 1.15,
    fontWeight: 700,
  };

  const heroTitleAccentStyle = {
    color: "#38bdf8",
  };

  const heroSubtitleStyle = {
    fontSize: "0.95rem",
    color: "var(--card-text-sub)",
    maxWidth: "32rem",
  };

  const heroActionsStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
    marginTop: "0.5rem",
  };

  const primaryCtaStyle = {
    padding: "0.75rem 1.4rem",
    borderRadius: "999px",
    border: "none",
    background:
      "linear-gradient(135deg, #3b82f6 0%, #22c55e 40%, #06b6d4 100%)",
    color: "#0b1120",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.65)",
  };

  const secondaryCtaStyle = {
    padding: "0.7rem 1.3rem",
    borderRadius: "999px",
    border: "1px solid rgba(148, 163, 184, 0.6)",
    background: "rgba(15, 23, 42, 0.75)",
    color: "#e5e7eb",
    fontSize: "0.9rem",
    fontWeight: 500,
    cursor: "pointer",
    backdropFilter: "blur(14px)",
  };

  const heroStatsRowStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "1.2rem",
    marginTop: "0.5rem",
  };

  const heroStatCardStyle = {
    minWidth: "120px",
    padding: "0.8rem 1rem",
    borderRadius: "0.9rem",
    border: "1px solid rgba(148, 163, 184, 0.4)",
    background:
      "radial-gradient(circle at top left, rgba(56,189,248,0.1), rgba(15,23,42,0.95))",
    display: "flex",
    flexDirection: "column",
    gap: "0.15rem",
  };

  const heroStatNumberStyle = {
    fontSize: "1.25rem",
    fontWeight: 600,
  };

  const heroStatLabelStyle = {
    fontSize: "0.78rem",
    color: "var(--card-text-sub)",
  };

  const heroCardsColStyle = {
    flex: "1 1 260px",
    display: "flex",
    justifyContent: "center",
  };

  const heroCardsTrackStyle = {
    display: "flex",
    gap: "1rem",
    alignItems: "stretch",
  };

  const heroPreviewCardStyle = {
    width: "170px",
    borderRadius: "1.4rem",
    padding: "1rem 1rem 1.1rem",
    color: "#0f172a",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    background:
      "linear-gradient(160deg, #f97316 0%, #facc15 35%, #22c55e 70%, #0ea5e9 100%)",
    boxShadow: "0 30px 55px rgba(15, 23, 42, 0.75)",
    position: "relative",
    overflow: "hidden",
  };

  const heroPreviewOverlayStyle = {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 10% 0, rgba(255,255,255,0.35) 0, transparent 55%)",
    mixBlendMode: "screen",
    opacity: 0.9,
    pointerEvents: "none",
  };

  const heroPreviewLabelStyle = {
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
  };

  const heroPreviewNameStyle = {
    fontSize: "1.1rem",
    fontWeight: 700,
    marginTop: "0.2rem",
  };

  const heroPreviewMetaStyle = {
    fontSize: "0.8rem",
    marginTop: "0.3rem",
  };

  const heroPreviewFooterStyle = {
    marginTop: "1.1rem",
    fontSize: "0.75rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    zIndex: 1,
  };

  const heroPreviewBadgeStyle = {
    padding: "0.2rem 0.6rem",
    borderRadius: "999px",
    border: "1px solid rgba(15,23,42,0.18)",
    fontSize: "0.7rem",
  };

  const heroEmptyCardStyle = {
    ...heroPreviewCardStyle,
    background:
      "linear-gradient(150deg, rgba(15,23,42,0.9), rgba(30,64,175,0.95))",
    color: "#e5e7eb",
    justifyContent: "center",
    alignItems: "flex-start",
  };

  const heroEmptyTextStyle = {
    fontSize: "0.9rem",
    lineHeight: 1.4,
    maxWidth: "11rem",
  };

  const sectionWrapperStyle = {
    marginTop: "1.5rem",
    background: "var(--card-bg)",
    borderRadius: "1.2rem",
    border: "1px solid var(--card-border)",
    padding: "1.6rem 1.5rem 1.8rem",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.6)",
  };

  const sectionHeaderRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
  };

  const sectionTitleStyle = {
    fontSize: "1.15rem",
    marginBottom: "0.25rem",
  };

  const sectionSubtitleStyle = {
    fontSize: "0.85rem",
    color: "var(--card-text-sub)",
  };

  const pillCountStyle = {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.2rem 0.9rem",
    borderRadius: "999px",
    fontSize: "0.8rem",
    background: "rgba(37, 99, 235, 0.18)",
    color: "#bfdbfe",
    border: "1px solid rgba(59, 130, 246, 0.7)",
  };

  const statusRowStyle = {
    marginTop: "1rem",
  };

  const infoTextStyle = {
    fontSize: "0.85rem",
    color: "var(--card-text-sub)",
  };

  const errorBannerStyle = {
    marginTop: "0.75rem",
    padding: "0.75rem 1rem",
    borderRadius: "0.8rem",
    background: "rgba(248, 113, 113, 0.18)",
    border: "1px solid rgba(248, 113, 113, 0.6)",
    fontSize: "0.85rem",
  };

  const actionBannerBaseStyle = {
    marginTop: "0.75rem",
    padding: "0.65rem 0.9rem",
    borderRadius: "0.8rem",
    fontSize: "0.8rem",
  };

  const cardsContainerStyle = {
    marginTop: "1rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "1rem",
  };

  const itemCardStyle = {
    borderRadius: "0.9rem",
    border: "1px solid var(--card-border)",
    padding: "1rem 1.1rem",
    background:
      "radial-gradient(circle at top left, rgba(56,189,248,0.12), rgba(15,23,42,0.95))",
    display: "flex",
    flexDirection: "column",
    gap: "0.7rem",
    position: "relative",
    overflow: "hidden",
  };

  const itemAccentBarStyle = {
    position: "absolute",
    inset: "0 auto 0 0",
    width: "3px",
    background:
      "linear-gradient(to bottom, #3b82f6, #22c55e, #ec4899, #eab308)",
    opacity: 0.7,
  };

  const itemHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "0.75rem",
  };

  const nameStyle = {
    fontSize: "1rem",
    fontWeight: 600,
  };

  const refNoStyle = {
    fontSize: "0.78rem",
    color: "var(--card-text-sub)",
  };

  const indexBadgeStyle = {
    fontSize: "0.75rem",
    padding: "0.15rem 0.6rem",
    borderRadius: "999px",
    border: "1px solid rgba(148,163,184,0.6)",
    color: "var(--card-text-sub)",
  };

  const metaRowStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.4rem",
    marginTop: "0.1rem",
  };

  const metaChipStyle = {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.15rem 0.6rem",
    borderRadius: "999px",
    fontSize: "0.7rem",
    background: "rgba(15,23,42,0.8)",
    color: "#e5e7eb",
    border: "1px solid rgba(148,163,184,0.5)",
  };

  const trxPillStyle = {
    ...metaChipStyle,
    background: "rgba(22,163,74,0.1)",
    borderColor: "rgba(22,163,74,0.6)",
    color: "#bbf7d0",
  };

  const fieldRowStyle = {
    display: "grid",
    gridTemplateColumns: "80px minmax(0, 1fr)",
    columnGap: "0.5rem",
    rowGap: "0.1rem",
    fontSize: "0.8rem",
  };

  const labelStyle = {
    color: "var(--card-text-sub)",
  };

  const valueStyle = {
    color: "var(--card-text-main)",
  };

  const cardActionsRowStyle = {
    marginTop: "0.6rem",
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.45rem",
  };

  const smallButtonBaseStyle = {
    padding: "0.35rem 0.8rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: 500,
    border: "1px solid transparent",
    cursor: "pointer",
  };

  const editButtonStyle = {
    ...smallButtonBaseStyle,
    background:
      "linear-gradient(135deg, rgba(56,189,248,0.15), rgba(37,99,235,0.6))",
    borderColor: "rgba(59,130,246,0.9)",
    color: "#e5e7eb",
  };

  const deleteButtonStyle = {
    ...smallButtonBaseStyle,
    background: "rgba(248,113,113,0.12)",
    borderColor: "rgba(248,113,113,0.8)",
    color: "#fecaca",
  };

  const footerStyle = {
    marginTop: "1.5rem",
    fontSize: "0.75rem",
    color: "var(--card-text-sub)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.5rem",
    flexWrap: "wrap",
  };

  const footerRightStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    flexWrap: "wrap",
  };

  const footerDotStyle = {
    width: "4px",
    height: "4px",
    borderRadius: "999px",
    background: "rgba(148,163,184,0.8)",
  };

  // modal styles
  const modalBackdropStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.85)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  };

  const modalCardStyle = {
    width: "100%",
    maxWidth: "520px",
    background: "var(--card-bg)",
    borderRadius: "1rem",
    border: "1px solid var(--card-border)",
    padding: "1.5rem 1.7rem 1.7rem",
    boxShadow: "0 24px 60px rgba(15,23,42,0.9)",
  };

  const modalHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  };

  const modalTitleStyle = {
    fontSize: "1rem",
    fontWeight: 600,
  };

  const modalCloseButtonStyle = {
    border: "none",
    background: "transparent",
    color: "var(--card-text-sub)",
    cursor: "pointer",
    fontSize: "1.2rem",
  };

  const modalFormGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "0.75rem 0.9rem",
  };

  const modalFieldStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    fontSize: "0.8rem",
  };

  const modalLabelStyle = {
    color: "var(--card-text-sub)",
  };

  const modalInputStyle = {
    borderRadius: "0.6rem",
    border: "1px solid rgba(148,163,184,0.4)",
    padding: "0.45rem 0.65rem",
    background: "rgba(15,23,42,0.85)",
    color: "var(--card-text-main)",
    fontSize: "0.85rem",
    outline: "none",
  };

  const modalFooterStyle = {
    marginTop: "1.2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.75rem",
    flexWrap: "wrap",
  };

  const modalPrimaryButtonStyle = {
    padding: "0.55rem 1.2rem",
    borderRadius: "999px",
    border: "none",
    background:
      "linear-gradient(135deg, #22c55e 0%, #06b6d4 40%, #3b82f6 100%)",
    color: "#0b1120",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
  };

  const modalSecondaryButtonStyle = {
    padding: "0.5rem 1rem",
    borderRadius: "999px",
    border: "1px solid rgba(148,163,184,0.6)",
    background: "transparent",
    color: "var(--card-text-sub)",
    fontSize: "0.8rem",
    cursor: "pointer",
  };

  return (
    <main style={pageStyle}>
      {/* TOP BAR */}
      <header style={topBarStyle}>
        <div style={brandWrapperStyle}>
          <div style={logoCircleStyle}>TK</div>
          <div>
            <div style={brandTitleStyle}>Tikus Dashboard</div>
            <div style={brandSubtitleStyle}>Monitor Your Data Realtime</div>
          </div>
        </div>
        <div style={topRightStyle}>
          <div style={welcomeTextStyle}>
            {email ? `Hi, ${email}` : "Hi, selamat datang 👋"}
          </div>
          <button style={logoutButtonStyle} onClick={handleLogout}>
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* HERO */}
      <section style={heroSectionStyle}>
        <div style={heroTextColStyle}>
          <div>
            <div style={heroEyebrowStyle}>COMPANY PROFILES</div>
            <h1 style={heroTitleStyle}>
              Never stop{" "}
              <span style={heroTitleAccentStyle}>gambling your.</span>
            </h1>
          </div>

          <p style={heroSubtitleStyle}>TIKUS TEAM OVERVIEW</p>

          <div style={heroActionsStyle}>
            <button style={primaryCtaStyle} onClick={handleScrollToData}>
              TEAM INFORMATION
            </button>
            <button style={secondaryCtaStyle}>WAITING FOR UPDATE !!!</button>
          </div>

          <div style={heroStatsRowStyle}>
            <div style={heroStatCardStyle}>
              <div style={heroStatNumberStyle}>{resultList.length}</div>
              <div style={heroStatLabelStyle}>Active User</div>
            </div>
            <div style={heroStatCardStyle}>
              <div style={heroStatNumberStyle}>Rp {formatIdr(totalTrx)}</div>
              <div style={heroStatLabelStyle}>Salary Information</div>
            </div>
            <div style={heroStatCardStyle}>
              <div style={heroStatNumberStyle}>
                {resultList.length > 0 ? "Real-time" : "Menunggu data"}
              </div>
              <div style={heroStatLabelStyle}>System Information</div>
            </div>
          </div>
        </div>

        <div style={heroCardsColStyle}>
          <div style={heroCardsTrackStyle}>
            {resultList.slice(0, 3).map((item, index) => (
              <article key={item.refNo ?? index} style={heroPreviewCardStyle}>
                <div style={heroPreviewOverlayStyle} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={heroPreviewLabelStyle}>Profil #{index + 1}</div>
                  <div style={heroPreviewNameStyle}>{item.name}</div>
                  <div style={heroPreviewMetaStyle}>
                    {item.gender} • {item.position}
                  </div>
                </div>
                <div style={heroPreviewFooterStyle}>
                  <span style={heroPreviewBadgeStyle}>
                    Trx Rp {formatIdr(item.trxAmt)}
                  </span>
                </div>
              </article>
            ))}

            {resultList.length === 0 && (
              <article style={heroEmptyCardStyle}>
                <div style={heroPreviewOverlayStyle} />
                <p style={heroEmptyTextStyle}>No Data Found</p>
              </article>
            )}
          </div>
        </div>
      </section>

      {/* DATA SECTION */}
      <section id="tkd0400-section" style={sectionWrapperStyle}>
        <div style={sectionHeaderRowStyle}>
          <div>
            <h2 style={sectionTitleStyle}>Data ACTIVE USER</h2>
            <p style={sectionSubtitleStyle}>Data Summary</p>
          </div>
          <span style={pillCountStyle}>{resultList.length} data</span>
        </div>

        <div style={statusRowStyle}>
          {loading && <p style={infoTextStyle}>Get Data From Backend ...</p>}

          {!loading && !error && resultList.length === 0 && (
            <p style={infoTextStyle}>No Data Found</p>
          )}

          {!loading && error && (
            <div style={errorBannerStyle}>
              <strong>Ups, Error: </strong>
              <span>{error}</span>
            </div>
          )}

          {actionMessage && (
            <div
              style={{
                ...actionBannerBaseStyle,
                background:
                  actionMessage.type === "success"
                    ? "rgba(34,197,94,0.12)"
                    : "rgba(248,113,113,0.12)",
                border:
                  actionMessage.type === "success"
                    ? "1px solid rgba(34,197,94,0.7)"
                    : "1px solid rgba(248,113,113,0.7)",
              }}
            >
              {actionMessage.text}
            </div>
          )}
        </div>

        {!loading && !error && resultList.length > 0 && (
          <div style={cardsContainerStyle}>
            {resultList.map((item, index) => (
              <div key={item.refNo ?? index} style={itemCardStyle}>
                <div style={itemAccentBarStyle} />
                <div style={itemHeaderStyle}>
                  <div>
                    <div style={nameStyle}>{item.name}</div>
                    <div style={refNoStyle}>Ref No: {item.refNo}</div>
                  </div>
                  <span style={indexBadgeStyle}>#{index + 1}</span>
                </div>

                <div style={metaRowStyle}>
                  <span style={metaChipStyle}>{item.gender}</span>
                  <span style={metaChipStyle}>{item.position}</span>
                  <span style={trxPillStyle}>
                    Trx Rp {formatIdr(item.trxAmt)}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: "0.35rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                  }}
                >
                  <div style={fieldRowStyle}>
                    <div style={labelStyle}>Alamat</div>
                    <div style={valueStyle}>{item.address}</div>
                  </div>

                  <div style={fieldRowStyle}>
                    <div style={labelStyle}>Email</div>
                    <div style={valueStyle}>{item.email}</div>
                  </div>
                </div>

                <div style={cardActionsRowStyle}>
                  <button
                    type="button"
                    style={editButtonStyle}
                    onClick={() => openEditModal(item)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    style={deleteButtonStyle}
                    onClick={() => handleDelete(item)}
                    disabled={deletingEmail === item.email}
                  >
                    {deletingEmail === item.email ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer style={footerStyle}>
        <div>
          <strong>Tikus Dashboard</strong> &mdash; www.Kamboja.com
        </div>
        <div style={footerRightStyle}>
          <span>Data</span>
          <span style={footerDotStyle} />
          <span>Frontend by React + Vite</span>
        </div>
      </footer>

      {/* MODAL UPDATE DATA */}
      {editingItem && (
        <div style={modalBackdropStyle} onClick={closeEditModal}>
          <div
            style={modalCardStyle}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div style={modalHeaderStyle}>
              <div>
                <div style={modalTitleStyle}>Update Data User</div>
                <div style={sectionSubtitleStyle}>
                  {editingItem.name} — {editingItem.email}
                </div>
              </div>
              <button
                type="button"
                style={modalCloseButtonStyle}
                onClick={closeEditModal}
              >
                ×
              </button>
            </div>

                        <form onSubmit={handleSaveEdit}>
              <div style={modalFormGridStyle}>
                {/* ... field2 sebelumnya ... */}

                <div style={modalFieldStyle}>
                  <label style={modalLabelStyle}>Salary Amount</label>
                  <input
                    style={modalInputStyle}
                    type="number"
                    step="0.01"
                    value={editForm.salaryAmount}
                    onChange={(e) =>
                      handleEditChange("salaryAmount", e.target.value)
                    }
                  />
                </div>      {/* tutup div field salary */}
              </div>        {/* tutup div modalFormGridStyle */}

              <div style={modalFooterStyle}>
                <button
                  type="button"
                  style={modalSecondaryButtonStyle}
                  onClick={closeEditModal}
                  disabled={isSaving}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={modalPrimaryButtonStyle}
                  disabled={isSaving}
                >
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default HomePage;
