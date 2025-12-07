// src/pages/HomePage.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllDataTkd0400,
  updateTkd0500,
  deleteTkd0600,
  registerTkd0100,
} from "../api/tikusClient.js";

function HomePage() {
  const navigate = useNavigate();
  const email = localStorage.getItem("authEmail");

  // THEME (dark / light)
  const [theme, setTheme] = useState(
    () => localStorage.getItem("tk-theme") || "dark"
  );

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("tk-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // DATA STATE
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resultList, setResultList] = useState([]);

  // EDIT STATE
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

  // DELETE STATE
  const [deletingEmail, setDeletingEmail] = useState("");
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);

  // GLOBAL ACTION MESSAGE
  const [actionMessage, setActionMessage] = useState(null); // { type, text }

  // SEARCH STATE
  const [searchQuery, setSearchQuery] = useState("");

  // ADD USER STATE
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    gender: "",
    position: "",
    address: "",
    email: "",
    salaryAmount: "",
  });
  const [isAdding, setIsAdding] = useState(false);

  // FETCH DATA
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

  const reloadList = async () => {
    const data = await getAllDataTkd0400();
    const list = Array.isArray(data?.resultList) ? data.resultList : [];
    setResultList(list);
  };

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

  // FILTERED LIST (SEARCH)
  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return resultList;

    return resultList.filter((item) => {
      const name = (item.name || "").toLowerCase();
      const emailUser = (item.email || "").toLowerCase();
      const position = (item.position || "").toLowerCase();
      return (
        name.includes(q) ||
        emailUser.includes(q) ||
        position.includes(q)
      );
    });
  }, [resultList, searchQuery]);

  const formatIdr = (value) =>
    Number(value || 0).toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // ====== EDIT HANDLER ======
  const openEditModal = (item) => {
    setEditingItem(item);
    setEditForm({
      name: item.name || "",
      gender: item.gender || "",
      position: item.position || "",
      address: item.address || "",
      email: item.email || "",
      salaryAmount: item.trxAmt ?? 0,
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

  // ====== ADD USER HANDLER ======
  const openAddModal = () => {
    setAddForm({
      name: "",
      gender: "",
      position: "",
      address: "",
      email: "",
      salaryAmount: "",
    });
    setActionMessage(null);
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    if (isAdding) return;
    setIsAddModalOpen(false);
  };

  const handleAddChange = (field, value) => {
    setAddForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    setActionMessage(null);

    try {
      const payload = {
        name: addForm.name,
        gender: addForm.gender,
        position: addForm.position,
        address: addForm.address,
        email: addForm.email,
        salaryAmount: Number(addForm.salaryAmount) || 0,
      };

      const res = await registerTkd0100(payload);

      if (res?.status && res.status !== "00") {
        throw new Error(res.remark || "Gagal menambahkan user");
      }

      setActionMessage({
        type: "success",
        text: res?.remark || "User berhasil ditambahkan.",
      });
      setIsAddModalOpen(false);
      await reloadList();
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err?.message || "Terjadi kesalahan saat menambahkan user.",
      });
    } finally {
      setIsAdding(false);
    }
  };

  // ====== DELETE HANDLER ======
  const handleDeleteClick = (item) => {
    setConfirmDeleteItem(item);
    setActionMessage(null);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteItem) return;
    const item = confirmDeleteItem;

    setDeletingEmail(item.email);
    setActionMessage(null);

    try {
      const res = await deleteTkd0600({
        email: item.email,
        status: "09",
      });

      if (res?.status && res.status !== "00") {
        throw new Error(res.remark || "Gagal menghapus data");
      }

      setActionMessage({
        type: "success",
        text: res?.remark || "Data berhasil dihapus.",
      });
      setConfirmDeleteItem(null);
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

  const handleCancelDelete = () => {
    setConfirmDeleteItem(null);
  };

  // ====== STYLING ======
 const pageStyle = {
  minHeight: "100vh",
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

  const sectionHeaderRightStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  };

  const sectionTitleStyle = {
    fontSize: "1.15rem",
    marginBottom: "0.25rem",
  };

  const sectionSubtitleStyle = {
    fontSize: "0.85rem",
    color: "var(--card-text-sub)",
  };

  const searchInputStyle = {
    minWidth: "180px",
    padding: "0.35rem 0.6rem",
    borderRadius: "999px",
    border: "1px solid var(--input-border)",
    background: "var(--input-bg)",
    color: "var(--card-text-main)",
    fontSize: "0.8rem",
    outline: "none",
  };

  const addButtonStyle = {
    padding: "0.4rem 0.9rem",
    borderRadius: "999px",
    border: "none",
    background:
      "linear-gradient(135deg, #22c55e 0%, #06b6d4 40%, #3b82f6 100%)",
    color: "#0b1120",
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
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

  // MODAL STYLES
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
    border: "1px solid var(--input-border)",
    padding: "0.45rem 0.65rem",
    background: "var(--input-bg)",
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

  // ====== JSX RETURN ======
  return (
    <main style={pageStyle} className="tk-page">
      {/* TOP BAR */}
      <header style={topBarStyle}>
        <div style={brandWrapperStyle}>
          <div style={logoCircleStyle}>TK</div>
          <div>
            <div style={brandTitleStyle}>Tikus Dashboard</div>
            <div style={brandSubtitleStyle}>Monitor Your Data Realtime</div>
          </div>
        </div>
        {/* Desktop Menu */}
<div style={topRightStyle} className="desktop-menu">
  <button style={themeToggleStyle} onClick={toggleTheme}>
    <div
      style={{ 
        ...themeDotStyle,
        background:
          theme === "light" ? "#facc15" : "rgba(148,163,184,0.6)",
      }}
    />
    <span>{theme === "light" ? "Light" : "Dark"}</span>
  </button>

  <div style={welcomeTextStyle}>
    {email ? `Hi, ${email}` : "Hi, selamat datang 👋"}
  </div>
  <button style={logoutButtonStyle} onClick={handleLogout}>
    <span>Logout</span>
  </button>
</div>

{/* Mobile Hamburger Menu */}
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
  
  <div className={`mobile-menu-dropdown ${isMobileMenuOpen ? 'show' : ''}`}>
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
      style={{ color: '#ef4444', justifyContent: 'center' }}
    >
      <span>Logout</span>
    </button>
  </div>
</div>

{/* Close dropdown ketika klik outside */}
{isMobileMenuOpen && (
  <div 
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999,
      background: 'transparent'
    }}
    onClick={() => setIsMobileMenuOpen(false)}
  />
)}
      </header>

      {/* HERO */}
      <section style={heroSectionStyle} className="tk-page">
        <div style={heroTextColStyle} className="tk-hero-text">
          <div>
            <div style={heroEyebrowStyle}>COMPANY PROFILES</div>
            <h1 style={heroTitleStyle}>
              Never stop{" "}
              <span style={heroTitleAccentStyle}>KOPITIAM.</span>
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

        <div style={heroCardsColStyle} className="tk-hero-cards">
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
      <section
        id="tkd0400-section"
        style={sectionWrapperStyle}
        className="tk-section"
      >
        <div style={sectionHeaderRowStyle}>
          <div>
            <h2 style={sectionTitleStyle}>DATA ACTIVE USER</h2>
            <p style={sectionSubtitleStyle}>Data Summary</p>
          </div>
          <div style={sectionHeaderRightStyle}>
            <input
              style={searchInputStyle}
              type="text"
              placeholder="Search name / email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="button"
              style={addButtonStyle}
              onClick={openAddModal}
            >
              + Add User
            </button>
            <span style={pillCountStyle}>
              {filteredList.length} / {resultList.length} data
            </span>
          </div>
        </div>

        <div style={statusRowStyle}>
          {loading && <p style={infoTextStyle}>Get Data From Backend ...</p>}

          {!loading && !error && resultList.length === 0 && (
            <p style={infoTextStyle}>No data from backend.</p>
          )}

          {!loading &&
            !error &&
            resultList.length > 0 &&
            filteredList.length === 0 && (
              <p style={infoTextStyle}>
                Tidak ada data yang cocok dengan pencarian.
              </p>
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

        {!loading && !error && filteredList.length > 0 && (
          <div
            style={cardsContainerStyle}
            className="tk-card-grid"
          >
            {filteredList.map((item, index) => (
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
                    onClick={() => handleDeleteClick(item)}
                    disabled={deletingEmail === item.email}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
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

      {/* MODAL EDIT USER */}
      {editingItem && (
        <div style={modalBackdropStyle} onClick={closeEditModal}>
          <div
            style={modalCardStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={modalHeaderStyle}>
              <div>
                <div style={modalTitleStyle}>Edit User</div>
                <div style={sectionSubtitleStyle}>
                  Ubah data user lalu simpan perubahan.
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
                <div style={modalFieldStyle}>
                  <label style={modalLabelStyle}>Nama</label>
                  <input
                    style={modalInputStyle}
                    value={editForm.name}
                    onChange={(e) =>
                      handleEditChange("name", e.target.value)
                    }
                    required
                  />
                </div>

                <div style={modalFieldStyle}>
                  <label style={modalLabelStyle}>Posisi</label>
                  <input
                    style={modalInputStyle}
                    value={editForm.position}
                    onChange={(e) =>
                      handleEditChange("position", e.target.value)
                    }
                    required
                  />
                </div>

                <div style={modalFieldStyle}>
                  <label style={modalLabelStyle}>Gender</label>
                  <select
                    style={modalInputStyle}
                    value={editForm.gender}
                    onChange={(e) =>
                      handleEditChange("gender", e.target.value)
                    }
                    required
                  >
                    <option value="">Pilih</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div style={modalFieldStyle}>
                  <label style={modalLabelStyle}>Email</label>
                  <input
                    style={modalInputStyle}
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      handleEditChange("email", e.target.value)
                    }
                    required
                  />
                </div>

                <div style={{ ...modalFieldStyle, gridColumn: "1 / -1" }}>
                  <label style={modalLabelStyle}>Alamat</label>
                  <input
                    style={modalInputStyle}
                    value={editForm.address}
                    onChange={(e) =>
                      handleEditChange("address", e.target.value)
                    }
                    required
                  />
                </div>

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
                </div>
              </div>

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

      {/* MODAL ADD USER */}
      {isAddModalOpen && (
        <div style={modalBackdropStyle} onClick={closeAddModal}>
          <div
            style={modalCardStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={modalHeaderStyle}>
              <div>
                <div style={modalTitleStyle}>Add New User</div>
                <div style={sectionSubtitleStyle}>
                  Lengkapi data user baru untuk ditambahkan ke Tikus Dashboard.
                </div>
              </div>
              <button
                type="button"
                style={modalCloseButtonStyle}
                onClick={closeAddModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveAdd}>
              <div style={modalFormGridStyle}>
                <div style={modalFieldStyle}>
                  <label style={modalLabelStyle}>Nama</label>
                  <input
                    style={modalInputStyle}
                    value={addForm.name}
                    onChange={(e) =>
                      handleAddChange("name", e.target.value)
                    }
                    required
                  />
                </div>

                <div style={modalFieldStyle}>
                  <label style={modalLabelStyle}>Posisi</label>
                  <input
                    style={modalInputStyle}
                    value={addForm.position}
                    onChange={(e) =>
                      handleAddChange("position", e.target.value)
                    }
                    required
                  />
                </div>

                <div style={modalFieldStyle}>
                  <label style={modalLabelStyle}>Gender</label>
                  <select
                    style={modalInputStyle}
                    value={addForm.gender}
                    onChange={(e) =>
                      handleAddChange("gender", e.target.value)
                    }
                    required
                  >
                    <option value="">Pilih</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div style={modalFieldStyle}>
                  <label style={modalLabelStyle}>Email</label>
                  <input
                    style={modalInputStyle}
                    type="email"
                    value={addForm.email}
                    onChange={(e) =>
                      handleAddChange("email", e.target.value)
                    }
                    required
                  />
                </div>

                <div style={{ ...modalFieldStyle, gridColumn: "1 / -1" }}>
                  <label style={modalLabelStyle}>Alamat</label>
                  <input
                    style={modalInputStyle}
                    value={addForm.address}
                    onChange={(e) =>
                      handleAddChange("address", e.target.value)
                    }
                    required
                  />
                </div>

                <div style={modalFieldStyle}>
                  <label style={modalLabelStyle}>Salary Amount</label>
                  <input
                    style={modalInputStyle}
                    type="number"
                    step="0.01"
                    value={addForm.salaryAmount}
                    onChange={(e) =>
                      handleAddChange("salaryAmount", e.target.value)
                    }
                  />
                </div>
              </div>

              <div style={modalFooterStyle}>
                <button
                  type="button"
                  style={modalSecondaryButtonStyle}
                  onClick={closeAddModal}
                  disabled={isAdding}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={modalPrimaryButtonStyle}
                  disabled={isAdding}
                >
                  {isAdding ? "Menyimpan..." : "Tambah User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI DELETE */}
      {confirmDeleteItem && (
        <div style={modalBackdropStyle} onClick={handleCancelDelete}>
          <div
            style={modalCardStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={modalHeaderStyle}>
              <div>
                <div style={modalTitleStyle}>Konfirmasi Hapus</div>
                <div style={sectionSubtitleStyle}>
                  {confirmDeleteItem.name} — {confirmDeleteItem.email}
                </div>
              </div>
              <button
                type="button"
                style={modalCloseButtonStyle}
                onClick={handleCancelDelete}
              >
                ×
              </button>
            </div>

            <p style={infoTextStyle}>
              Data user ini akan dihapus dari Tikus Dashboard. Aksi ini tidak
              bisa dibatalkan.
            </p>

            <div style={{ ...modalFooterStyle, justifyContent: "flex-end" }}>
              <button
                type="button"
                style={modalSecondaryButtonStyle}
                onClick={handleCancelDelete}
                disabled={
                  deletingEmail ===
                  (confirmDeleteItem && confirmDeleteItem.email)
                }
              >
                Batal
              </button>
              <button
                type="button"
                style={{
                  ...modalPrimaryButtonStyle,
                  background:
                    "linear-gradient(135deg, #ef4444 0%, #f97316 40%, #facc15 100%)",
                  color: "#0b1120",
                }}
                onClick={handleConfirmDelete}
                disabled={
                  deletingEmail ===
                  (confirmDeleteItem && confirmDeleteItem.email)
                }
              >
                {deletingEmail ===
                (confirmDeleteItem && confirmDeleteItem.email)
                  ? "Menghapus..."
                  : "Ya, hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default HomePage;
