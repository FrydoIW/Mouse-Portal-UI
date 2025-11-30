// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  // cek "status login" sederhana dari localStorage
  const isLoggedIn = !!localStorage.getItem("authEmail");
  const location = useLocation();

  if (!isLoggedIn) {
    // kalau belum login, lempar ke /login
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }} // optional, kalau nanti mau dipakai
      />
    );
  }

  // kalau sudah login, render kontennya
  return children;
}

export default ProtectedRoute;
