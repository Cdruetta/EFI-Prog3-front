import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { useNavigate } from "react-router-dom";
import "../../../styles/pages/home/About.css";

export default function About() {
    const navigate = useNavigate();

    return(
        <div className="about-container">
            <Card className="about-card">
                <h2 className="about-title">Sobre nosotros</h2>
                <p className="about-description">
                    Somos una empresa dedicada al <strong>alquiler de autos</strong> con foco en la
                    calidad del servicio, precios transparentes y una experiencia simple de principio a fin.
                </p>

                <Divider style={{ margin: "0.5rem 0" }} />

                <div className="about-features-grid">
                    <Card className="about-feature-card">
                        <div className="about-feature-content">
                            <i className="pi pi-car about-feature-icon" />
                            <div>
                                <h3 className="about-feature-title">Flota moderna</h3>
                                <p className="about-feature-text">Vehículos nuevos y mantenidos.</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="about-feature-card">
                        <div className="about-feature-content">
                            <i className="pi pi-shield about-feature-icon" />
                            <div>
                                <h3 className="about-feature-title">Seguro incluido</h3>
                                <p className="about-feature-text">Coberturas claras y confiables.</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="about-feature-card">
                        <div className="about-feature-content">
                            <i className="pi pi-map-marker about-feature-icon" />
                            <div>
                                <h3 className="about-feature-title">Entrega flexible</h3>
                                <p className="about-feature-text">Retiro y devolución prácticos.</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <Divider style={{ margin: "0.5rem 0" }} />

                <div className="about-stats-grid">
                    <div className="about-stat-item">
                        <h2 className="about-stat-number">+1000</h2>
                        <span className="about-stat-label">Viajes completados</span>
                    </div>
                    <div className="about-stat-item">
                        <h2 className="about-stat-number">4.8/5</h2>
                        <span className="about-stat-label">Satisfacción clientes</span>
                    </div>
                    <div className="about-stat-item">
                        <h2 className="about-stat-number">24/7</h2>
                        <span className="about-stat-label">Soporte</span>
                    </div>
                </div>

                <Divider style={{ margin: "0.5rem 0" }} />

                <div className="about-buttons-container">
                    <Button 
                        label="Ver nuestra flota" 
                        icon="pi pi-list" 
                        className="p-button-primary" 
                        onClick={() => navigate('/')}
                        style={{ padding: "0.6rem" }}
                    />
                </div>
                <div className="about-buttons-container">
                    <Button 
                        label="Contáctanos" 
                        icon="pi pi-send" 
                        className="p-button-outlined" 
                        onClick={() => navigate('/about')}
                        style={{ padding: "0.6rem" }}
                    />
                </div>
                <div className="about-button-back">
                    <Button 
                        label="Volver" 
                        icon="pi pi-arrow-left" 
                        className="p-button-text p-button-sm" 
                        onClick={() => navigate(-1)}
                        style={{ fontSize: "0.9rem" }}
                    />
                </div>
            </Card>
        </div>
    );
}