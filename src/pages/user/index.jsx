import { Routes, Route } from "react-router-dom";
import { RequireRole } from "../../utils/RequireRole";
import UserRegisterForm from "./UserRegisterForm";
import UserList from "./UserList";

const UserRoutes = () => {
    return (
        <Routes>
            <Route
                path="register"
                element={
                    <RequireRole roles={["admin"]}>
                        <UserRegisterForm />
                    </RequireRole>
                }
            />
            <Route
                path="edit/:id"
                element={
                    <RequireRole roles={["admin"]}>
                        <UserRegisterForm />
                    </RequireRole>
                }
            />
            <Route
                path="list"
                element={
                    <RequireRole roles={["admin", "empleado"]}>
                        <UserList />
                    </RequireRole>
                }
            />
        </Routes>
    );
};
export default UserRoutes;
