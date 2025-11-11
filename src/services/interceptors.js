import axios from "axios";
import { startLoading, stopLoading, resetLoading } from "../core/loading-bus";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
    validateStatus: (s) => s < 500,
});


api.interceptors.request.use((config) => {
    // Solo activar loading global si no se especifica skipGlobalLoading
    if (!config.skipGlobalLoading) {
        startLoading();
    }
    // Intentar obtener el token de localStorage (puede ser "token" o "access")
    const token = localStorage.getItem("token") || localStorage.getItem("access");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        console.warn("No se encontró token en localStorage para la petición:", config.url);
    }
    
    return config;
});

api.interceptors.response.use(
  (res) => { 
    // Solo detener loading global si no se especificó skipGlobalLoading
    if (!res.config?.skipGlobalLoading) {
        stopLoading(); 
    }
    
    return res; 
  },
  (error) => {
    // Asegurar que el loading siempre se detenga en caso de error
    if (!error.config?.skipGlobalLoading) {
        // Si es un error de timeout o de red, resetear completamente
        if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
            resetLoading();
        } else {
            stopLoading();
        }
    }

    // Si no hay respuesta del servidor (error de red, servidor caído, timeout, etc.)
    if (!error.response) {
      const networkError = {
        status: 0,
        data: { message: error.code === 'ECONNABORTED' 
            ? "La petición tardó demasiado. Intenta nuevamente." 
            : "Error de conexión. Verifica que el servidor esté corriendo." },
        message: error.code === 'ECONNABORTED'
            ? "La petición tardó demasiado. Intenta nuevamente."
            : "Error de conexión. Verifica que el servidor esté corriendo.",
      };
      return Promise.reject(networkError);
    }

    const status = error?.response?.status;
    const responseData = error?.response?.data;
    
    // Si es un error de autenticación (401 o 403), limpiar tokens y redirigir
    if (status === 401 || status === 403) {
      // Limpiar tokens del localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      
      // Redirigir al login si no estamos ya en la página de login
      if (window.location.pathname !== "/auth/login") {
        window.location.href = "/auth/login";
      }
    }
    
    const normalized = {
      status,
      data: responseData,
      message: responseData?.message || 
               responseData?.error ||
               responseData?.detail || 
               error?.message || 
               `Error ${status}: Request failed`,
    };
    
    return Promise.reject(normalized);
  }
);
export default api