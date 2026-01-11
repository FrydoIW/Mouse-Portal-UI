// src/pages/RegisterPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { registerAdminAdm0100, sendVerificationEmailEma0100 } from "../api/adminClient";

function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    address: "",
    gender: "",
    birthDt: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

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
      const payload = {
        name: form.name,
        address: form.address,
        birthDt: form.birthDt,
        gender: form.gender,
        email: form.email,
        password: form.password,
      };

      const res = await registerAdminAdm0100(payload);

      const ok = res?.status === "09" || res?.status === "00";
      if (!ok) {
        setError(res?.remark || "Gagal register");
        return;
      }

      try {
        await sendVerificationEmailEma0100(form.email);
      } catch (_) {
      }

      setSuccess(
        res?.remark ||
          "Registrasi berhasil. Email verifikasi sudah dikirim."
      );

 
      localStorage.setItem("pending2faEmail", form.email);
      localStorage.setItem("pending2faAt", String(Date.now()));
      localStorage.removeItem("allowGenerate2faEmail");
      localStorage.removeItem("allowGenerate2faAt");

      navigate("/verify-email", {
        state: { email: form.email, from: "register" },
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Register Admin"
      subtitle="Buat akun admin, lalu verifikasi email sebelum generate 2FA."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <p className="auth-error">{error}</p>}
        {success && <p className="auth-success">{success}</p>}

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
              <option value="Male">Laki-laki</option>
              <option value="Female">Perempuan</option>
            </select>
          </div>
        </div>

        {/* birthDt */}
        <div className="form-field">
          <label className="form-label">Tanggal lahir</label>
          <div className="input-box">
            <input
              type="date"
              name="birthDt"
              value={form.birthDt}
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

        {/* password */}
        <div className="form-field">
          <label className="form-label">Password</label>
          <div className="input-box">
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Memproses..." : "Register"}
        </button>

        <p className="auth-switch">
          Sudah punya akun? <Link to="/login">Log in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default RegisterPage;
