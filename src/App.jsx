import { Routes, Route } from "react-router-dom";
import { Fragment } from "react";

import PrivateRoute from "./utils/PrivateRoute";
import Layout from "./components/Layout";

import { UserProvider } from "./contexts/UserContext";
import { ClientProvider } from "./contexts/ClientContext";
import { CarsProvider } from "./contexts/CarsContext";
import { RentalsProvider } from "./contexts/RentalsContext";

import AuthRoutes from "./pages/auth";
import UserRoutes from "./pages/user";
import HomeRoutes from "./pages/home"; 
import ClientRoutes from "./pages/client";
import VehicleRoutes from "./pages/vehicles";
import RentalRoutes from "./pages/rental";

function App() {
    return (
        <Fragment>
            <Routes>
                {/* Rutas de autenticación sin Layout (sin Navbar ni Footer) */}
                <Route 
                    path="/auth/*" 
                    element={<AuthRoutes />} 
                />
                {/* Rutas con Layout (con Navbar y Footer) */}
                <Route
                    path="/user/*"
                    element={           
                        <Layout>
                            <UserProvider>
                                <UserRoutes />
                            </UserProvider>
                        </Layout>
                    }
                />
                {/* Todas las rutas de clientes (públicas y privadas) */}
                <Route
                    path="/client/*"
                    element={
                        <Layout>
                            <ClientProvider>
                                <ClientRoutes />
                            </ClientProvider>
                        </Layout>
                    }
                />
                {/* Rutas públicas de vehículos (flota) */}
                <Route
                    path="/vehicles/*"
                    element={
                        <Layout>
                            <CarsProvider>
                                <VehicleRoutes />
                            </CarsProvider>
                        </Layout>
                    }
                />
                {/* Rutas públicas de alquileres */}
                <Route
                    path="/rental/*"
                    element={
                        <Layout>
                            <ClientProvider>
                                <CarsProvider>
                                    <RentalsProvider>
                                        <RentalRoutes />
                                    </RentalsProvider>
                                </CarsProvider>
                            </ClientProvider>
                        </Layout>
                    }
                />
                <Route 
                    path="/*" 
                    element={
                        <Layout>
                            <HomeRoutes />
                        </Layout>
                    } 
                />
            </Routes>
        </Fragment>
    );
}

export default App;