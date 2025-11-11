import { Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./LoginForm";

const AuthRoutes = () => {
    return (
        <Routes>
            <Route path="login" element={<LoginForm />} />
            <Route path="" element={<Navigate to="login" replace />} />
        </Routes>
    );
};
export default AuthRoutes;
