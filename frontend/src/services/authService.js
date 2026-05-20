const API_BASE_URL = "http://localhost:4000/api";

export const login = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Login failed");
        }

        // Store token and user info in localStorage
        localStorage.setItem("token", data.token);
        return data;
    } catch (error) {
        console.error("Login Error:", error);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem("token");
};

export const isAuthenticated = () => {
    return !!localStorage.getItem("token");
};
