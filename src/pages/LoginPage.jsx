// src/pages/LoginPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout.jsx";
import { verify2faAdm0700, verifyPasswordAdm0400 } from "../api/adminClient.js";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [step, setStep] = useState("CRED"); // "CRED" | "OTP"
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      localStorage.removeItem("authEmail");

      // ======================
      // STEP 1: VERIFY PASSWORD (adm0400)
      // ======================
      if (step === "CRED") {
        const res = await verifyPasswordAdm0400(email, password);

        if (res?.status === "00") {
          setOtp("");
          setStep("OTP");
          return;
        }

        setError(res?.remark || "Email atau password salah");
        return;
      }

      // ======================
      // STEP 2: VERIFY OTP (adm0700)
      // ======================
      const res = await verify2faAdm0700(email, otp);
      if (res?.status === "00") {
        localStorage.setItem("authEmail", email);
        navigate("/dashboard");
        return;
      }

      setError(res?.remark || "OTP tidak valid");
      localStorage.removeItem("authEmail");
    } catch (err) {
      setError(err?.message || "Terjadi kesalahan saat login");
      localStorage.removeItem("authEmail");
    } finally {
      setLoading(false);
    }
  };

  // UI Step 2: OTP
  if (step === "OTP") {
    return (
      <AuthLayout
        title="Verifikasi OTP"
        subtitle="Masukkan kode 6 digit dari Google Authenticator"
      >
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="otp-hint">
            <p className="otp-hint__title">Akun</p>
            <p className="otp-hint__value">{email}</p>
            <p className="otp-hint__desc">
              Buka Google Authenticator, lalu masukkan kode yang sedang aktif.
            </p>
          </div>

          <div className="form-field">
            <label className="form-label">OTP</label>
            <div className="input-box">
              <input
                className="otp-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                required
                value={otp}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(v);
                }}
              />
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button
            className="primary-button"
            type="submit"
            disabled={loading || otp.length < 6}
          >
            {loading ? "Memproses..." : "Verifikasi & Masuk"}
          </button>

          <button
            className="secondary-button"
            type="button"
            disabled={loading}
            onClick={() => {
              setError("");
              setOtp("");
              setStep("CRED");
            }}
          >
            Kembali
          </button>

          <p className="auth-switch">
            Belum punya 2FA?{" "}
            <Link to="/forgot-password">Reset password & 2FA</Link>
          </p>
        </form>
      </AuthLayout>
    );
  }

  // UI Step 1: Email + Password
  return (
    <AuthLayout title="Welcome back 👋" subtitle="Login Admin + 2FA">
      <form className="auth-form" onSubmit={handleSubmit}>
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

        <div className="form-field">
          <label className="form-label">Password</label>
          <div className="input-box">
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Memproses..." : "Masuk"}
        </button>

        <p className="auth-switch">
          Lupa password? <Link to="/forgot-password">Reset Password</Link>
        </p>

        <p className="auth-switch">
          Baru selesai verifikasi email?{" "}
          <Link to="/verify-email" state={{ email }}>
            Sudah Verifikasi
          </Link>
        </p>

        <p className="auth-switch">
          Belum punya akun? <Link to="/register">Register</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
