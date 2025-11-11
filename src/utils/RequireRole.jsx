import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext"; // ojo la ruta

/**
 * Protege rutas por rol.
 * - Si no hay sesión -> redirige a /inicio-sesion guardando "from"
 * - Si hay sesión pero no tiene rol requerido -> redirige a /
 */
export function RequireRole({ roles = [], children }) {
  const { user, loading } = useContext(AuthContext); 
  const location = useLocation();

  const LOGIN_PATH = "/auth/login";

  if (loading) return null; // o un spinner

  if (!user) {
    return (
      <Navigate
        to= {LOGIN_PATH}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  if (roles.length && !roles.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
