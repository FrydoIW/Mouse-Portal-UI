// src/pages/LoginPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout.jsx";
import { loginTkd0200 } from "../api/tikusClient.js";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        email: email,
        password: password,
      };

      const result = await loginTkd0200(payload);

      if (result.status === "00") {
        // SIMPAN STATUS LOGIN SEDERHANA
        localStorage.setItem("authEmail", email);

        navigate("/home");
      } else {
        setError(result.remark || "Login gagal");
        // kalau gagal, pastikan tidak dianggap login
        localStorage.removeItem("authEmail");
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat login");
      localStorage.removeItem("authEmail");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back 👋"
      subtitle="Masuk dulu untuk lanjut ke dashboard."
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
          Lupa password? <Link to="/forgot-password">Reset di sini</Link>
        </p>

        <p className="auth-switch">
          Belum punya akun? <Link to="/register">Daftar dulu</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
