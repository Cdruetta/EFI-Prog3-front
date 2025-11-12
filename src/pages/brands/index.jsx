import { Routes, Route } from "react-router-dom";
import BrandList from "./BrandList";
import BrandRegisterForm from "./BrandRegisterForm";

const BrandRoutes = () => {
    return (
        <Routes>
            <Route
                path="list"
                element={<BrandList />}
            />
            <Route
                path="register"
                element={<BrandRegisterForm />}
            />
            <Route
                path="edit/:id"
                element={<BrandRegisterForm />}
            />
        </Routes>
    );
};

export default BrandRoutes;

