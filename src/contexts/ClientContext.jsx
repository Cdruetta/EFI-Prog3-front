import { createContext, useMemo, useState } from "react";
import { clientService } from "../services/clients";

export const ClientContext = createContext();

export const ClientProvider = ({ children }) => {
    const [clients, setClients] = useState([]);

    const registerClient = async ({ nombre, apellido, documento, correo, telefono, is_active }) => {
        const payload = { nombre, apellido, documento, correo, telefono, is_active };
        const res = await clientService.create(payload);
        const ok = res.status === 201 || res.status === 200;

        if (!ok) {
            const msg = res?.data?.message || res?.data?.detail || res?.message || `Error al registrar el cliente. Status: ${res.status}`;
            return { ok: false, message: msg };
        }

        const msg = res?.data?.message || res?.message || "Cliente registrado exitosamente";
        if (res?.data?.data) setClients(prev => [res.data.data, ...prev]);
        return { ok: true, message: msg, data: res?.data?.data };
    };

    const fetchClients = async () => {
        try {
            const res = await clientService.list();
            const ok = res.status === 200;
            const arr = res?.data?.data ?? [];
            const filtered = Array.isArray(arr) ? arr.filter(c => c.is_active !== false) : [];
            setClients(filtered);
            return { ok, message: ok ? "Lista de clientes obtenida correctamente." : "Error al consultar clientes." };
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Error al consultar clientes.";
            return { ok: false, message: msg };
        }
    };

    const getClient = async (id) => {
        try {
            const res = await clientService.get(id);
            const ok = res.status === 200;
            return { ok, message: ok ? "Cliente obtenido." : "No se pudo obtener el cliente.", data: res?.data?.data };
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Error al obtener el cliente.";
            return { ok: false, message: msg };
        }
    };

    const editClient = async (id, updated) => {
        try {
            const res = await clientService.update(id, updated);
            const ok = res.status === 200;
            const saved = res?.data?.data;
            if (ok && saved) setClients(prev => prev.map(c => (c.id === id ? saved : c)));
            return { ok, message: res?.data?.message || "Cliente actualizado correctamente", data: saved };
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Error al editar cliente.";
            return { ok: false, message: msg };
        }
    };

    const deleteClient = async (id) => {
        try {
            const res = await clientService.delete(id);
            const ok = res.status === 200;
            if (ok) setClients(prev => prev.filter(c => c.id !== id));
            const message = res?.data?.message || (ok ? "Cliente eliminado correctamente" : "Error al eliminar cliente.");
            return { ok, message };
        } catch (err) {
            const message = err?.response?.data?.message || err?.message || "Error al eliminar el cliente.";
            return { ok: false, message };
        }
    };

    const value = useMemo(() => ({
        clients,
        fetchClients,
        getClient,
        registerClient,
        editClient,
        deleteClient,
    }), [clients]);

    return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
};
