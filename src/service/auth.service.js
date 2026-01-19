import api from "../api/api.js";

export const login = async (email, password) => {
    try {
        const res = await api.post("/auth/login", { email, password });
        const data = res.data;
        localStorage.setItem("jwtToken", data.data.token);
        return data;
    } catch (error) {
        console.error("Login error in auth service:", error);
        return Promise.reject(error);
    }
};

export const signup = async (email, password) => {
    try {
        const res = await api.post("/auth/signup", { email, password });

        const data = res.data;

        return data;
    } catch (error) {
        console.error("Signup error in auth service:", error);
        return Promise.reject(error);
    }
};
