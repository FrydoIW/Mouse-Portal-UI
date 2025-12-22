// src/App.jsx
import "./App.css";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
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


    </Routes>
  );
}

export default App;
