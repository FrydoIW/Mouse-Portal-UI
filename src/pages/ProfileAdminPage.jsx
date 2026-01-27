// src/pages/ProfileAdminPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addAdminToWorkspaceWsp0100,
  checkEmailVerifiedEma0400,
  deleteWorkspaceWsp0400,
  editEmailEma0300,
  editProfileAdm0500,
  editWorkspaceNameWsp0200,
  getAdminDataAdm0600,
  getAllWorkspaceByAdminWsp0300,
} from "../api/adminClient.js";
import { getAllBranchBro0400 } from "../api/tikusClient.js";
import { clearSession } from "../utils/auth.js";

const cardStyle = {
  maxWidth: 920,
  margin: "18px auto",
  padding: "18px",
  borderRadius: 18,
  border: "1px solid var(--card-border)",
  background: "var(--card-bg)",
  boxShadow: "0 22px 60px rgba(15, 23, 42, 0.75)",
};

const rowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
};

const labelStyle = { fontSize: 12, opacity: 0.75, marginBottom: 6 };

const inputWrapStyle = {
  display: "flex",
  alignItems: "center",
  padding: "0.75rem 0.9rem",
  borderRadius: "0.9rem",
  border: "1px solid var(--input-border)",
  background: "var(--input-bg)",
};

const inputStyle = {
  flex: 1,
  border: "none",
  outline: "none",
  background: "transparent",
  color: "var(--card-text-main)",
  fontSize: "0.93rem",
};

const primaryBtn = {
  padding: "0.8rem 1rem",
  borderRadius: 999,
  border: "none",
  cursor: "pointer",
  background: "linear-gradient(135deg, var(--primary), #4f46e5)",
  color: "white",
  fontWeight: 600,
  boxShadow: "0 18px 40px rgba(56, 189, 248, 0.35)",
};

const secondaryBtn = {
  padding: "0.8rem 1rem",
  borderRadius: 999,
  border: "1px solid var(--card-border)",
  background: "transparent",
  color: "var(--card-text-main)",
  fontWeight: 600,
  cursor: "pointer",
};


const miniBtn = (variant = "default") => ({
  padding: "0.55rem 0.8rem",
  borderRadius: 999,
  border:
    variant === "danger"
      ? "1px solid rgba(239,68,68,0.45)"
      : "1px solid var(--card-border)",
  background:
    variant === "primary"
      ? "linear-gradient(135deg, var(--primary), #4f46e5)"
      : variant === "danger"
      ? "rgba(239,68,68,0.12)"
      : "transparent",
  color: variant === "primary" ? "white" : "var(--card-text-main)",
  fontWeight: 700,
  cursor: "pointer",
});

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 13.5,
};

const thStyle = {
  textAlign: "left",
  padding: "10px 10px",
  borderBottom: "1px solid var(--card-border)",
  opacity: 0.85,
};

const tdStyle = {
  padding: "10px 10px",
  borderBottom: "1px solid rgba(148,163,184,0.18)",
  verticalAlign: "top",
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 18,
  zIndex: 9999,
};

const modalCard = {
  width: "100%",
  maxWidth: 620,
  borderRadius: 18,
  border: "1px solid var(--card-border)",
  background: "var(--card-bg)",
  backdropFilter: "blur(14px)",
  padding: 14,
  boxShadow: "0 30px 60px rgba(2, 6, 23, 0.55)",
};

const modalField = { display: "flex", flexDirection: "column", gap: 6 };
const modalLabel = { fontSize: 12.5, color: "var(--card-text-sub)", fontWeight: 800 };

const modalInput = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid var(--card-border)",
  background: "var(--input-bg)",
  color: "var(--card-text-main)",
  outline: "none",
};


