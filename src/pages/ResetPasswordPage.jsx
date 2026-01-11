import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout.jsx";
import {
  checkEmailVerifiedEma0400,
  resetPasswordAdm0300,
  sendVerificationEmailEma0100,
} from "../api/adminClient.js";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [isVerified, setIsVerified] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  const resend = async () => {
    setError("");
    setInfo("");
    setResending(true);
    try {
      const res = await sendVerificationEmailEma0100(email);
      const ok = res?.status === "00" || res?.status === "09";
      if (!ok) {
        setError(res?.remark || "Gagal kirim email verifikasi");
        return;
      }
      setInfo(res?.remark || "Email verifikasi terkirim. Cek inbox/spam.");
    } catch (e) {
      setError(e?.message || "Gagal kirim email verifikasi");
    } finally {
      setResending(false);
    }
  };

  const checkVerified = async () => {
    setError("");
    setInfo("");
    setChecking(true);
    try {
      const res = await checkEmailVerifiedEma0400(email);
      if (res?.status === "00") {
        setIsVerified(true);
        setInfo(res?.remark || "Email sudah terverifikasi. Silakan buat password baru.");
        return;
      }
      setIsVerified(false);
      setError(res?.remark || "Email belum terverifikasi. Silakan klik link verifikasi dari email.");
    } catch (e) {
      setError(e?.message || "Gagal cek status verifikasi email");
    } finally {
      setChecking(false);
    }
  };

  const saveNewPassword = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!isVerified) {
      setError("Email belum terverifikasi. Klik 'Sudah Verifikasi' dulu.");
      return;
    }

    if (!newPassword) {
      setError("Password baru tidak boleh kosong");
      return;
    }

    if (newPassword !== confirm) {
      setError("Password dan konfirmasi tidak sama");
      return;
    }

    setSaving(true);
    try {
      const res = await resetPasswordAdm0300(email, newPassword);
      const ok = res?.status === "09" || res?.status === "00";
      if (!ok) {
        setError(res?.remark || "Gagal reset password");
        return;
      }

      setInfo(res?.remark || "Password berhasil diubah");
      navigate("/login", { replace: true });
    } catch (e2) {
      setError(e2?.message || "Gagal reset password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle={email ? `Akun: ${email}` : "Memuat..."}
    >
      <div className="auth-form">
        <div className="otp-hint" style={{ marginBottom: 6 }}>
          <p className="otp-hint__title">Langkah</p>
          <ol className="otp-hint__desc" style={{ marginLeft: 16 }}>
            <li>Klik link verifikasi yang dikirim ke email.</li>
            <li>Klik tombol <b>Sudah Verifikasi</b> di bawah.</li>
            <li>Masukkan password baru.</li>
          </ol>
        </div>

        {error && <p className="auth-error">{error}</p>}
        {info && <p className="auth-success">{info}</p>}

        <button
          className="primary-button"
          type="button"
          onClick={checkVerified}
          disabled={checking}
        >
          {checking ? "Mengecek..." : "Sudah Verifikasi"}
        </button>

        <button
          className="secondary-button"
          type="button"
          onClick={resend}
          disabled={resending}
        >
          {resending ? "Mengirim ulang..." : "Kirim ulang email verifikasi"}
        </button>

        <form className="auth-form" onSubmit={saveNewPassword}>
          <div className="form-field">
            <label className="form-label">Password baru</label>
            <div className="input-box">
              <input
                type="password"
                placeholder="Password baru"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={!isVerified}
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Konfirmasi password</label>
            <div className="input-box">
              <input
                type="password"
                placeholder="Ulangi password baru"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={!isVerified}
              />
            </div>
          </div>

          <button
            className="primary-button"
            type="submit"
            disabled={saving || !isVerified}
          >
            {saving ? "Menyimpan..." : "Simpan Password Baru"}
          </button>
        </form>

        <p className="auth-switch">
          Kembali ke <Link to="/login">halaman login</Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default ResetPasswordPage;
