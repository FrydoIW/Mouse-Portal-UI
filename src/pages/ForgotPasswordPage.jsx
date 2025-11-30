// src/pages/ForgotPasswordPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout.jsx";
import { resetTkd0300 } from "../api/tikusClient.js";

function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const payload = {
        email: email,
        procType: "VERIFY_EMAIL",
        newPassword: "",
      };

      const result = await resetTkd0300(payload);

      if (result.status === "00") {
        // Email benar → lanjut ke halaman ganti password
        setInfo(result.remark || "Email valid");
        navigate("/reset-password", {
          state: { email },
        });
      } else {
        setError(result.remark || "Email tidak ditemukan");
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat verifikasi email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Lupa Password 🔐"
      subtitle="Masukkan email yang terdaftar. Kami akan cek dulu."
    >
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

        {error && <p className="auth-error">{error}</p>}
        {info && <p className="auth-success">{info}</p>}

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Memeriksa..." : "Verifikasi Email"}
        </button>

        <p className="auth-switch">
          Kembali ke <Link to="/login">halaman login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
