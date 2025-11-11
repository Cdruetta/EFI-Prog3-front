import api from "./interceptors";
import { resource } from "./api";

const base = "auth";
const label = "Auth";
const RESOURCE = resource(base, label);

// Función auxiliar para manejar respuestas
const wrap = (promise, successMsg) =>
  promise
    .then(r => ({
      data: r.data,
      status: r.status,
      message: r.data?.message ?? successMsg,
      headers: r.headers,
    }))
    .catch(e => ({
      data: e.response?.data ?? null,
      status: e.response?.status ?? 500,
      message: e.response?.data?.detail ?? "Error en la solicitud",
      headers: e.response?.headers,
    }));

export const authService = {
  ...RESOURCE,

  // ============================
  // 🔐 LOGIN
  // ============================
  login: async (credentials, config) => {
    const payload = {
      correo: credentials.correo || credentials.email,
      password: credentials.password,
    };

    // Asegura que la URL base esté bien formada
    const baseURL =
      import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
      "http://localhost:3000";

    const url = `${baseURL}/auth/login`;


    try {
      // 🚀 Hacer el POST directo sin pasar por RESOURCE.post
      const response = await api.post(url, payload, {
        ...config,
        skipGlobalLoading: true,
      });

      return {
        data: response.data,
        status: response.status,
        message: response.data?.message ?? "Inicio de sesión exitoso",
        headers: response.headers,
      };
    } catch (error) {

      const status = error.response?.status ?? 500;
      const message =
        error.response?.data?.message ??
        error.response?.data?.detail ??
        "Error en la solicitud";

      // Propagar el error con formato unificado
      return Promise.reject({
        data: error.response?.data ?? null,
        status,
        message,
        headers: error.response?.headers,
      });
    }
  },

  // ============================
  // 🔁 REFRESH TOKEN
  // ============================
  refresh: (refreshToken, config) =>
    RESOURCE.post("refresh", { refresh: refreshToken }, config),

  // ============================
  // 👤 OBTENER PERFIL
  // ============================
  me: (config) => wrap(api.get(`${base}/me`, config), "Perfil obtenido"),

  // ============================
  // 🚪 LOGOUT
  // ============================
  logout: (config) =>
    wrap(api.post(`${base}/logout`, null, config), "Sesión cerrada"),
};
