import { http } from "./http";

export const isAuthenticated = () => {
  const token = sessionStorage.getItem("authToken");
  return token !== null;
};

export const getUserProfile = async () => {
  try {
    const res = await http.get("auth/perfil");
    const user = res.data;

    if (!user) {
      throw new Error("No se pudo obtener el perfil");
    }

    const normalizedUser = { ...user, role: user.rol };

    sessionStorage.setItem("userData", JSON.stringify(normalizedUser));
    return normalizedUser;
  } catch (error) {
    console.error("Error al obtener el perfil", error);
    throw error;
  }
};

export const getUsers = async () => {
  try {
    const response = await http.get("users");
    return response.data;
  } catch (error) {
    console.error("Error getting users:", error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await http.post("users", {
      nombre: userData.nombre,
      email: userData.email,
      password: userData.password,
      rol: userData.rol,
      telefono: userData.telefono
    });
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await http.put(`users/${id}`, {
      nombre: userData.nombre,
      email: userData.email,
      password: userData.password,
      rol: userData.rol,
      telefono: userData.telefono
    });
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const getUserByPhone = async (phone) => {
  try {
    const response = await http.get(`users/buscar-por-telefono`, {
      params: { telefono: phone }
    });
    return response.data;
  } catch (error) {
    console.error("Error getting user by phone:", error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await http.delete(`users/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};
