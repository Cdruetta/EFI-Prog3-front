import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { AUTH_TYPE } from "../constants/authType";

const PrivateRoute = ({ children, roles = [] }) => {
    const { user, status, loading } = useContext(AuthContext);
    const location = useLocation();

    const LOGIN_PATH = "/auth/login";

    // Mientras valida sesión
    if (loading || status === AUTH_TYPE.LOADING) {
        return null; // Podés reemplazar con <GlobalLoader />
    }

    // Usuario autenticado
    if (status === AUTH_TYPE.AUTH && user) {
        // Si hay roles requeridos, validar
        if (roles.length && !roles.includes(user.rol)) {
            // No tiene permiso -> lo mandamos al inicio
            return <Navigate to="/" replace />;
        }
        return children;
    }

    // No autenticado → redirigir al login
    return (
        <Navigate
            to={LOGIN_PATH}
            replace
            state={{ from: location.pathname + location.search }}
        />
    );
};

export default PrivateRoute;
