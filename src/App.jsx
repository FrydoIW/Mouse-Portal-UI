// src/App.jsx
import "./App.css";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import VerifyEmailPage from "./pages/VerifyEmailPage.jsx";
import Generate2FAPage from "./pages/Generate2FAPage.jsx";
import ProfileAdminPage from "./pages/ProfileAdminPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import BankInfoPage from "./pages/BankInfoPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";


function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/generate-2fa" element={<Generate2FAPage />} />

      
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bank-info"
        element={
          <ProtectedRoute>
            <BankInfoPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileAdminPage />
          </ProtectedRoute>
        }
      />


    </Routes>
  );
}

export default App;
