import { createContext, useEffect, useState } from "react";
import { brandService } from "../services/brands";
import { startLoading, stopLoading } from "../core/loading-bus";

export const BrandContext = createContext();

const getMessageFromResponse = (res, fallback) =>
    res?.data?.message || res?.message || fallback;

const getErrorMessage = (err, fallback) =>
    err?.response?.data?.message || err?.message || fallback;

export const BrandProvider = ({ children }) => {
    const [brands, setBrands] = useState([]);

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        startLoading();
        try {
            const res = await brandService.list();
            const ok = res?.ok === true;
            const data = res?.data?.data ?? res?.data ?? [];
            setBrands(Array.isArray(data) ? data : []);
            const message = getMessageFromResponse(res, ok ? "Marcas obtenidas." : "Error al obtener marcas.");
            return { ok, message, data };
        } catch (err) {
            setBrands([]);
            const message = getErrorMessage(err, "Error al obtener marcas.");
            return { ok: false, message, data: [] };
        } finally {
            stopLoading();
        }
    };

    const getBrandById = async (id) => {
        startLoading();
        try {
            const res = await brandService.get(id);
            const data = res?.data?.data ?? res?.data ?? null;
            const ok = !!data;
            const message = getMessageFromResponse(res, ok ? "Marca obtenida." : "Marca no encontrada.");
            return { ok, message, data };
        } catch (err) {
            const message = getErrorMessage(err, "Error al obtener marca.");
            return { ok: false, message, data: null };
        } finally {
            stopLoading();
        }
    };

    const registerBrand = async (payload) => {
        startLoading();
        try {
            const res = await brandService.create(payload);
            const ok = res?.ok === true;
            const data = res?.data?.data ?? res?.data ?? null;
            const message = getMessageFromResponse(res, ok ? "Marca creada." : "Error al crear marca.");
            if (ok && data) setBrands((prev) => [data, ...prev]);
            return { ok, message, data };
        } catch (err) {
            const message = getErrorMessage(err, "Error al registrar marca.");
            return { ok: false, message, data: null };
        } finally {
            stopLoading();
        }
    };

    const editBrand = async (id, payload) => {
        startLoading();
        try {
            const res = await brandService.update(id, payload);
            const ok = res?.ok === true;
            const data = res?.data?.data ?? res?.data ?? null;
            const message = getMessageFromResponse(res, ok ? "Marca actualizada." : "Error al actualizar marca.");
            if (ok && data) {
                setBrands((prev) => prev.map((b) => (b.id === id ? data : b)));
            }
            return { ok, message, data };
        } catch (err) {
            const message = getErrorMessage(err, "Error al actualizar marca.");
            return { ok: false, message, data: null };
        } finally {
            stopLoading();
        }
    };

    const deleteBrand = async (id) => {
        startLoading();
        try {
            const res = await brandService.delete(id);
            const ok = res?.ok === true;
            const message = getMessageFromResponse(res, ok ? "Marca eliminada." : "Error al eliminar marca.");
            if (ok) setBrands((prev) => prev.filter((b) => b.id !== id));
            return { ok, message };
        } catch (err) {
            const message = getErrorMessage(err, "Error al eliminar marca.");
            return { ok: false, message };
        } finally {
            stopLoading();
        }
    };

    const value = {
        brands,
        fetchBrands,
        getBrandById,
        registerBrand,
        editBrand,
        deleteBrand,
    };

    return (
        <BrandContext.Provider value={value}>
            {children}
        </BrandContext.Provider>
    );
};
