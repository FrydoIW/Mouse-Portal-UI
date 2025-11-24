// src/pages/RegisterPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { registerTkd0100 } from "../api/tikusClient";

function RegisterPage() {
  // state form
  const [form, setForm] = useState({
    name: "",
    address: "",
    gender: "",
    birthDate: "",
    position: "",
    email: "",
    passwordCredential: "",
  });

  const navigate = useNavigate();

  // state untuk status request
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccess(null);

  try {
    await registerTkd0100(form);

    // kalau mau langsung pindah tanpa pesan:
    navigate("/login");

    // kalau mau kasih pesan dulu di halaman yang sama, bisa gini:
    // setSuccess("Registrasi berhasil 🎉");
    // setTimeout(() => navigate("/login"), 1200);
  } catch (err) {
    console.error(err);
    setError(err.message || "Gagal register");
  } finally {
    setLoading(false);
  }
};


  return (
    <AuthLayout
      title="Create new account"
      subtitle="Start for free, join our platform."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && (
          <p style={{ color: "#fca5a5", fontSize: "0.85rem" }}>{error}</p>
        )}
        {success && (
          <p style={{ color: "#4ade80", fontSize: "0.85rem" }}>{success}</p>
        )}

        {/* name */}
        <div className="form-field">
          <label className="form-label">Nama lengkap</label>
          <div className="input-box">
            <input
              type="text"
              name="name"
              placeholder="Nama lengkap"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* address */}
        <div className="form-field">
          <label className="form-label">Alamat</label>
          <div className="input-box">
            <input
              type="text"
              name="address"
              placeholder="Alamat lengkap"
              value={form.address}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* gender */}
        <div className="form-field">
          <label className="form-label">Jenis kelamin</label>
          <div className="input-box">
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
            >
              <option value="">Pilih gender</option>
              <option value="MALE">Laki-laki</option>
              <option value="FEMALE">Perempuan</option>
            </select>
          </div>
        </div>

        {/* birthDate */}
        <div className="form-field">
          <label className="form-label">Tanggal lahir</label>
          <div className="input-box">
            <input
              type="date"
              name="birthDate"
              value={form.birthDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* position */}
        <div className="form-field">
          <label className="form-label">Posisi / Jabatan</label>
          <div className="input-box">
            <input
              type="text"
              name="position"
              placeholder="Mis. Staff, Manager"
              value={form.position}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* email */}
        <div className="form-field">
          <label className="form-label">Email</label>
          <div className="input-box">
            <input
              type="email"
              name="email"
              placeholder="you@anywhere.co"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* passwordCredential */}
        <div className="form-field">
          <label className="form-label">Password</label>
          <div className="input-box">
            <input
              type="password"
              name="passwordCredential"
              placeholder="••••••••"
              value={form.passwordCredential}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Memproses..." : "Create account"}
        </button>

        <p className="auth-switch">
          Sudah punya akun? <Link to="/login">Log in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default RegisterPage;
