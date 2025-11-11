import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import About from "./About";
import UnAuth from "./Unauth";

const HomeRoutes = () => {
    return (
        <Routes>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="unauth" element={<UnAuth/>} />
        </Routes>
    );
};
export default HomeRoutes;