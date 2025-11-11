import { useEffect, useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { CarsContext } from "../../contexts/CarsContext";
import { useToast } from "../../contexts/ToastContext";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { brandsService } from "../../services/brands";

export default function VehicleDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { getCar } = useContext(CarsContext);
    const { showToast } = useToast();
    
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [brandName, setBrandName] = useState("");

    const canRent = user?.rol === "admin" || user?.rol === "empleado";

    useEffect(() => {
        let isMounted = true;

        const loadVehicle = async () => {
            if (!id) { setLoading(false); return; }
            try {
                setLoading(true);
                const { ok, data, message } = await getCar(Number(id));
                if (!ok || !data) {
                    showToast({ severity: "error", summary: "Error", detail: message || "No se pudo cargar el vehículo", life: 3000 });
                    setTimeout(() => navigate("/vehicles"), 1000);
                    return;
                }
                if (isMounted) setVehicle(data);

                let marcaId = data.marcaId || data.marca_id;
                if (!marcaId && data.marca && typeof data.marca === "object") marcaId = data.marca.id || data.marca.marcaId;

                if (marcaId) {
                    if (data.marca && typeof data.marca === "object") setBrandName(data.marca.nombre || data.marca.name || data.marca.marca || "");
                    else if (data.Brand && typeof data.Brand === "object") setBrandName(data.Brand.nombre || data.Brand.name || "");
                    else {
                        const res = await brandsService.get(marcaId);
                        if (res.status === 200) {
                            const brandData = res?.data?.data || res?.data;
                            setBrandName(brandData?.nombre || brandData?.name || "");
                        }
                    }
                }
            } catch (error) {
                showToast({ severity: "error", summary: "Error", detail: "Error al cargar el vehículo", life: 3000 });
                setTimeout(() => navigate("/vehicles"), 1000);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadVehicle();
        return () => { isMounted = false; };
    }, [id]);

    if (loading) return (
        <div className="container mx-auto p-4" style={{ maxWidth: "800px" }}>
            <Card>
                <div style={{ textAlign: "center", padding: "2rem" }}>
                    <i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem" }}></i>
                    <p style={{ marginTop: "1rem" }}>Cargando vehículo...</p>
                </div>
            </Card>
        </div>
    );

    if (!vehicle) return (
        <div className="container mx-auto p-4" style={{ maxWidth: "800px" }}>
            <Card>
                <p>Vehículo no encontrado</p>
                <Button label="Volver" icon="pi pi-arrow-left" className="p-button-text" onClick={() => navigate("/vehicles")} />
            </Card>
        </div>
    );

    const marca = brandName || vehicle.marca || vehicle.marca?.nombre || "Sin marca";
    const precio = vehicle.precio_dia || vehicle.precio_diario || 0;

    let vehicleImage = null;
    if (vehicle.imagen) {
        try {
            vehicleImage = require(`../../assets/vehiculos/${vehicle.imagen}`);
        } catch {
            vehicleImage = null;
        }
    }

    return (
        <div className="container mx-auto p-4" style={{ maxWidth: "800px" }}>
            <Card>
                <div className="grid">
                    <div className="col-12 md:col-6" style={{ paddingRight: vehicleImage ? "1rem" : "0" }}>
                        <p><strong>Marca:</strong> {marca}</p>
                        <p><strong>Modelo:</strong> {vehicle.modelo || "N/A"}</p>
                        {vehicle.anio && <p><strong>Año:</strong> {vehicle.anio}</p>}
                        <p><strong>Precio Diario:</strong> ${precio.toLocaleString()}</p>
                        <p><strong>Disponibilidad:</strong> 
                            <Tag value={vehicle.disponible ? "Disponible" : "No disponible"} severity={vehicle.disponible ? "success" : "danger"} />
                        </p>
                    </div>

                    {vehicleImage && (
                        <div className="col-12 md:col-6" style={{ textAlign: "center" }}>
                            <img src={vehicleImage} alt={vehicle.modelo} style={{ maxWidth: "100%", borderRadius: "8px" }} />
                        </div>
                    )}
                </div>

                <div style={{ marginTop: "2rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {vehicle.disponible && canRent && (
                        <Button label="Alquilar" icon="pi pi-calendar-plus" className="p-button-success" onClick={() => navigate(`/rental/create?carId=${vehicle.id}`)} />
                    )}
                    {user?.rol === "admin" && (
                        <Button label="Editar" icon="pi pi-pencil" className="p-button-primary" onClick={() => navigate(`/vehicles/edit/${vehicle.id}`)} />
                    )}
                    <Button label="Volver a la Lista" icon="pi pi-list" className="p-button-secondary" onClick={() => navigate("/vehicles")} />
                </div>
            </Card>
        </div>
    );
}
