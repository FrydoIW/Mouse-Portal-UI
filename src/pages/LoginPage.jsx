import { Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";

function LoginPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
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
            <input type="email" placeholder="you@example.com" required />
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">Password</label>
          <div className="input-box">
            <input type="password" placeholder="••••••••" required />
          </div>
        </div>

        <button className="primary-button" type="submit">
          Masuk
        </button>

        <p className="auth-switch">
          Belum punya akun? <Link to="/register">Daftar dulu</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
