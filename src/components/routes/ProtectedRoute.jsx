import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useContext(AuthContext);
  const token = localStorage.getItem("jwt_token");

  // Tunggu pengecekan sesi selesai
  if (loading) {
    return <div>Loading...</div>;
  }

  // Jika token tidak ada di localStorage, lempar langsung ke login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Jika token ada tapi state user masih proses dimuat dari context
  if (!user) {
    return <div>Loading...</div>;
  }

  // Jika ada pembatasan role dan role user tidak sesuai
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <h2>403 - Akses Ditolak</h2>;
  }

  return children ? children : <Outlet />;
}