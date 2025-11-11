import { Routes, Route } from "react-router-dom";
import { RequireRole } from "../../utils/RequireRole";
import ClientRegisterForm from "./ClientRegisterForm";
import ClientList from "./ClientList";

const ClientRoutes = () => {
    return (
        <Routes>
            <Route
                path="register"
                element={
                    <RequireRole roles={["admin", "cliente"]}>
                        <ClientRegisterForm />
                    </RequireRole>
                }
            />
            <Route
                path="register-public"
                element={
                    <ClientRegisterForm />
                }
            />
            <Route
                path="edit/:id"
                element={
                    <RequireRole roles={["admin"]}>
                        <ClientRegisterForm />
                    </RequireRole>
                }
            />
            <Route
                path="list"
                element={
                    <ClientList />
                }
            />
        </Routes>
    );
};

export default ClientRoutes;
