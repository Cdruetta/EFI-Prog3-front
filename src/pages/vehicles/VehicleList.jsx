import { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { CarsContext } from "../../contexts/CarsContext";
import { useToast } from "../../contexts/ToastContext";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { brandsService } from "../../services/brands";
import "../../../styles/pages/vehicles/VehicleList.css";

export default function VehicleList() {
    const { user } = useContext(AuthContext);
    const { cars, fetchCars, deleteCar } = useContext(CarsContext);
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [brands, setBrands] = useState([]);
    const [brandsMap, setBrandsMap] = useState({});
    const canRent = user?.rol === "admin" || user?.rol === "empleado";
    const isAdmin = user?.rol === "admin";

    useEffect(() => {
        const loadBrands = async () => {
            try {
                const res = await brandsService.list();
                if (res.status === 200) {
                    const brandsData = res?.data?.data ?? res?.data ?? [];
                    const brandsArray = Array.isArray(brandsData) ? brandsData : [];
                    setBrands(brandsArray);
                    const map = {};
                    brandsArray.forEach(brand => {
                        const id = brand.id || brand.marcaId || brand.marca_id;
                        if (id) {
                            const nombre = brand.nombre || brand.name || brand.marca || `Marca ${id}`;
                            map[id] = nombre;
                            map[String(id)] = nombre;
                            map[Number(id)] = nombre; // También agregar como número
                        }
                    });
                    console.log("BrandsMap creado:", map);
                    setBrandsMap(map);
                }
            } catch {
                setBrands([]);
                setBrandsMap({});
            }
        };
        loadBrands();
    }, []);

    useEffect(() => {
        const loadCars = async () => {
            setLoading(true);
            const { ok, message } = await fetchCars();
            if (!ok) {
                showToast({ severity: "error", summary: "Error", detail: message });
            }
            setLoading(false);
        };
        loadCars();
    }, []);

    const marcaBodyTemplate = (rowData) => {
        // Debug: ver qué datos tiene el vehículo
        console.log("Datos del vehículo para marca:", {
            id: rowData.id,
            modelo: rowData.modelo,
            brandId: rowData.brandId,
            marcaId: rowData.marcaId,
            marca_id: rowData.marca_id,
            Brand: rowData.Brand,
            marca: rowData.marca,
            brandsMap: brandsMap
        });
        
        if (rowData.Brand && typeof rowData.Brand === 'object' && rowData.Brand !== null) {
            const nombre = rowData.Brand.nombre || rowData.Brand.name || rowData.Brand.marca;
            if (nombre) return nombre;
        }
        if (rowData.marca && typeof rowData.marca === 'object' && rowData.marca !== null) {
            const nombre = rowData.marca.nombre || rowData.marca.name || rowData.marca.marca;
            if (nombre) return nombre;
        }
        if (rowData.marca && typeof rowData.marca === 'string') return rowData.marca;
        // Buscar el ID de la marca en diferentes campos posibles
        const marcaId = rowData.brandId || rowData.marcaId || rowData.marca_id || rowData.brand_id;
        console.log("Marca ID encontrado:", marcaId);
        if (marcaId !== undefined && marcaId !== null) {
            const nombre = brandsMap[marcaId] || brandsMap[String(marcaId)] || brandsMap[Number(marcaId)];
            console.log("Nombre de marca encontrado en map:", nombre);
            if (nombre) return nombre;
        }
        if (marcaId !== undefined && marcaId !== null) return `Marca ID: ${marcaId}`;
        return "Sin marca";
    };

    const disponibleBodyTemplate = (rowData) => (
        <Tag value={rowData.disponible ? "Disponible" : "No disponible"} severity={rowData.disponible ? "success" : "danger"} />
    );

    const precioBodyTemplate = (rowData) => {
        const precio = rowData.precio_dia || rowData.precio_diario;
        return precio ? `$${precio}` : "N/A";
    };

    const alquilarBodyTemplate = (rowData) => {
        if (!canRent) return null;
        return (
            <Button
                label="Alquilar"
                icon="pi pi-calendar-plus"
                className="p-button-success"
                disabled={!rowData.disponible}
                onClick={() => navigate(`/rental/create?carId=${rowData.id}`)}
            />
        );
    };

    const verBodyTemplate = (rowData) => (
        <Button
            label="Ver Vehículo"
            icon="pi pi-eye"
            className="p-button-info"
            onClick={() => navigate(`/vehicles/${rowData.id}`)}
            style={{ fontSize: "0.5rem" }} // ajusta el tamaño del icono
            iconPos="left"
        />
    );

    const handleEdit = (vehicleData) => {
        if (!isAdmin) {
            showToast({
                severity: "warn",
                summary: "Acceso denegado",
                detail: "Solo los administradores pueden editar vehículos."
            });
            return;
        }
        navigate(`/vehicles/edit/${vehicleData.id}`, { state: { vehicleData } });
    };

    const handleDelete = async (id, modelo) => {
        if (!isAdmin) {
            showToast({
                severity: "warn",
                summary: "Acceso denegado",
                detail: "Solo los administradores pueden eliminar vehículos."
            });
            return;
        }
        confirmDialog({
            message: `¿Estás seguro de que querés eliminar el vehículo "${modelo}"?`,
            header: "Confirmar eliminación",
            icon: "pi pi-exclamation-triangle",
            accept: async () => {
                setLoading(true);
                const { ok, message } = await deleteCar(id);
                showToast({
                    severity: ok ? "success" : "error",
                    summary: ok ? "Éxito" : "Error",
                    detail: message
                });
                if (ok) {
                    await fetchCars(); // Recargar la lista
                }
                setLoading(false);
            },
            reject: () => {}
        });
    };

    const actionBodyTemplate = (rowData) => {
        // Solo admin puede ver las acciones de editar y eliminar
        if (!isAdmin) {
            return null;
        }
        
        return (
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-text p-button-sm"
                    onClick={() => handleEdit(rowData)}
                    tooltip="Editar"
                    tooltipOptions={{ position: "top" }}
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-text p-button-danger p-button-sm"
                    onClick={() => handleDelete(rowData.id, rowData.modelo)}
                    tooltip="Eliminar"
                    tooltipOptions={{ position: "top" }}
                />
            </div>
        );
    };

    return (
        <div className="vehicle-list-container">
            <Card className="vehicle-list-card">
                <div className="vehicle-list-header">
                    <div>
                        <h1 className="vehicle-list-title">Lista de Vehículos</h1>
                        <p className="vehicle-list-subtitle">
                            {user?.rol === "admin" ? "Gestiona todos los vehículos del sistema" : "Lista de vehículos del sistema"}
                        </p>
                    </div>
                    {user?.rol === "admin" && (
                        <Button 
                            label="Registrar Vehículo" 
                            icon="pi pi-plus" 
                            className="p-button-primary"
                            onClick={() => navigate("/vehicles/register")}
                            style={{ marginTop: "0.5rem" }}
                        />
                    )}
                </div>

                <ConfirmDialog />
                <DataTable
                    value={cars}
                    loading={loading}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    emptyMessage="No hay vehículos disponibles"
                    style={{ marginTop: "1rem" }}
                    stripedRows
                    showGridlines
                    responsiveLayout="scroll"
                >
                    <Column field="marca" header="Marca" body={marcaBodyTemplate} sortable style={{ minWidth: "150px" }} />
                    <Column field="modelo" header="Modelo" sortable style={{ minWidth: "150px" }} />
                    <Column field="anio" header="Año" sortable style={{ minWidth: "100px" }} />
                    <Column field="precio_dia" header="Precio Diario" body={precioBodyTemplate} sortable style={{ minWidth: "130px" }} />
                    <Column field="disponible" header="Disponible" body={disponibleBodyTemplate} sortable style={{ minWidth: "130px" }} />
                    {canRent && (
                        <Column header="Alquilar" body={alquilarBodyTemplate} style={{ width: "120px", textAlign: "center" }} />
                    )}
                    <Column header="Ver" body={verBodyTemplate} style={{ width: "140px", textAlign: "center" }} />
                    {isAdmin && (
                        <Column header="Acciones" body={actionBodyTemplate} style={{ minWidth: "120px", textAlign: "center" }} />
                    )}
                </DataTable>

                <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
                    <Button type="button" label="Volver" icon="pi pi-arrow-left" className="p-button-text p-button-sm" onClick={() => navigate(-1)} />
                </div>
            </Card>
        </div>
    );
}
