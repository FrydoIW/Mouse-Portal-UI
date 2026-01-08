// src/pages/VerifyEmailPage.jsx
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout.jsx";
import {
  checkEmailVerifiedEma0400,
  sendVerificationEmailEma0100,
  verifyPasswordAdm0400,
} from "../api/adminClient.js";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const presetEmail = location.state?.email || "";

  // Default-nya halaman ini aman untuk "cek status" saja.
  // Mode "register" akan aktif hanya kalau user baru saja register (ditandai oleh localStorage pending2faEmail).
  const [from, setFrom] = useState(location.state?.from || "check");
  const nextPath = location.state?.next || "/generate-2fa";

  const [email, setEmail] = useState(presetEmail);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);

  // Gate tambahan: sebelum generate 2FA, minta user verifikasi password dulu
  const [password, setPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passVerified, setPassVerified] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (presetEmail) setEmail(presetEmail);
  }, [presetEmail]);

  useEffect(() => {
    // Auto-detect mode register dari localStorage
    // (RegisterPage menyetel pending2faEmail + pending2faAt)
    const pendingEmail = localStorage.getItem("pending2faEmail") || "";
    const pendingAt = Number(localStorage.getItem("pending2faAt") || 0);
    const ageMs = Date.now() - pendingAt;
    const pendingValid = pendingEmail && pendingEmail === (presetEmail || email) && ageMs >= 0 && ageMs <= 30 * 60 * 1000; // 30 menit

    if (!location.state?.from) {
      setFrom(pendingValid ? "register" : "check");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resend = async () => {
    if (!email) {
      setError("Email wajib diisi");
      return;
    }
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
      setInfo(res?.remark || "Email verifikasi berhasil dikirim. Cek inbox/spam.");
    } catch (e) {
      setError(e?.message || "Gagal kirim email verifikasi");
    } finally {
      setResending(false);
    }
  };

  const checkStatus = async (e) => {
    e?.preventDefault?.();
    if (!email) {
      setError("Email wajib diisi");
      return;
    }

    setError("");
    setInfo("");
    setVerified(false);
    setPassVerified(false);
    setLoading(true);
    try {
      const res = await checkEmailVerifiedEma0400(email);
      if (res?.status === "00") {
        setVerified(true);
        setInfo(res?.remark || "Email sudah terverifikasi");
        return;
      }
      setError(res?.remark || "Email belum terverifikasi. Silakan cek email dan klik link verifikasi.");
    } catch (e2) {
      setError(e2?.message || "Gagal cek status verifikasi email");
    } finally {
      setLoading(false);
    }
  };

  const verifyPassword = async () => {
    if (!email) {
      setError("Email wajib diisi");
      return;
    }
    if (!password) {
      setError("Password wajib diisi");
      return;
    }
    setError("");
    setInfo("");
    setPassLoading(true);
    try {
      const res = await verifyPasswordAdm0400(email, password);
      if (res?.status === "00") {
        setPassVerified(true);
        setInfo("Password terverifikasi. Kamu bisa lanjut generate 2FA.");
        // token sederhana di sisi frontend (TTL singkat) untuk membuka akses /generate-2fa
        localStorage.setItem("allowGenerate2faEmail", email);
        localStorage.setItem("allowGenerate2faAt", String(Date.now()));
        return;
      }
      setPassVerified(false);
      setError(res?.remark || "Password salah");
    } catch (e) {
      setError(e?.message || "Gagal verifikasi password");
    } finally {
      setPassLoading(false);
    }
  };

  const subtitle =
    from === "register"
      ? "Klik link verifikasi dari email, lalu cek status. Demi keamanan, verifikasi password dulu sebelum generate 2FA."
      : "Klik link verifikasi dari email, lalu cek status. Setelah itu kamu bisa kembali login.";

  return (
    <AuthLayout title="Cek Verifikasi Email" subtitle={subtitle}>
      <form className="auth-form" onSubmit={checkStatus}>
        <div className="form-field">
          <label className="form-label">Email</label>
          <div className="input-box">
            <input
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="auth-error">{error}</p>}
        {info && <p className="auth-success">{info}</p>}

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Mengecek..." : "Sudah Verifikasi"}
        </button>

        {verified && from === "register" ? (
          <>
            <div className="form-field" style={{ marginTop: 10 }}>
              <label className="form-label">Konfirmasi Password</label>
              <div className="input-box">
                <input
                  type="password"
                  placeholder="Masukkan password akun"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              className="secondary-button"
              type="button"
              onClick={verifyPassword}
              disabled={passLoading}
            >
              {passLoading ? "Memverifikasi..." : "Verifikasi Password"}
            </button>

            <button
              className="primary-button"
              type="button"
              onClick={() => navigate(nextPath, { state: { email } })}
              disabled={!passVerified}
            >
              Lanjut Generate 2FA
            </button>
          </>
        ) : null}

        {verified && from !== "register" ? (
          <button
            className="secondary-button"
            type="button"
            onClick={() => navigate("/login")}
          >
            Kembali ke Login
          </button>
        ) : null}

        <button
          className="secondary-button"
          type="button"
          onClick={resend}
          disabled={resending}
        >
          {resending ? "Mengirim ulang..." : "Kirim ulang email verifikasi"}
        </button>

        <p className="auth-switch">
          Kembali ke <Link to="/login">Login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
