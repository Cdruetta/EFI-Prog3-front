import api from "./interceptors";

/**
 * Crea un cliente CRUD para un recurso de la API.
 * @param {string} basePath - Ruta base del recurso (ej: "users", "products").
 * @param {string} [label="Recurso"] - Nombre legible del recurso (para mensajes).
 */
export const resource = (basePath, label = "Recurso") => {
  const handle = (promise, successMsg) =>
    promise
      .then(r => ({
        data: r.data,
        status: r.status,
        message: r.data?.message ?? successMsg,
        headers: r.headers,
      }))
      .catch(e => {
        // Si el error ya fue normalizado por el interceptor
        if (e.status && e.data !== undefined) {
          // Lanzar el error para que se maneje en el catch
          return Promise.reject(e);
        }
        // Error original de axios
        const errorObj = {
          data: e.response?.data ?? e.data ?? null,
          status: e.response?.status ?? e.status ?? 500,
          message: e.response?.data?.message ?? 
                   e.response?.data?.detail ?? 
                   e.message ?? 
                   "Error en la solicitud",
          headers: e.response?.headers ?? e.headers,
        };
        return Promise.reject(errorObj);
      });

  return {
    list:   (config)           => handle(api.get(basePath, config), `${label}s obtenidos`),
    get:    (id, config)       => handle(api.get(`${basePath}/${id}`, config), `${label} obtenido`),
    post:   (path = "", payload, config) => handle(api.post(`${basePath}/${path}`, payload, config), `${label} enviado`),
    create: (payload, config)  => handle(api.post(basePath, payload, config), `${label} creado`),
    update: (id, payload, config) => handle(api.put(`${basePath}/${id}`, payload, config), `${label} actualizado`),
    delete: (id, config)       => handle(api.delete(`${basePath}/${id}`, config), `${label} eliminado`),
  };
};