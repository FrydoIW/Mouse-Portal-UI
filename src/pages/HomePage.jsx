// src/pages/HomePage.jsx
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();
  const email = localStorage.getItem("authEmail");

  const handleLogout = () => {
    localStorage.removeItem("authEmail");
    navigate("/login");
  };

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Home Page</h1>
      <p>
        Login sukses. Selamat datang di homepage
        {email ? `, ${email}` : ""} 🎉
      </p>

      <button
        style={{
          marginTop: "1.5rem",
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
        }}
        onClick={handleLogout}
      >
        Logout
      </button>
    </main>
  );
}

export default HomePage;