export default function ProfileAdminPage() {
  const navigate = useNavigate();

  const authEmail = localStorage.getItem("authEmail") || "";

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [checkingNewEmail, setCheckingNewEmail] = useState(false);

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [admin, setAdmin] = useState(null);

  const [profileForm, setProfileForm] = useState({
    name: "",
    birthDt: "",
    gender: "",
  });

  const [newEmail, setNewEmail] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");

  // =======================
  // WORKSPACES (WSPxxxx)
  // =======================
  const [wsLoading, setWsLoading] = useState(false);
  const [wsError, setWsError] = useState("");
  const [wsInfo, setWsInfo] = useState("");

  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [expandedWorkspaceId, setExpandedWorkspaceId] = useState("");
  const [wsEditingId, setWsEditingId] = useState("");
  const [wsDeletingId, setWsDeletingId] = useState("");

  const [wsEditModal, setWsEditModal] = useState(null); // { workspaceId }
  const [wsEditName, setWsEditName] = useState("");

  const [allBranches, setAllBranches] = useState([]);
  const [branchLoading, setBranchLoading] = useState(false);

  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryBusy, setInquiryBusy] = useState(false);
  const [inquiryResult, setInquiryResult] = useState(null);
  const [addWsAdminBusy, setAddWsAdminBusy] = useState(false);

  // workspaceId -> admin list (fallback kalau backend belum kirim daftar admin)
  const [localWorkspaceAdmins, setLocalWorkspaceAdmins] = useState(() => ({}));

  // untuk handle versi B dari wsp0400 (kalau backend kirim list branch)
  const [deleteWorkspaceBranchPreview, setDeleteWorkspaceBranchPreview] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const res = await getAdminDataAdm0600(authEmail);
      const out = res?.output;
      if (!out) {
        setError("Gagal ambil data admin (output kosong)");
        setAdmin(null);
        return;
      }
      setAdmin(out);
      setProfileForm({
        name: out?.name || "",
        birthDt: String(out?.birthDt || "").slice(0, 10),
        gender: out?.gender || "",
      });
      setNewEmail("");
      setPendingEmail("");
    } catch (e) {
      setError(e?.message || "Gagal ambil data admin");
    } finally {
      setLoading(false);
    }
  };


  const loadWorkspaces = async () => {
    if (!authEmail) return;
    setWsLoading(true);
    setWsError("");
    setWsInfo("");
    try {
      const res = await getAllWorkspaceByAdminWsp0300(authEmail);
      const list = Array.isArray(res?.resultList) ? res.resultList : [];
      setWorkspaces(list);

      // auto-select first workspace (kalau belum ada selection)
      if (!selectedWorkspaceId && list?.[0]?.workspaceId) {
        setSelectedWorkspaceId(String(list[0].workspaceId));
      }
    } catch (e) {
      setWsError(e?.message || "Gagal load workspace");
    } finally {
      setWsLoading(false);
    }
  };

  const loadBranches = async () => {
    setBranchLoading(true);
    try {
      const res = await getAllBranchBro0400();
      const list = Array.isArray(res?.resultList) ? res.resultList : [];
      setAllBranches(list);
    } catch (e) {
      // branch error tidak boleh ganggu profile flow
      setWsError((prev) => prev || (e?.message || "Gagal load branch"));
    } finally {
      setBranchLoading(false);
    }
  };

  const workspaceList = useMemo(() => {
    // wsp0300 mengembalikan resultList yang biasanya berupa mapping admin-workspace.
    // Untuk tampilan list workspace, kita unique per workspaceId.
    const map = new Map();
    for (const r of workspaces) {
      const id = String(r?.workspaceId || "");
      if (!id) continue;
      const name = String(r?.namaWorkspace || r?.workspaceName || r?.workspace_name || "").trim() || "-";
      if (!map.has(id)) {
        map.set(id, { workspaceId: id, namaWorkspace: name });
      } else {
        const cur = map.get(id);
        if ((cur?.namaWorkspace === "-" || !cur?.namaWorkspace) && name && name !== "-") {
          cur.namaWorkspace = name;
        }
      }
    }
    return Array.from(map.values());
  }, [workspaces]);

  const selectedWorkspace = useMemo(() => {
    if (!selectedWorkspaceId) return null;
    return (
      workspaceList.find(
        (w) => String(w.workspaceId) === String(selectedWorkspaceId)
      ) || null
    );
  }, [workspaceList, selectedWorkspaceId]);

  // Sync workspaceId cache untuk flow lain (mis. insert branch)
  useEffect(() => {
    if (selectedWorkspaceId) {
      localStorage.setItem("tk-workspaceId", String(selectedWorkspaceId));
    }
  }, [selectedWorkspaceId]);

  // Saat user pilih workspace → isi draft name
  const workspaceBranches = useMemo(() => {
    if (!selectedWorkspaceId) return [];
    return allBranches.filter(
      (b) => String(b.workspaceId) === String(selectedWorkspaceId)
    );
  }, [allBranches, selectedWorkspaceId]);

  const workspaceAdmins = useMemo(() => {
    if (!selectedWorkspaceId) return [];

    // Dari wsp0300: group semua row yang workspaceId-nya sama.
    const fromRows = workspaces
      .filter((r) => String(r?.workspaceId || "") === String(selectedWorkspaceId))
      .map((r) => ({
        adminId: r?.adminId ?? r?.id ?? r?.admin_id,
        namaAdmin: r?.namaAdmin ?? r?.name ?? r?.nama_admin,
        hierarchy: r?.hierarchy ?? r?.role ?? r?.level,
        email: r?.email ?? r?.adminEmail ?? r?.admin_email,
      }));

    // Local fallback dari hasil add admin (supaya langsung kelihatan tanpa nunggu refresh).
    const local = Array.isArray(localWorkspaceAdmins?.[selectedWorkspaceId])
      ? localWorkspaceAdmins[selectedWorkspaceId]
      : [];

    const localNorm = local.map((x) => ({
      adminId: x?.adminId ?? x?.id ?? x?.admin_id,
      namaAdmin: x?.namaAdmin ?? x?.name ?? x?.nama_admin ?? x?.email,
      hierarchy: x?.hierarchy ?? "-",
      email: x?.email ?? x?.adminEmail ?? x?.admin_email,
    }));

    const merged = [...fromRows, ...localNorm];

    // dedupe by adminId, else email, else namaAdmin
    const seen = new Set();
    const out = [];
    for (const a of merged) {
      const key =
        (a?.adminId != null && String(a.adminId)) ||
        (a?.email && String(a.email).toLowerCase()) ||
        (a?.namaAdmin && String(a.namaAdmin).toLowerCase()) ||
        "";
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(a);
    }
    return out;
  }, [workspaces, selectedWorkspaceId, localWorkspaceAdmins]);

  const onViewWorkspace = (wsId) => {
    const id = String(wsId || "");
    setSelectedWorkspaceId(id);
    setExpandedWorkspaceId((prev) => (String(prev) === id ? "" : id));
    setInquiryEmail("");
    setInquiryResult(null);
    setDeleteWorkspaceBranchPreview(null);
  };

    const onEditWorkspaceName = (workspace) => {
    const id = String(workspace?.workspaceId || "");
    if (!id) return;

    setSelectedWorkspaceId(id);
    localStorage.setItem("tk-workspaceId", id);

    setWsEditName(String(workspace?.namaWorkspace || workspace?.workspaceName || ""));
    setWsEditModal({ workspaceId: id });
    setWsError("");
    setWsInfo("");
  };

  const onSaveWorkspaceName = async () => {
    const id = String(wsEditModal?.workspaceId || "");
    const name = String(wsEditName || "").trim();
    if (!id) return;

    if (!name) {
      setWsError("Nama workspace wajib diisi");
      return;
    }

    setWsEditingId(id);
    setWsError("");
    setWsInfo("");
    try {
      const res = await editWorkspaceNameWsp0200({
        workspaceId: id,
        workspaceName: name,
      });
      if (res?.status && res.status !== "00") {
        setWsError(res?.remark || "Gagal edit workspace");
        return;
      }
      setWsInfo(res?.remark || "Success");
      setWorkspaces((prev) =>
        prev.map((w) =>
          String(w.workspaceId) === id
            ? { ...w, namaWorkspace: name, workspaceName: name }
            : w
        )
      );
      setWsEditModal(null);
    } catch (e) {
      setWsError(e?.message || "Gagal edit workspace");
    } finally {
      setWsEditingId("");
    }
  };

  const onDeleteWorkspace = async (wsId) => {
    if (!admin?.id) {
      setWsError("Admin ID belum siap untuk delete workspace");
      return;
    }
    const id = String(wsId || "");
    if (!id) return;

    const wsName = workspaceList.find((w) => String(w.workspaceId) === id)?.namaWorkspace;
    const label = String(wsName || "").trim() || "workspace ini";
    const ok = window.confirm(`Hapus ${label}?`);
    if (!ok) return;

    setWsDeletingId(id);
    setWsError("");
    setWsInfo("");
    setDeleteWorkspaceBranchPreview(null);

    try {
      const res = await deleteWorkspaceWsp0400({
        workspaceId: id,
        adminId: admin.id,
      });

      if (res?.status && res.status !== "00") {
        setWsError(res?.remark || "Gagal delete workspace");
        return;
      }

      // handle versi B: kalau backend kirim list branch
      const possibleList =
        (Array.isArray(res?.resultList) && res.resultList) ||
        (Array.isArray(res?.branchList) && res.branchList) ||
        (Array.isArray(res?.branches) && res.branches) ||
        null;
      if (possibleList) setDeleteWorkspaceBranchPreview(possibleList);

      setWsInfo(res?.remark || "Success");
      await loadWorkspaces();
      await loadBranches();

      // reset selection kalau workspace yang dihapus sedang dipilih
      if (String(selectedWorkspaceId) === id) {
        setSelectedWorkspaceId("");
      }
      if (String(expandedWorkspaceId) === id) {
        setExpandedWorkspaceId("");
      }
    } catch (e) {
      setWsError(e?.message || "Gagal delete workspace");
    } finally {
      setWsDeletingId("");
    }
  };

  const onInquiryAdmin = async () => {
    const email = String(inquiryEmail || "").trim();
    if (!email) {
      setWsError("Email wajib diisi untuk inquiry");
      return;
    }
    setWsError("");
    setWsInfo("");
    setInquiryResult(null);
    setInquiryBusy(true);
    try {
      const res = await getAdminDataAdm0600(email);
      const out = res?.output;
      if (!out) {
        setWsError("Email tidak ditemukan");
        return;
      }
      setInquiryResult(out);
    } catch (e) {
      setWsError(e?.message || "Gagal inquiry email");
    } finally {
      setInquiryBusy(false);
    }
  };

  const onAddAdminToWorkspace = async () => {
    if (!selectedWorkspaceId) {
      setWsError("Pilih workspace dulu");
      return;
    }
    const email =
      String(inquiryResult?.email || inquiryEmail || "").trim();

    if (!email) {
      setWsError("Email admin belum ada");
      return;
    }

    setAddWsAdminBusy(true);
    setWsError("");
    setWsInfo("");
    try {
      const res = await addAdminToWorkspaceWsp0100({
        workspaceId: selectedWorkspaceId,
        email,
      });
      if (res?.status && res.status !== "00") {
        setWsError(res?.remark || "Gagal add admin ke workspace");
        return;
      }
      setWsInfo(res?.remark || "Success add new workspace");

      // update local UI admin list
      setLocalWorkspaceAdmins((prev) => {
        const cur = Array.isArray(prev?.[selectedWorkspaceId])
          ? prev[selectedWorkspaceId]
          : [];
        const next = [...cur, (inquiryResult || { email })];
        return { ...prev, [selectedWorkspaceId]: next };
      });

      // optional refresh
      await loadWorkspaces();
    } catch (e) {
      setWsError(e?.message || "Gagal add admin ke workspace");
    } finally {
      setAddWsAdminBusy(false);
    }
  };

  useEffect(() => {
    if (!authEmail) {
      navigate("/login", { replace: true });
      return;
    }
    load();
    loadWorkspaces();
    loadBranches();
  }, []);

  const onSaveProfile = async () => {
    if (!admin?.id) {
      setError("Data admin belum siap");
      return;
    }
    setError("");
    setInfo("");
    setSavingProfile(true);
    try {
      const payload = {
        id: admin.id,
        name: profileForm.name,
        birthDt: profileForm.birthDt,
        gender: profileForm.gender,
      };
      const res = await editProfileAdm0500(payload);
      if (res?.status !== "00") {
        setError(res?.remark || "Gagal edit profile");
        return;
      }
      setInfo(res?.remark || "SUCCESS EDIT ADMIN");
      await load();
    } catch (e) {
      setError(e?.message || "Gagal edit profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const onRequestEmailChange = async () => {
    if (!admin?.id) {
      setError("Data admin belum siap");
      return;
    }
    if (!newEmail) {
      setError("Email baru wajib diisi");
      return;
    }
    setError("");
    setInfo("");
    setSavingEmail(true);
    try {
      const res = await editEmailEma0300({
        newAdminEmail: newEmail,
        adminId: admin.id,
      });
      if (res?.status !== "00") {
        setError(res?.remark || "Gagal request ubah email");
        return;
      }
      setPendingEmail(newEmail);
      setInfo(
        res?.remark ||
          "Request ubah email berhasil. Sistem mengirim email verifikasi ke alamat baru."
      );
    } catch (e) {
      setError(e?.message || "Gagal request ubah email");
    } finally {
      setSavingEmail(false);
    }
  };

  const checkNewEmailVerified = async () => {
    const target = pendingEmail || newEmail;
    if (!target) {
      setError("Email target belum ada");
      return;
    }
    setError("");
    setInfo("");
    setCheckingNewEmail(true);
    try {
      const res = await checkEmailVerifiedEma0400(target);
      if (res?.status === "00") {
        setInfo(res?.remark || "Email baru sudah terverifikasi. Update sesi...");
        localStorage.setItem("authEmail", target);
        await load();
        return;
      }
      setError(res?.remark || "Email baru belum terverifikasi");
    } catch (e) {
      setError(e?.message || "Gagal cek verifikasi email baru");
    } finally {
      setCheckingNewEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="tk-page" style={{ padding: 16 }}>
        <div style={cardStyle}>Memuat data profile...</div>
      </div>
    );
  }

  return (
    <div className="tk-page" style={{ padding: 16 }}>
      <div style={{ maxWidth: 920, margin: "0 auto", display: "flex", gap: 10 }}>
        <button style={secondaryBtn} onClick={() => navigate(-1)}>
          ← Kembali
        </button>
        <button
          style={secondaryBtn}
          onClick={() => {
            clearSession();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>

      <div style={cardStyle}>
        <h2 style={{ fontWeight: 900, marginBottom: 6 }}>Profile Admin</h2>
        <div style={{ opacity: 0.75, marginBottom: 14 }}>
          Edit data profile (adm0500) dan email (ema0300 + verifikasi email).
        </div>

        {error && <p className="auth-error">{error}</p>}
        {info && <p className="auth-success">{info}</p>}

        {/* DATA READONLY */}
        <div style={{ marginTop: 12, marginBottom: 18 }}>
          <div style={rowStyle}>
            <div>
              <div style={labelStyle}>Email saat ini</div>
              <div style={inputWrapStyle}>
                <input style={inputStyle} value={admin?.email || ""} disabled />
              </div>
            </div>
            <div>
              <div style={labelStyle}>Alamat</div>
              <div style={inputWrapStyle}>
                <input style={inputStyle} value={admin?.address || ""} disabled />
              </div>
            </div>
          </div>
        </div>

        {/* EDIT PROFILE */}
        <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: 16 }}>
          <h3 style={{ fontWeight: 900, marginBottom: 10 }}>Edit Profile</h3>
          <div style={rowStyle}>
            <div>
              <div style={labelStyle}>Nama</div>
              <div style={inputWrapStyle}>
                <input
                  style={inputStyle}
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <div style={labelStyle}>Gender</div>
              <div style={inputWrapStyle}>
                <select
                  style={{ ...inputStyle, appearance: "none" }}
                  value={profileForm.gender}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, gender: e.target.value }))
                  }
                >
                  <option value="">Pilih</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div>
              <div style={labelStyle}>Tanggal Lahir</div>
              <div style={inputWrapStyle}>
                <input
                  style={inputStyle}
                  type="date"
                  value={profileForm.birthDt}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, birthDt: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <div style={labelStyle}>Admin ID (readonly)</div>
              <div style={inputWrapStyle}>
                <input style={inputStyle} value={admin?.id ?? ""} disabled />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <button style={primaryBtn} onClick={onSaveProfile} disabled={savingProfile}>
              {savingProfile ? "Menyimpan..." : "Simpan Profile"}
            </button>
            <button style={secondaryBtn} onClick={load} disabled={savingProfile}>
              Refresh
            </button>
          </div>
        </div>

        {/* EDIT EMAIL */}
        <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: 16, marginTop: 16 }}>
          <h3 style={{ fontWeight: 900, marginBottom: 10 }}>Ubah Email</h3>
          <div style={rowStyle}>
            <div>
              <div style={labelStyle}>Email baru</div>
              <div style={inputWrapStyle}>
                <input
                  style={inputStyle}
                  type="email"
                  placeholder="emailbaru@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 8, lineHeight: 1.4 }}>
                Setelah hit <b>ema0300</b>, sistem akan mengirim email verifikasi ke alamat baru.
                Setelah kamu klik link verifikasi, cek status via tombol <b>Sudah Verifikasi</b>.
              </div>
            </div>

            <div>
              <div style={labelStyle}>Email pending (setelah request)</div>
              <div style={inputWrapStyle}>
                <input style={inputStyle} value={pendingEmail || "-"} disabled />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <button style={primaryBtn} onClick={onRequestEmailChange} disabled={savingEmail}>
              {savingEmail ? "Memproses..." : "Request Ubah Email"}
            </button>
            <button style={secondaryBtn} onClick={checkNewEmailVerified} disabled={checkingNewEmail}>
              {checkingNewEmail ? "Mengecek..." : "Sudah Verifikasi"}
            </button>
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <h2 style={{ fontWeight: 900, marginBottom: 6 }}>Workspaces</h2>
        <div style={{ opacity: 0.75, marginBottom: 14 }}>
          Manajemen workspace & admin per workspace (WSP01xx) + mapping branch by workspace.
        </div>

        {wsError && <p className="auth-error">{wsError}</p>}
        {wsInfo && <p className="auth-success">{wsInfo}</p>}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <button style={secondaryBtn} onClick={loadWorkspaces} disabled={wsLoading}>
            {wsLoading ? "Loading..." : "Refresh Workspaces"}
          </button>
          <button style={secondaryBtn} onClick={loadBranches} disabled={branchLoading}>
            {branchLoading ? "Loading..." : "Refresh Branch"}
          </button>
        </div>

        {/* LIST WORKSPACE */}
        {wsLoading ? (
          <div style={{ opacity: 0.8 }}>Memuat workspace...</div>
        ) : workspaceList.length === 0 ? (
          <div style={{ opacity: 0.8 }}>Workspace belum ada untuk admin ini.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Workspace Name</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workspaceList.map((w) => {
                  const id = String(w.workspaceId || "");
                  const isSel = id && (id === String(expandedWorkspaceId));
                  return (
                    <tr key={id} style={{ background: isSel ? "rgba(56,189,248,0.08)" : "transparent" }}>
                      <td style={tdStyle}>{w.namaWorkspace || "-"}</td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button style={miniBtn("default")} onClick={() => onViewWorkspace(w.workspaceId)}>
                            View
                          </button>
                          <button
                            style={miniBtn("primary")}
                            onClick={() => onEditWorkspaceName(w)}
                            disabled={wsEditingId === id}
                          >
                            {wsEditingId === id ? "Saving..." : "Edit"}
                          </button>
                          <button
                            style={miniBtn("danger")}
                            onClick={() => onDeleteWorkspace(w.workspaceId)}
                            disabled={wsDeletingId === id}
                          >
                            {wsDeletingId === id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* WORKSPACE VIEW (no workspaceId shown in UI) */}
        {expandedWorkspaceId && (
          <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: 16, marginTop: 16 }}>
            <h3 style={{ fontWeight: 900, marginBottom: 10 }}>
              Workspace: {selectedWorkspace?.namaWorkspace || "-"}
            </h3>

            {/* ADD ADMIN TO WORKSPACE */}
            <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: 14, marginTop: 14 }}>
              <h4 style={{ fontWeight: 900, marginBottom: 8 }}>Tambah Admin ke Workspace</h4>

              <div style={rowStyle}>
                <div>
                  <div style={labelStyle}>Email</div>
                  <div style={inputWrapStyle}>
                    <input
                      style={inputStyle}
                      type="email"
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      placeholder="admin@domain.com"
                    />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap" }}>
                  <button style={secondaryBtn} onClick={onInquiryAdmin} disabled={inquiryBusy}>
                    {inquiryBusy ? "Mencari..." : "Cari (Inquiry ADM0600)"}
                  </button>
                  <button
                    style={primaryBtn}
                    onClick={onAddAdminToWorkspace}
                    disabled={!inquiryResult || addWsAdminBusy}
                  >
                    {addWsAdminBusy ? "Menambah..." : "Add ke Workspace (WSP0100)"}
                  </button>
                </div>
              </div>

              {inquiryResult && (
                <div style={{ marginTop: 10, opacity: 0.95 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, marginBottom: 6 }}>Preview Admin</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ ...inputWrapStyle, padding: "8px 10px" }}>
                      <span style={{ opacity: 0.7, marginRight: 6 }}>Nama:</span>
                      {inquiryResult?.name || "-"}
                    </span>
                    <span style={{ ...inputWrapStyle, padding: "8px 10px" }}>
                      <span style={{ opacity: 0.7, marginRight: 6 }}>Email:</span>
                      {inquiryResult?.email || "-"}
                    </span>
                    <span style={{ ...inputWrapStyle, padding: "8px 10px" }}>
                      <span style={{ opacity: 0.7, marginRight: 6 }}>ID:</span>
                      {inquiryResult?.id ?? "-"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* ADMIN LIST */}
            <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: 14, marginTop: 14 }}>
              <h4 style={{ fontWeight: 900, marginBottom: 8 }}>Admin di Workspace</h4>
              {workspaceAdmins.length === 0 ? (
                <div style={{ opacity: 0.8 }}>
                  -
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Admin</th>
                        <th style={thStyle}>Hierarchy</th>
                        <th style={thStyle}>Admin ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workspaceAdmins.map((a, idx) => {
                        const name = a?.namaAdmin || a?.name || a?.email || "-";
                        const hierarchy = a?.hierarchy || "-";
                        const id = a?.adminId ?? "-";
                        return (
                          <tr key={`${name}-${id}-${idx}`}>
                            <td style={tdStyle}>{name}</td>
                            <td style={tdStyle}>{hierarchy}</td>
                            <td style={tdStyle}>{id}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* BRANCH LIST */}
            <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: 14, marginTop: 14 }}>
              <h4 style={{ fontWeight: 900, marginBottom: 8 }}>Branch di Workspace</h4>
              {workspaceBranches.length === 0 ? (
                <div style={{ opacity: 0.8 }}>
                  -
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Branch Name</th>
                        <th style={thStyle}>Branch ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workspaceBranches.map((b) => (
                        <tr key={String(b.branchId)}>
                          <td style={tdStyle}>{b.branchName || "-"}</td>
                          <td style={tdStyle}>{b.branchId || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {Array.isArray(deleteWorkspaceBranchPreview) && deleteWorkspaceBranchPreview.length > 0 && (
                <div style={{ marginTop: 12, opacity: 0.9 }}>
                  <div style={{ fontWeight: 900, marginBottom: 6 }}>
                    (Info) Response Delete Workspace mengembalikan list branch
                  </div>
                  <div style={{ fontSize: 12.5, opacity: 0.75, marginBottom: 6 }}>
                    Ini opsional (versi B). Kalau backend tidak kirim, section ini tidak muncul.
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Branch Name</th>
                          <th style={thStyle}>Branch ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deleteWorkspaceBranchPreview.slice(0, 10).map((x, idx) => (
                          <tr key={idx}>
                            <td style={tdStyle}>{x?.branchName || x?.branch_name || "-"}</td>
                            <td style={tdStyle}>{x?.branchId || x?.branch_id || x?.number || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {wsEditModal ? (
        <div style={modalOverlay} onClick={() => { if (wsEditingId) return; setWsEditModal(null); }}>
          <div style={modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontWeight: 900, fontSize: 16 }}>Edit Workspace Name</div>
              <button style={miniBtn("default")} onClick={() => { if (wsEditingId) return; setWsEditModal(null); }} disabled={Boolean(wsEditingId)}>
                ✕
              </button>
            </div>

            <div style={{ marginTop: 12, ...modalField }}>
              <div style={modalLabel}>Workspace Name</div>
              <input
                style={modalInput}
                value={wsEditName}
                onChange={(e) => setWsEditName(e.target.value)}
                placeholder="Nama workspace..."
                autoFocus
              />
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button style={secondaryBtn} onClick={() => { if (wsEditingId) return; setWsEditModal(null); }} disabled={Boolean(wsEditingId)}>
                Cancel
              </button>
              <button style={primaryBtn} onClick={onSaveWorkspaceName} disabled={Boolean(wsEditingId)}>
                {wsEditingId ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
}
