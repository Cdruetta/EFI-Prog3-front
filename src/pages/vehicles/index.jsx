import { Routes, Route } from "react-router-dom";
import { RequireRole } from "../../utils/RequireRole";
import VehicleList from "./VehicleList";
import VehicleDetail from "./VehicleDetail";
import VehicleRegisterForm from "./VehicleRegisterForm";

const VehicleRoutes = () => {
    return (
        <Routes>
            <Route index element={<VehicleList />} />
            <Route 
                path="register" 
                element={
                    <RequireRole roles={["admin"]}>
                        <VehicleRegisterForm />
                    </RequireRole>
                } 
            />
            <Route 
                path="edit/:id" 
                element={
                    <RequireRole roles={["admin"]}>
                        <VehicleRegisterForm />
                    </RequireRole>
                } 
            />
            <Route path=":id" element={<VehicleDetail />} />
        </Routes>
    );
};

export default VehicleRoutes;

