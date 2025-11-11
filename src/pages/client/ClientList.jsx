import { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { ClientContext } from "../../contexts/ClientContext";
import { useToast } from "../../contexts/ToastContext";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import "../../../styles/pages/client/ClientList.css";

export default function ClientList() {
    const { user } = useContext(AuthContext);
    const { clients, fetchClients, deleteClient } = useContext(ClientContext);
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        const loadClients = async () => {
            setLoading(true);
            const { ok, message } = await fetchClients();
            if (!ok) {
                showToast({
                    severity: "error",
                    summary: "Error",
                    detail: message
                });
            }
            setLoading(false);
        };

        loadClients();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleEdit = (clientData) => {
        if (user?.rol !== "admin") {
            showToast({
                severity: "warn",
                summary: "Acceso denegado",
                detail: "Solo los administradores pueden editar clientes."
            });
            return;
        }
        navigate(`/client/edit/${clientData.id}`, { state: { clientData } });
    };

    const handleDelete = async (id) => {
        if (user?.rol !== "admin") {
            showToast({
                severity: "warn",
                summary: "Acceso denegado",
                detail: "Solo los administradores pueden eliminar clientes."
            });
            return;
        }

        confirmDialog({
            message: "¿Estás seguro de que querés eliminar este cliente?",
            header: "Confirmar eliminación",
            icon: "pi pi-exclamation-triangle",
            accept: async () => {
                setLoading(true);
                const { ok, message } = await deleteClient(id);
                showToast({
                    severity: ok ? "success" : "error",
                    summary: ok ? "Éxito" : "Error",
                    detail: message
                });
                if (ok) {
                    await fetchClients();
                }
                setLoading(false);
            },
            reject: () => {}
        });
    };

    const actionBodyTemplate = (rowData) => {
        if (user?.rol !== "admin") return null;
        
        return (
            <div style={{ display: "flex", gap: "0.5rem" }}>
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-sm"
                    onClick={() => handleEdit(rowData)}
                    tooltip="Editar"
                    tooltipOptions={{ position: "top" }}
                    style={{
                        backgroundColor: "#6B7280",
                        borderColor: "#6B7280"
                    }}
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-sm"
                    onClick={() => handleDelete(rowData.id)}
                    tooltip="Eliminar"
                    tooltipOptions={{ position: "top" }}
                    style={{
                        backgroundColor: "#DC2626",
                        borderColor: "#DC2626"
                    }}
                />
            </div>
        );
    };

    return (
        <div className="client-list-container">
            <Card className="client-list-card">
                <div className="client-list-header">
                    <h1 className="client-list-title">
                        Lista de Clientes
                    </h1>
                    <p className="client-list-subtitle">
                        Gestiona todos los clientes del sistema
                    </p>
                </div>

                <DataTable
                    value={clients}
                    loading={loading}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    emptyMessage="No hay clientes disponibles"
                    style={{ marginTop: "1rem" }}
                    stripedRows
                    showGridlines
                    responsiveLayout="scroll"
                >
                    <Column 
                        field="id" 
                        header="ID" 
                        sortable 
                        style={{ width: "80px" }}
                    />
                    <Column 
                        field="nombre" 
                        header="Nombre" 
                        sortable
                        style={{ minWidth: "150px" }}
                    />
                    <Column 
                        field="apellido" 
                        header="Apellido" 
                        sortable
                        style={{ minWidth: "150px" }}
                    />
                    <Column 
                        field="documento" 
                        header="Documento" 
                        sortable
                        style={{ minWidth: "120px" }}
                    />
                    <Column 
                        field="correo" 
                        header="Correo" 
                        sortable
                        style={{ minWidth: "200px" }}
                    />
                    <Column 
                        field="telefono" 
                        header="Teléfono" 
                        sortable
                        style={{ minWidth: "150px" }}
                    />
                    {user?.rol === "admin" && (
                        <Column 
                            header="Acciones" 
                            body={actionBodyTemplate}
                            style={{ width: "120px", textAlign: "center" }}
                        />
                    )}
                </DataTable>
                <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
                    <Button 
                        type="button" 
                        label="Volver" 
                        icon="pi pi-arrow-left" 
                        className="p-button-text p-button-sm" 
                        onClick={() => navigate(-1)}
                    />
                </div>
            </Card>
            <ConfirmDialog />
        </div>
    );
}
