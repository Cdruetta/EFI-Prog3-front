import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { brandsService } from "../../services/brands";

export default function BrandList() {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [brands, setBrands] = useState([]);
    
    useEffect(() => {
        const loadBrands = async () => {
            setLoading(true);
            try {
                const res = await brandsService.list();
                if (res.status === 200) {
                    const brandsData = res?.data?.data ?? res?.data ?? [];
                    const brandsArray = Array.isArray(brandsData) ? brandsData : [];
                    setBrands(brandsArray);
                    
                    if (brandsArray.length === 0) {
                        showToast({
                            severity: "warn",
                            summary: "Sin marcas",
                            detail: "No hay marcas registradas en el sistema.",
                            life: 3000
                        });
                    }
                } else {
                    setBrands([]);
                    showToast({
                        severity: "error",
                        summary: "Error",
                        detail: "No se pudieron cargar las marcas",
                        life: 5000
                    });
                }
            } catch (err) {
                setBrands([]);
                const errorMsg = err?.data?.message || err?.message || "Error al cargar las marcas";
                showToast({
                    severity: "error",
                    summary: "Error",
                    detail: errorMsg,
                    life: 5000
                });
            } finally {
                setLoading(false);
            }
        };
        loadBrands();
    }, [showToast]);

    const nombreBodyTemplate = (rowData) => {
        return rowData.nombre || rowData.name || rowData.marca || "Sin nombre";
    };

    const idBodyTemplate = (rowData) => {
        return rowData.id || "N/A";
    };

    const handleEdit = (brandData) => {
        navigate(`/brands/edit/${brandData.id}`, { state: { brandData } });
    };

    const handleDelete = async (id, nombre) => {
        confirmDialog({
            message: `¿Estás seguro de que querés eliminar la marca "${nombre}"?`,
            header: "Confirmar eliminación",
            icon: "pi pi-exclamation-triangle",
            accept: async () => {
                setLoading(true);
                try {
                    const res = await brandsService.delete(id);
                    if (res.status === 200) {
                        showToast({
                            severity: "success",
                            summary: "Éxito",
                            detail: "Marca eliminada correctamente",
                            life: 3000
                        });
                        // Recargar la lista
                        const listRes = await brandsService.list();
                        if (listRes.status === 200) {
                            const brandsData = listRes?.data?.data ?? listRes?.data ?? [];
                            setBrands(Array.isArray(brandsData) ? brandsData : []);
                        }
                    } else {
                        showToast({
                            severity: "error",
                            summary: "Error",
                            detail: res?.data?.message || "Error al eliminar la marca",
                            life: 5000
                        });
                    }
                } catch (err) {
                    const errorMsg = err?.data?.message || err?.message || "Error al eliminar la marca";
                    showToast({
                        severity: "error",
                        summary: "Error",
                        detail: errorMsg,
                        life: 5000
                    });
                } finally {
                    setLoading(false);
                }
            },
            reject: () => {}
        });
    };

    const actionBodyTemplate = (rowData) => {
        const nombre = rowData.nombre || rowData.name || rowData.marca || "Sin nombre";
        return (
            <div className="flex gap-2">
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
                    onClick={() => handleDelete(rowData.id, nombre)}
                    tooltip="Eliminar"
                    tooltipOptions={{ position: "top" }}
                />
            </div>
        );
    };

    return (
        <div className="container mx-auto p-4" style={{ maxWidth: "1200px" }}>
            <Card>
                <div className="mb-4">
                    <Button
                        label="Volver"
                        icon="pi pi-arrow-left"
                        className="p-button-text mb-3"
                        onClick={() => navigate(-1)}
                    />
                    <div className="flex justify-content-between align-items-center">
                        <div>
                            <h1 className="m-0">Marcas Registradas</h1>
                            <p className="text-600 mt-2">
                                Lista de todas las marcas disponibles en el sistema
                            </p>
                        </div>
                        <Button
                            label="Registrar Marca"
                            icon="pi pi-plus"
                            className="p-button-primary"
                            onClick={() => navigate("/brands/register")}
                        />
                    </div>
                </div>

                <ConfirmDialog />
                <DataTable
                    value={brands}
                    loading={loading}
                    emptyMessage="No hay marcas registradas"
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 20, 50]}
                    className="p-datatable-sm"
                >
                    <Column 
                        field="id" 
                        header="ID" 
                        body={idBodyTemplate}
                        sortable 
                        style={{ minWidth: "80px" }} 
                    />
                    <Column 
                        field="nombre" 
                        header="Nombre" 
                        body={nombreBodyTemplate}
                        sortable 
                        style={{ minWidth: "200px" }} 
                    />
                    <Column 
                        header="Acciones" 
                        body={actionBodyTemplate}
                        style={{ minWidth: "120px", textAlign: "center" }}
                    />
                </DataTable>

                {brands.length > 0 && (
                    <div className="mt-3 text-center">
                        <p className="text-600">
                            Total de marcas: <strong>{brands.length}</strong>
                        </p>
                    </div>
                )}
            </Card>
        </div>
    );
}

