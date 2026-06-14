import { http } from "./http";

export const register = async (userData) => {
  try {
    const response = await http.post("auth/registrar", userData);
    const { nombre, email } = response.data;

    if (email) {
      return email;
    }
    throw new Error("Invalid register response");
  } catch (error) {
    console.error("Error al registrar un usuario", error.message, userData);
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const response = await http.post("auth/login", { email, password });
    const { token, refreshToken } = response.data;
    if (token) {
      sessionStorage.setItem("authToken", token);
      if (refreshToken) sessionStorage.setItem("refreshToken", refreshToken);
      return token;
    }
    throw new Error("Invalid login response");
  } catch (error) {
    console.error("Error al iniciar sesion del usuario", error.message, email);
    throw error;
  }
};

export const refresh = async () => {
  try {
    const refreshToken = sessionStorage.getItem("refreshToken");
    if (!refreshToken) return null;

    const response = await http.post("auth/refresh", { refreshToken });

    const { token, refreshToken: newRefreshToken } = response.data;

    if (token) {
      sessionStorage.setItem("authToken", token);
      if (newRefreshToken) sessionStorage.setItem("refreshToken", newRefreshToken);
      return token;
    }
    return null;
  } catch (error) {
    console.error("Error al refrescar el token", error);
    return null;
  }
};

export const checkEmail = async (email) => {
  try {
    const response = await http.get(`auth/check-email?email=${email}`);
    const { taken } = response.data;
    if (response.status === 200) {
      return taken;
    }
    throw new Error("Invalid check-email response");
  } catch (error) {
    console.error(
      "Error al consultar la disponibilidad del email",
      error.message,
      email,
    );
    throw error;
  }
};
