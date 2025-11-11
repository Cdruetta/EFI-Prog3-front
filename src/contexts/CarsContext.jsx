import { createContext, useMemo, useState } from "react";
import { carsService } from "../services/cars";

export const CarsContext = createContext();

export const CarsProvider = ({ children }) => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchCars = async (params = {}) => {
        setLoading(true);
        try {
            // Intentar incluir la relación Brand en la respuesta
            const res = await carsService.list({ 
                params: {
                    ...params,
                    include: 'Brand' // Intentar incluir la relación Brand
                } 
            });
            
            // Verificar si la respuesta es un error (403, 401, etc.)
            if (res.status === 403 || res.status === 401) {
                const msg = res?.data?.message || "El acceso a los vehículos requiere autenticación. Por favor, inicia sesión.";
                setLoading(false);
                setCars([]);
                return { ok: false, message: msg };
            }
            
            const ok = res.status === 200;
            const msg = ok ? "Lista de vehículos obtenida correctamente." : "Error al consultar vehículos.";
            
            // Solo procesar si la respuesta es exitosa
            if (!ok) {
                setLoading(false);
                setCars([]);
                return { ok: false, message: msg };
            }
            
            // Intentar diferentes estructuras posibles de la respuesta
            let arr = res?.data?.data ?? res?.data ?? [];
            
            // Si la respuesta es un objeto con una propiedad que contiene el array
            if (!Array.isArray(arr) && typeof arr === 'object') {
                // Buscar cualquier propiedad que sea un array
                const arrayKeys = Object.keys(arr).filter(key => Array.isArray(arr[key]));
                if (arrayKeys.length > 0) {
                    arr = arr[arrayKeys[0]];
                } else {
                    // Si no hay arrays, puede ser un objeto de error
                    arr = [];
                }
            }
            
            // Mostrar todos los vehículos (sin filtrar por ahora)
            const filtered = Array.isArray(arr) ? arr : [];
            setCars(filtered);
            setLoading(false);
            return { ok, message: msg, data: filtered };
        } catch (err) {
            setLoading(false);
            setCars([]);
            
            // Si es un error 401 o 403, el backend requiere autenticación
            if (err?.status === 401 || err?.status === 403) {
                const msg = err?.data?.message || "El acceso a los vehículos requiere autenticación. Por favor, inicia sesión.";
                return { ok: false, message: msg };
            }
            
            const msg = err?.data?.message || err?.message || err?.data?.detail || "Error al consultar vehículos.";
            return { ok: false, message: msg };
        }
    };

    const getCar = async (id) => {
        try {
            const res = await carsService.get(id);
            const ok = res.status === 200;
            const msg = ok ? "Vehículo obtenido." : "No se pudo obtener el vehículo.";
            return { ok, message: msg, data: res?.data?.data };
        } catch (err) {
            const msg = err?.data?.message || err?.message || "Error al obtener el vehículo.";
            return { ok: false, message: msg };
        }
    };

    const createCar = async (payload) => {
        try {
            const res = await carsService.create(payload);
            const ok = res.status === 201 || res.status === 200;
            const msg = res?.data?.message || res?.message || (ok ? "Vehículo creado exitosamente" : "Error al crear vehículo.");
            if (ok && res?.data?.data) {
                setCars(prev => [res.data.data, ...prev]);
            }
            return { ok, message: msg, data: res?.data?.data };
        } catch (err) {
            const msg = err?.data?.message || err?.data?.detail || err?.message || "Error al crear vehículo.";
            return { ok: false, message: msg };
        }
    };

    const updateCar = async (id, updated) => {
        try {
            const res = await carsService.update(id, updated);
            const ok = res.status === 200;
            const saved = res?.data?.data;
            if (ok && saved) {
                setCars(prev => prev.map(c => (c.id === id ? saved : c)));
            }
            return { ok, message: res?.data?.message || "Vehículo actualizado correctamente", data: saved };
        } catch (err) {
            const msg = err?.data?.message || err?.message || "Error al actualizar vehículo.";
            return { ok: false, message: msg };
        }
    };

    const deleteCar = async (id) => {
        try {
            const res = await carsService.delete(id);
            const ok = res.status === 200;
            const message = res?.data?.message || (ok ? "Vehículo eliminado correctamente" : "Error al eliminar vehículo.");
            if (ok) setCars(prev => prev.filter(c => c.id !== id));
            return { ok, message };
        } catch (err) {
            const message = err?.data?.message || err?.message || "Error al eliminar el vehículo.";
            return { ok: false, message };
        }
    };

    const value = useMemo(
        () => ({
            cars,
            loading,
            fetchCars,
            getCar,
            createCar,
            updateCar,
            deleteCar,
        }),
        [cars, loading]
    );

    return (
        <CarsContext.Provider value={value}>
            {children}
        </CarsContext.Provider>   
    );
};

