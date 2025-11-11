import { useMemo, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";
import { AuthContext } from "../contexts/AuthContext.jsx";

const routes = {
    home: "/",
    client: "/client/list",
    user: "/user/list",
    vehicles: "/vehicles",
    rental: "/rental",
    about: "/about",
    login: "/auth/login",
};

export default function AppNavbar() {
    const { user, signOut } = useContext(AuthContext);
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const isActive = (to) => {
        if (!to) return false;
        if (pathname === to) return true;
        // Para rutas como /rental, también debe coincidir con /rental/create
        if (pathname.startsWith(to + "/")) return true;
        return false;
    };

    function getEmail(u) {
        return u?.email ?? u?.correo ?? "";
    }

    function getDisplayName(u) {
        const email = getEmail(u);
        return u?.nombre ?? u?.name ?? (email ? email.split("@")[0] : "Usuario");
    }

    function getInitial(u) {
        const name = getDisplayName(u);
        return name?.trim()?.charAt(0)?.toUpperCase() || "?";
    }

    const menuItems = useMemo(
        () => {
            const allItems = [
                { label: "Home", icon: "pi pi-home", command: () => navigate(routes.home), className: isActive(routes.home) ? "p-highlight" : "" },
                { label: "Clientes", icon: "pi pi-users", command: () => navigate(routes.client), className: isActive(routes.client) ? "p-highlight" : "" },
                { label: "Usuarios", icon: "pi pi-user", command: () => navigate(routes.user), className: isActive(routes.user) ? "p-highlight" : "" },
                { label: "Vehículos", icon: "pi pi-car", command: () => navigate(routes.vehicles), className: isActive(routes.vehicles) ? "p-highlight" : "" },
                
            ];

            // Si no está logueado, solo mostrar: Home, Vehículos, Sobre nosotros
            if (!user) {
                return allItems.filter(item => 
                    item.label === "Home" || 
                    item.label === "Vehículos" || 
                    item.label === "Sobre nosotros"
                );
            }

            // Si está logueado, mostrar todos los elementos
            return allItems;
        },
        [pathname, user, navigate]
    );

    const end = (
        <div 
            className="flex align-items-center gap-3"
            style={{ 
                marginLeft: "auto",
                paddingRight: "1rem"
            }}
        >
            {user ? (
                <Button
                    label="Salir"
                    icon="pi pi-sign-out"
                    className="p-button-text"
                    style={{ color: "#FCA5A5" }}
                    onClick={async () => {
                        try {
                            await signOut();
                        } finally {
                            navigate(routes.home);
                        }
                    }}
                />
            ) : (
                <Button
                    label="Iniciar Sesión"
                    icon="pi pi-sign-in"
                    className="p-button-primary p-button-sm"
                    style={{
                        backgroundColor: "#FF6B35",
                        border: "none",
                        fontSize: "0.875rem",
                        padding: "0.5rem 1rem"
                    }}
                    onClick={() => navigate(routes.login)}
                />
            )}
        </div>
    );


    return (
        <div 
            className="hidden lg:flex"
            style={{
                background: "linear-gradient(135deg, #0D3B66 0%, #1E5A8A 100%)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                position: "sticky",
                top: 0,
                zIndex: 1000,
                width: "100%"
            }}
        >
            <style>
                {`
                    .p-menubar {
                        background: transparent !important;
                        border: none !important;
                        border-radius: 0 !important;
                        padding: 0.75rem 1.5rem !important;
                        width: 100% !important;
                        display: flex !important;
                        justify-content: space-between !important;
                        align-items: center !important;
                    }
                    .p-menubar .p-menubar-root-list {
                        flex: 1 !important;
                    }
                    .p-menubar .p-menubar-end {
                        margin-left: auto !important;
                        display: flex !important;
                        align-items: center !important;
                    }
                    .p-menubar .p-menubar-root-list > .p-menubar-item > .p-menubar-link {
                        color: #E0E7FF !important;
                        padding: 0.75rem 1rem !important;
                        border-radius: 8px !important;
                        transition: all 0.3s ease !important;
                    }
                    .p-menubar .p-menubar-root-list > .p-menubar-item > .p-menubar-link:hover {
                        background-color: rgba(255, 255, 255, 0.1) !important;
                        color: #60A5FA !important;
                    }
                    .p-menubar .p-menubar-root-list > .p-menubar-item > .p-menubar-link.p-highlight {
                        background-color: rgba(96, 165, 250, 0.2) !important;
                        color: #60A5FA !important;
                        font-weight: 600 !important;
                    }
                    .p-menubar .p-menubar-root-list > .p-menubar-item > .p-menubar-link .p-menubar-icon {
                        color: inherit !important;
                    }
                `}
            </style>
            <Menubar model={menuItems} end={end} />
        </div>
    );
}
