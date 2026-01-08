// src/pages/ForgotPasswordPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout.jsx";
import { sendVerificationEmailEma0100 } from "../api/adminClient.js";

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
      const result = await sendVerificationEmailEma0100(email);

      const ok = result?.status === "00" || result?.status === "09";
      if (!ok) {
        setError(result?.remark || "Gagal mengirim email verifikasi");
        return;
      }

      setInfo(result?.remark || "Email verifikasi terkirim. Silakan cek inbox/spam.");

      // lanjut ke halaman reset (di sana ada tombol 'Sudah Verifikasi' + input password baru)
      navigate("/reset-password", {
        state: { email },
      });
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat kirim email verifikasi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Lupa Password 🔐"
      subtitle="Masukkan email yang terdaftar. Kami akan kirim email verifikasi."
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
          {loading ? "Mengirim..." : "Kirim Email Verifikasi"}
        </button>

        <p className="auth-switch">
          Kembali ke <Link to="/login">halaman login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
