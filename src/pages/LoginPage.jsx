// src/pages/LoginPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout.jsx";
import { loginTkd0200 } from "../api/tikusClient.js";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // STEP LOGIN: credentials -> otp
  const [step, setStep] = useState("CRED"); // "CRED" | "OTP"
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Biar gak ada "kebawa login lama"
      localStorage.removeItem("authEmail");

      // ======================
      // STEP 1: EMAIL + PASSWORD
      // ======================
      if (step === "CRED") {
        const result = await loginTkd0200({ email, password });

        // Kalau backend mengirim status selain "00" = gagal
        if (result?.status && result.status !== "00") {
          setError(result?.remark || "Login gagal");
          return;
        }

        // WAJIB OTP: apapun response sukses (mau echo, mau status 00) -> lanjut OTP
        setOtp("");
        setStep("OTP");
        return;
      }

      // ======================
      // STEP 2: VERIFY OTP
      // ======================
      const result = await loginTkd0200({
        email,
        password,
        otp,
        verifyOtp: true,
      });

      if (result?.status === "00") {
        localStorage.setItem("authEmail", email);
        navigate("/dashboard");
      } else {
        setError(result?.remark || "OTP tidak valid / verifikasi gagal");
        localStorage.removeItem("authEmail");
      }
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
                  // digits only, max 6
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(v);
                }}
              />
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="primary-button" type="submit" disabled={loading || otp.length < 6}>
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
            Salah email/password? <Link to="/login" onClick={() => setStep("CRED")}>Ulang login</Link>
          </p>
        </form>
      </AuthLayout>
    );
  }

    if (step === "OTP") {
  return (
    <AuthLayout title="Verifikasi OTP" subtitle="Masukkan kode 6 digit dari Google Authenticator">
      <form className="auth-form" onSubmit={handleSubmit}>
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
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </div>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button className="primary-button" type="submit" disabled={loading || otp.length < 6}>
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
      </form>
    </AuthLayout>
  );
  }


  // UI Step 1: Email + Password (existing, cuma sedikit adapt)
  return (
    <AuthLayout title="Welcome back 👋" subtitle="Welcome To Tikus Management">
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
          Forget Password ? <Link to="/forgot-password">Reset Password</Link>
        </p>

        <p className="auth-switch">
          Don't Have Account ? <Link to="/register">Register</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
