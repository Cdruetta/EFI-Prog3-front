import { createContext, useMemo, useState } from "react";
import { rentalsService } from "../services/rentals";

export const RentalsContext = createContext();

export const RentalsProvider = ({ children }) => {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchRentals = async (params = {}) => {
        setLoading(true);
        try {
            const res = await rentalsService.list({ params });
            const ok = res.status === 200;
            const msg = ok ? "Lista de alquileres obtenida correctamente." : "Error al consultar alquileres.";
            const arr = res?.data?.data ?? [];
            const filtered = Array.isArray(arr) ? arr : [];
            setRentals(filtered);
            setLoading(false);
            return { ok, message: msg, data: filtered };
        } catch (err) {
            setLoading(false);
            const msg = err?.data?.message || err?.message || "Error al consultar alquileres.";
            return { ok: false, message: msg };
        }
    };

    const getRental = async (id) => {
        try {
            const res = await rentalsService.get(id);
            const ok = res.status === 200;
            const msg = ok ? "Alquiler obtenido." : "No se pudo obtener el alquiler.";
            return { ok, message: msg, data: res?.data?.data };
        } catch (err) {
            const msg = err?.data?.message || err?.message || "Error al obtener el alquiler.";
            return { ok: false, message: msg };
        }
    };

    const createRental = async (payload) => {
        setLoading(true);
        try {
            // Verificar que hay token antes de hacer la petición
            const token = localStorage.getItem("token") || localStorage.getItem("access");
            if (!token) {
                setLoading(false);
                return { 
                    ok: false, 
                    message: "Debes iniciar sesión para crear un alquiler. Por favor, inicia sesión primero." 
                };
            }

            const res = await rentalsService.create(payload);
            const ok = res.status === 201 || res.status === 200;
            const msg = res?.data?.message || res?.message || (ok ? "Alquiler creado exitosamente" : "Error al crear alquiler.");
            if (ok && res?.data?.data) {
                setRentals(prev => [res.data.data, ...prev]);
            }
            setLoading(false);
            return { ok, message: msg, data: res?.data?.data };
        } catch (err) {
            setLoading(false);
            console.error("Error al crear alquiler:", err);
            
            // Si es un 404, el endpoint no existe en el backend
            if (err?.status === 404) {
                const msg = err?.data?.message || err?.message || "El endpoint /rentals no existe en el backend. Verifica que la ruta esté configurada en el servidor.";
                return { ok: false, message: msg };
            }
            
            // Si es un 401 o 403, problema de autenticación
            if (err?.status === 401 || err?.status === 403) {
                const msg = err?.data?.message || err?.message || "Token requerido. Por favor, inicia sesión nuevamente.";
                return { ok: false, message: msg };
            }
            
            const msg = err?.data?.message || err?.message || "Error al crear alquiler.";
            return { ok: false, message: msg };
        }
    };

    const updateRental = async (id, updated) => {
        try {
            const res = await rentalsService.update(id, updated);
            const ok = res.status === 200;
            const saved = res?.data?.data;
            if (ok && saved) {
                setRentals(prev => prev.map(r => (r.id === id ? saved : r)));
            }
            return { ok, message: res?.data?.message || "Alquiler actualizado correctamente", data: saved };
        } catch (err) {
            const msg = err?.data?.message || err?.message || "Error al actualizar alquiler.";
            return { ok: false, message: msg };
        }
    };

    const deleteRental = async (id) => {
        try {
            const res = await rentalsService.delete(id);
            const ok = res.status === 200;
            const message = res?.data?.message || (ok ? "Alquiler eliminado correctamente" : "Error al eliminar alquiler.");
            if (ok) setRentals(prev => prev.filter(r => r.id !== id));
            return { ok, message };
        } catch (err) {
            const message = err?.data?.message || err?.message || "Error al eliminar el alquiler.";
            return { ok: false, message };
        }
    };

    const value = useMemo(
        () => ({
            rentals,
            loading,
            fetchRentals,
            getRental,
            createRental,
            updateRental,
            deleteRental,
        }),
        [rentals, loading]
    );

    return (
        <RentalsContext.Provider value={value}>
            {children}
        </RentalsContext.Provider>   
    );
};

