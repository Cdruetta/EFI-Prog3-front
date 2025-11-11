import { createContext, useEffect, useMemo, useState } from "react";
import { userService } from "../services/user"; 

export const UserContext = createContext()
export const UserProvider = ({children}) =>{
  
    const [roles, setRoles] = useState([]);
    const [users, setUsers] = useState([]);

    const fetchRoles = async () => {
        try {
            const res = await userService.roles();
            const data = res?.data?.data 
            setRoles(Array.isArray(data) ? data : []);
        } catch (err) {
            setRoles([]); 
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await userService.list();
            const data = res?.data?.data;
            // Filtrar solo usuarios activos (is_active === true)
            const filteredData = Array.isArray(data) 
                ? data.filter(user => user.is_active === true)
                : [];
            setUsers(filteredData);
            const ok = res.status === 200 || res.status === 201;
            const msg = res?.message || (ok ? "Usuarios obtenidos correctamente." : "Error al obtener usuarios.");
            return { ok, message: msg };
        } catch (err) {
            setUsers([]);
            const msg = err?.response?.data?.message || err?.message || "Error al obtener usuarios.";
            return { ok: false, message: msg };
        }
    };

    const deleteUser = async (id) => {
        try {
            const res = await userService.delete(id);
            const ok = res.status === 200 || res.status === 201 || res.status === 204;
            const msg = res?.message || (ok ? "Usuario eliminado correctamente." : "Error al eliminar el usuario.");
            
            if (ok) {
                await fetchUsers();
            }
            
            return { ok, message: msg };
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Error al eliminar el usuario.";
            return { ok: false, message: msg };
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []); 

    const registerUser = async ({ nombre, correo, password, rol }) => {
        try {
            const payload = { nombre, correo, password, rol };
            const res = await userService.register(payload);

            const ok = res.status === 200 || res.status === 201;
            const msg = res?.data?.message || (ok ? "Usuario registrado." : "Error al registrar el usuario.");

            return { ok, message: msg, data: res?.data };
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Error al registrar el usuario.";

            return { ok: false, message: msg };
        }
    };

    const editUser = async (id, { nombre, correo, password, rol }) => {
        try {
            const payload = { nombre, correo };
            if (password) payload.password = password;
            if (rol !== undefined) payload.rol = rol;
            const res = await userService.update(id, payload);

            const ok = res.status === 200 || res.status === 201;
            const msg = res?.data?.message || (ok ? "Usuario actualizado." : "Error al actualizar el usuario.");

            return { ok, message: msg, data: res?.data };
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Error al actualizar el usuario.";

            return { ok: false, message: msg };
        }
    };

    const getUserById = async (id) => {
        try {
            const res = await userService.get(id);
            return res?.data?.data || null;
        } catch (err) {
            return null;
        }
    };

    const value = useMemo(() => ({
        roles,
        users,
        registerUser,
        editUser,
        fetchUsers,
        deleteUser,
        getUserById
    }),[roles, users]);

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};
