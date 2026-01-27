// src/pages/Generate2FAPage.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout.jsx";
import { generate2faQrAdm0200 } from "../api/adminClient.js";

/**
 * DEV StrictMode will mount -> unmount -> mount (double effect).
 * To avoid double HTTP call, we dedupe request per email using module-scope cache.
 */
const _gen2faInflight = new Map(); // email -> Promise<res>

/**
 * Dedupe ADM0200 call per email within a short window.
 * - If first mount triggers request, second mount will await same promise (no 2nd network call).
 * - Cache auto-clears after a few seconds so it won't "stick" forever.
 */
function generate2faOnce(email) {
  if (!email) return Promise.reject(new Error("Email kosong"));

  const existing = _gen2faInflight.get(email);
  if (existing) return existing;

  const p = (async () => {
    const res = await generate2faQrAdm0200(email);
    if (res?.status !== "00" || !res?.qrBase64) {
      throw new Error(res?.remark || "Gagal generate QR");
    }
    return res;
  })();

  _gen2faInflight.set(email, p);

  // clear after a short window (enough for StrictMode remount)
  p.finally(() => {
    setTimeout(() => _gen2faInflight.delete(email), 5000);
  });

  return p;
}

export default function Generate2FAPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const presetEmail = location.state?.email || "";
  const [email] = useState(presetEmail);
  const [qrBase64, setQrBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const canAccess = useMemo(() => {
    const allowEmail = localStorage.getItem("allowGenerate2faEmail") || "";
    const allowAt = Number(localStorage.getItem("allowGenerate2faAt") || 0);
    const ageMs = Date.now() - allowAt;
    const allowValid =
      allowEmail &&
      allowEmail === presetEmail &&
      ageMs >= 0 &&
      ageMs <= 15 * 60 * 1000; // 15 menit
    return Boolean(presetEmail && allowValid);
  }, [presetEmail]);

  const qrSrc = useMemo(() => {
    if (!qrBase64) return null;
    return qrBase64.startsWith("data:image")
      ? qrBase64
      : `data:image/png;base64,${qrBase64}`;
  }, [qrBase64]);

  useEffect(() => {
    if (!canAccess) return;

    let alive = true;

    (async () => {
      setError("");
      setInfo("");
      setLoading(true);

      try {
        const res = await generate2faOnce(email);
        if (!alive) return;

        setQrBase64(res.qrBase64);
        setInfo(res?.remark || "Success Generate QR");
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Gagal generate QR");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [canAccess, email]);

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
              <li>
                Pilih <b>Tambah</b> → <b>Scan QR code</b>.
              </li>
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
            Belum terverifikasi?{" "}
            <Link to="/verify-email" state={{ email, from: "register" }}>
              Cek verifikasi email
            </Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Generate 2FA"
      subtitle={`Memproses QR 2FA untuk: ${presetEmail}`}
    >
      <div className="auth-form">
        {error && <p className="auth-error">{error}</p>}
        {info && <p className="auth-success">{info}</p>}
        <button className="primary-button" type="button" disabled>
          {loading ? "Memproses..." : "Memproses..."}
        </button>
        <p className="auth-switch">
          Kembali ke{" "}
          <Link to="/verify-email" state={{ email: presetEmail }}>
            verifikasi email
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
