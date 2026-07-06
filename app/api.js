const API_BASE_URL = "https://wo365ovs53.execute-api.ap-southeast-1.amazonaws.com";

async function apiRequest(path, options = {}, _retried = false) {
    const token = getAccessToken();

    const headers = {
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers || {}),
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });

    if (res.status === 401 || res.status === 403) {
        if (!_retried) {
            const refreshed = await tryRefreshToken();
            if (refreshed) {
                return apiRequest(path, options, true);
            }
        }
        logout();
        throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
    }

    if (!res.ok) {
        let message = `Lỗi API (${res.status})`;
        try {
            const errBody = await res.json();
            message = errBody.message || errBody.error || message;
        } catch (_) {
            /* ignore parse error */
        }
        throw new Error(message);
    }

    if (res.status === 204) return null;

    const text = await res.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch (_) {
        return text;
    }
}

async function tryRefreshToken() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return false;
        const data = await res.json();
        saveTokens(data.accessToken, data.refreshToken);
        return true;
    } catch (_) {
        return false;
    }
}

const api = {
    get: (path) => apiRequest(path, { method: "GET" }),
    post: (path, body) => apiRequest(path, { method: "POST", body: JSON.stringify(body) }),
    put: (path, body) => apiRequest(path, { method: "PUT", body: JSON.stringify(body) }),
    delete: (path) => apiRequest(path, { method: "DELETE" }),
};

/* ===================== AUTH ===================== */
const AuthAPI = {
    // body: { email, password } -> { accessToken, refreshToken }
    signin: (email, password) =>
        apiRequest("/auth/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        }),
};

/* ===================== PRODUCTS ===================== */
const ProductAPI = {
    getAll: () => api.get("/products"),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post("/products", data),
    update: (id, data) => api.put(`/products/${id}`, data),
    remove: (id) => api.delete(`/products/${id}`),
};

/* ===================== CATEGORIES ===================== */
const CategoryAPI = {
    getAll: () => api.get("/categories"),
    getById: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post("/categories", data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    remove: (id) => api.delete(`/categories/${id}`),
};

/* ===================== CUSTOMERS ===================== */
const CustomerAPI = {
    getAll: () => api.get("/customers"),
    create: (data) => api.post("/customers", data),
    update: (id, data) => api.put(`/customers/${id}`, data),
    remove: (id) => api.delete(`/customers/${id}`),
};

/* ===================== ORDERS ===================== */
const OrderAPI = {
    getAll: () => api.get("/orders"),
    create: (data) => api.post("/orders", data),
    update: (id, data) => api.put(`/orders/${id}`, data),
    remove: (id) => api.delete(`/orders/${id}`),
};

/* ===================== IMAGES ===================== */
const ImageAPI = {
    // file: File object -> { id, url }
    upload: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return apiRequest("/images", { method: "POST", body: formData });
    },
};