// src/pages/Generate2FAPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout.jsx";
import { generate2faQrAdm0200 } from "../api/adminClient.js";

export default function Generate2FAPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const presetEmail = location.state?.email || "";
  const [email] = useState(presetEmail);
  const [qrBase64, setQrBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // Dev-only note:
  // React StrictMode (development) will intentionally mount components twice.
  // Without a guard, the auto-generate effect below can fire twice and double-hit the API.
  const didAutoGenerateRef = useRef(false);

  const canAccess = useMemo(() => {
    const allowEmail = localStorage.getItem("allowGenerate2faEmail") || "";
    const allowAt = Number(localStorage.getItem("allowGenerate2faAt") || 0);
    const ageMs = Date.now() - allowAt;
    const allowValid = allowEmail && allowEmail === presetEmail && ageMs >= 0 && ageMs <= 15 * 60 * 1000; // 15 menit
    return Boolean(presetEmail && allowValid);
  }, [presetEmail]);

  const qrSrc = useMemo(() => {
    if (!qrBase64) return null;
    return qrBase64.startsWith("data:image")
      ? qrBase64
      : `data:image/png;base64,${qrBase64}`;
  }, [qrBase64]);

  const generate = async (e) => {
    e?.preventDefault?.();
    if (!canAccess) return;

    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await generate2faQrAdm0200(email);
      if (res?.status !== "00" || !res?.qrBase64) {
        setError(res?.remark || "Gagal generate QR");
        return;
      }
      setQrBase64(res.qrBase64);
      setInfo(res?.remark || "Success Generate QR");
    } catch (e2) {
      setError(e2?.message || "Gagal generate QR");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canAccess) return;
    if (didAutoGenerateRef.current) return;
    didAutoGenerateRef.current = true;
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAccess]);

  if (!presetEmail || !canAccess) {
    return (
      <AuthLayout
        title="Generate 2FA"
        subtitle="Akses halaman ini harus melalui verifikasi email + verifikasi password."
      >
        <div className="auth-form">
          <p className="auth-error">
            Akses tidak valid. Silakan kembali ke proses verifikasi email terlebih dulu.
          </p>

          <p className="auth-switch">
            <Link to="/verify-email">Ke halaman verifikasi email</Link>
          </p>
          <p className="auth-switch">
            Atau kembali ke <Link to="/login">Login</Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  if (qrSrc) {
    return (
      <AuthLayout
        title="Generate 2FA"
        subtitle="Scan QR Code ini menggunakan Google Authenticator."
      >
        {info && <p className="auth-success">{info}</p>}
        {error && <p className="auth-error">{error}</p>}

        <div className="ga-activation">
          <div className="ga-activation__qrWrap">
            <img className="ga-activation__qr" src={qrSrc} alt="QR 2FA" />
          </div>

          <div className="ga-activation__hint">
            <p className="ga-activation__hintTitle">Cara aktivasi:</p>
            <ol className="ga-activation__steps">
              <li>Buka aplikasi Google Authenticator.</li>
              <li>Pilih <b>Tambah</b> → <b>Scan QR code</b>.</li>
              <li>Scan QR di atas sampai akun muncul.</li>
            </ol>

            {email ? (
              <p className="ga-activation__meta">
                Akun: <b>{email}</b>
              </p>
            ) : null}
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={() => navigate("/login")}
          >
            Saya sudah scan, lanjut ke Login
          </button>

          <p className="auth-switch">
            Belum terverifikasi? <Link to="/verify-email" state={{ email, from: "register" }}>Cek verifikasi email</Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Generate 2FA" subtitle={`Memproses QR 2FA untuk: ${presetEmail}`}> 
      <div className="auth-form">
        {error && <p className="auth-error">{error}</p>}
        {info && <p className="auth-success">{info}</p>}
        <button className="primary-button" type="button" disabled>
          {loading ? "Memproses..." : "Memproses..."}
        </button>
        <p className="auth-switch">
          Kembali ke <Link to="/verify-email" state={{ email: presetEmail }}>verifikasi email</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
