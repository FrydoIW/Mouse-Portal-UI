// src/pages/ResetPasswordPage.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout.jsx";
import { resetTkd0300 } from "../api/tikusClient.js";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (newPassword !== confirm) {
      setError("Password dan konfirmasi tidak sama");
      return;
    }

    if (!newPassword) {
      setError("Password baru tidak boleh kosong");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: email,
        procType: "CHANGE_PASS",
        newPassword: newPassword,
      };

      const result = await resetTkd0300(payload);

      if (result.status === "00") {
        setInfo(result.remark || "Berhasil ganti password");

        navigate("/login", { replace: true });
      } else {
        setError(result.remark || "Gagal ganti password");
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat ganti password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Buat Password Baru 🔑"
      subtitle={email ? `Untuk akun: ${email}` : "Memuat data email..."}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label">Password baru</label>
          <div className="input-box">
            <input
              type="password"
              placeholder="Password baru"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
            />
          </div>
        </div>

        {error && <p className="auth-error">{error}</p>}
        {info && <p className="auth-success">{info}</p>}

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Mengganti..." : "Simpan Password Baru"}
        </button>

        <p className="auth-switch">
          Kembali ke <Link to="/login">halaman login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default ResetPasswordPage;
