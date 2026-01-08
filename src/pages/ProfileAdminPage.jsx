// src/pages/ProfileAdminPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  checkEmailVerifiedEma0400,
  editEmailEma0300,
  editProfileAdm0500,
  getAdminDataAdm0600,
  sendVerificationEmailEma0100,
} from "../api/adminClient.js";

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

export default function ProfileAdminPage() {
  const navigate = useNavigate();

  const authEmail = localStorage.getItem("authEmail") || "";

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [checkingNewEmail, setCheckingNewEmail] = useState(false);
  const [resendingNewEmail, setResendingNewEmail] = useState(false);

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

  useEffect(() => {
    if (!authEmail) {
      navigate("/login", { replace: true });
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const resendNewEmailVerification = async () => {
    const target = pendingEmail || newEmail;
    if (!target) {
      setError("Email target belum ada");
      return;
    }
    setError("");
    setInfo("");
    setResendingNewEmail(true);
    try {
      const res = await sendVerificationEmailEma0100(target);
      const ok = res?.status === "00" || res?.status === "09";
      if (!ok) {
        setError(res?.remark || "Gagal kirim email verifikasi");
        return;
      }
      setInfo(res?.remark || "Email verifikasi terkirim. Cek inbox/spam.");
    } catch (e) {
      setError(e?.message || "Gagal kirim email verifikasi");
    } finally {
      setResendingNewEmail(false);
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
        // anggap backend sudah commit email baru setelah verifikasi.
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
            localStorage.removeItem("authEmail");
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
            <button style={secondaryBtn} onClick={resendNewEmailVerification} disabled={resendingNewEmail}>
              {resendingNewEmail ? "Mengirim ulang..." : "Kirim ulang verifikasi"}
            </button>
            <button style={secondaryBtn} onClick={checkNewEmailVerified} disabled={checkingNewEmail}>
              {checkingNewEmail ? "Mengecek..." : "Sudah Verifikasi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
