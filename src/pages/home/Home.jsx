import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { AUTH_TYPE } from "../../constants/authType";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import "../../../styles/pages/home/Home.css";

const infoCards = [
    {
        id: "c1",
        title: "Sobre Nosotros",
        text: "Descubrí quiénes somos y qué nos impulsa cada día..",
        img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
        to: "/about"
    },
    {
        id: "c2",
        title: "Nuestros vehículos",
        text: "Amplia flota con autos modernos, seguros y listos para tu próximo viaje.",
        img: "https://png.pngtree.com/thumb_back/fw800/background/20250809/pngtree-multiple-cars-parked-in-open-parking-area-image_17872602.webp",
        to: "/vehicles"
    },
    {
        id: "c3",
        title: "Por qué elegirnos",
        text: "Confianza, seguridad y un servicio pensado para tu comodidad.",
        img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop",
        to: "/about"
    }
];

export default function Home() {
    const { user, status, signOut } = useContext(AuthContext);
    const navigate = useNavigate();

    if (status === AUTH_TYPE.LOADING) {
        return <div>Cargando información...</div>;
    }

    const backgroundStyle = {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        flexDirection: "column",
        minHeight: "calc(100vh - 70px)",
        padding: "5rem 1rem 2rem 1rem",
        backgroundColor: "#0D3B66",
        backgroundImage: "url('https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1920&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        overflow: "hidden"
    };

    const overlayStyle = {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(13, 59, 102, 0.7)",
        zIndex: 1
    };

    const contentStyle = {
        position: "relative",
        zIndex: 2,
        width: "100%",
        maxWidth: "1200px"
    };

    const renderInfoCards = () => (
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem", marginTop: "2rem" }}>
            {infoCards.map(card => (
                <Card
                    key={card.id}
                    title={card.title}
                    subTitle={card.text}
                    className="info-card"
                    onClick={() => navigate(card.to)}
                    header={<img src={card.img} alt={card.title} />}
                />
            ))}
        </div>
    );

    // 🔹 Si no hay usuario
    if (!user) {
        return (
            <div style={backgroundStyle} className="home-container">
                <div style={overlayStyle}></div>
                <div style={contentStyle}>
                    {renderInfoCards()}
                </div>
            </div>
        );
    }

    // 🔹 Si hay usuario logueado
    return (
        <div style={backgroundStyle} className="home-container">
            <div style={overlayStyle}></div>
            <div style={contentStyle}>
                <Card className="home-auth-card home-no-hover">
                    <h2>Inicio</h2>
                    <h3>Hola: {user.nombre}</h3>
                    <p>{user.correo}</p>

                    <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                        {user?.rol === "admin" && (
                            <>
                                <Button label="Lista de Usuarios" icon="pi pi-users" className="p-button-secondary p-button-sm" onClick={() => navigate('/user/list')} />
                                <Button label="Registrar Usuario" icon="pi pi-user-plus" className="p-button-secondary p-button-sm" onClick={() => navigate('/user/register')} />
                            </>
                        )}
                        <Button label="Lista de Clientes" icon="pi pi-users" className="p-button-secondary p-button-sm" onClick={() => navigate('/client/list')} />
                        {user?.rol === "admin" && (
                            <Button label="Registrar Cliente" icon="pi pi-user-plus" className="p-button-secondary p-button-sm" onClick={() => navigate('/client/register')} />
                        )}
                    </div>

                    <div style={{ marginTop: "1rem", display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                        <Button label="Ver Flota" icon="pi pi-car" className="p-button-secondary p-button-sm" onClick={() => navigate('/vehicles')} />
                        <Button label="Ver Marcas" icon="pi pi-tag" className="p-button-secondary p-button-sm" onClick={() => navigate('/brands/list')} />
                        {user?.rol === "admin" && (
                            <Button label="Registrar Marca" icon="pi pi-plus" className="p-button-secondary p-button-sm" onClick={() => navigate('/brands/register')} />
                        )}
                        <Button label="Alquilar" icon="pi pi-calendar-plus" className="p-button-secondary p-button-sm" onClick={() => navigate('/rental/create')} />
                        <Button label="Cerrar sesión" icon="pi pi-sign-out" className="p-button-danger p-button-sm" onClick={() => signOut()} />
                    </div>

                    <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#ddd" }}>
                        Estás conectado como: {user.rol}
                    </p>
                </Card>

                {/* 🔹 Cards informativas */}
                {renderInfoCards()}
            </div>
        </div>
    );
}
