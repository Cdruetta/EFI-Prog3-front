import { resource } from "./api";

const base = "user";
const label = "User";
const api = resource(base, label);

export const userService = {
    ...api,

    register: (config) => api.post("register", config),

    list: (config) => api.get("", config),

    roles: (config) => api.get("roles", config),
};