import ThemeToggle from "../components/ThemeToggle";

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-panel__header">
          <div>
            <p className="auth-brand">Login Page.</p>
            <h1>{title}</h1>
            <p className="auth-subtitle">{subtitle}</p>
          </div>
          <ThemeToggle />
        </div>

        <div className="auth-panel__body">{children}</div>
      </div>
    </div>
  );
}

export default AuthLayout;
