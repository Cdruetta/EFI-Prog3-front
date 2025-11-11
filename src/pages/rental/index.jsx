import { Routes, Route } from "react-router-dom";
import RentalForm from "./RentalForm";

const RentalRoutes = () => {
    return (
        <Routes>
            <Route path="create" element={<RentalForm />} />
        </Routes>
    );
};

export default RentalRoutes;

