import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { Loading } from "../components/atoms";
export default function ProtectedRoute({
  children,
  redirectTo = "/login",
  allowedRoles,
}) {
  const location = useLocation();
  const { user, isAuth, loading } = useAuth();

  if (loading) return <Loading />;

  if (!isAuth)
    return <Navigate to={redirectTo} replace state={{ from: location }} />;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="protected-route-denied">
        <h2>Acceso denegado</h2>
        <p>No tienes permisos para acceder a esta página.</p>
      </div>
    );
  }

  return children;
}
