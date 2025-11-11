import { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { UserContext } from "../../contexts/UserContext";
import { useToast } from "../../contexts/ToastContext";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import "../../../styles/pages/user/UserList.css";

export default function UserList() {
    const { user } = useContext(AuthContext);
    const { fetchUsers, deleteUser, users } = useContext(UserContext);
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        const loadUsers = async () => {
            setLoading(true);
            const { ok, message } = await fetchUsers();
            if (!ok) {
                showToast({
                    severity: "error",
                    summary: "Error",
                    detail: message
                });
            }
            setLoading(false);
        };

        loadUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleEdit = (userData) => {
        if (user?.rol !== "admin") {
            showToast({
                severity: "warn",
                summary: "Acceso denegado",
                detail: "Solo los administradores pueden editar usuarios."
            });
            return;
        }
        navigate(`/user/edit/${userData.id}`, { state: { userData } });
    };

    const handleDelete = async (id) => {
        if (user?.rol !== "admin") {
            showToast({
                severity: "warn",
                summary: "Acceso denegado",
                detail: "Solo los administradores pueden eliminar usuarios."
            });
            return;
        }
        confirmDialog({
            message: "¿Estás seguro de que querés eliminar este usuario?",
            header: "Confirmar eliminación",
            icon: "pi pi-exclamation-triangle",
            accept: async () => {
                setLoading(true);
                const { ok, message } = await deleteUser(id);
                showToast({
                    severity: ok ? "success" : "error",
                    summary: ok ? "Éxito" : "Error",
                    detail: message
                });
                setLoading(false);
            },
            reject: () => {}
        });
    };

    const actionBodyTemplate = (rowData) => {
        // Solo admin puede ver las acciones de editar y eliminar
        if (user?.rol !== "admin") {
            return null;
        }
        
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

    const rolBodyTemplate = (rowData) => {
        const getRolSeverity = (rol) => {
            const rolLower = rol?.toLowerCase();
            if (rolLower === "admin") return "danger";
            if (rolLower === "empleado") return "info";
            if (rolLower === "cliente") return "success";
            return null;
        };

        return <Tag value={rowData.rol} severity={getRolSeverity(rowData.rol)} />;
    };

    return (
        <div className="user-list-container">
            <Card className="user-list-card">
                <div className="user-list-header">
                    <div>
                        <h1 className="user-list-title">
                            Lista de Usuarios
                        </h1>
                        <p className="user-list-subtitle">
                            {user?.rol === "admin" 
                                ? "Gestiona todos los usuarios del sistema" 
                                : "Lista de usuarios del sistema"}
                        </p>
                    </div>
                    {user?.rol === "admin" && (
                        <Button 
                            label="Registrar Usuario" 
                            icon="pi pi-user-plus" 
                            className="p-button-primary"
                            onClick={() => navigate("/user/register")}
                            style={{ marginTop: "0.5rem" }}
                        />
                    )}
                </div>

                <DataTable
                    value={users}
                    loading={loading}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    emptyMessage="No hay usuarios disponibles"
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
                        field="correo" 
                        header="Correo" 
                        sortable
                        style={{ minWidth: "200px" }}
                    />
                    <Column 
                        field="rol" 
                        header="Rol" 
                        body={rolBodyTemplate}
                        sortable
                        style={{ minWidth: "120px" }}
                    />
                    <Column 
                        header="Acciones" 
                        body={actionBodyTemplate}
                        style={{ width: "120px", textAlign: "center" }}
                    />
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
