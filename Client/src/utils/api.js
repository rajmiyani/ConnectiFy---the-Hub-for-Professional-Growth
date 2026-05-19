import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor: Add Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("connectify_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            // Check if the current request is a login attempt
            const isLoginRequest = originalRequest.url.includes("/login");

            if (isLoginRequest) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                const currentRefreshToken = localStorage.getItem("connectify_refresh_token");
                if (!currentRefreshToken) {
                    throw new Error("No refresh token available");
                }

                // Identify if it's a company or user request based on context or URL
                const isCompany = originalRequest.url.includes("/companies") ||
                    originalRequest.url.includes("/jobs"); // Common company routes

                const refreshEndpoint = isCompany
                    ? "/companies/refresh-token"
                    : "/users/refresh-token";

                const response = await axios.post(`${API_BASE_URL}${refreshEndpoint}`, {
                    refreshToken: currentRefreshToken,
                });

                if (response.data.success) {
                    const newToken = response.data.token;
                    localStorage.setItem("connectify_token", newToken);

                    // Update header and retry
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);
                // Clear state and redirect to login if refresh fails
                localStorage.removeItem("connectify_user");
                localStorage.removeItem("connectify_token");
                localStorage.removeItem("connectify_refresh_token");

                const isAdminPath = window.location.pathname.startsWith("/admin");
                window.location.href = isAdminPath ? "/admin/login" : "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
