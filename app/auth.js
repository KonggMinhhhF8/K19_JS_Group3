const ACCESS_TOKEN_KEY = "shopadmin_access_token";
const REFRESH_TOKEN_KEY = "shopadmin_refresh_token";

function saveTokens(accessToken, refreshToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
}

function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function isLoggedIn() {
    return !!getAccessToken();
}

function getLoginPath() {
    const path = window.location.pathname;
    const parts = path.split("/").filter(Boolean);
    const fileName = parts[parts.length - 1] || "";
    const isAtAppRoot =
        fileName === "index.html" &&
        !path.includes("/login/") &&
        !path.includes("/customers/") &&
        !path.includes("/orders/") &&
        !path.includes("/products/") &&
        !path.includes("/reports/");
    return isAtAppRoot ? "login/index.html" : "../login/index.html";
}

function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = getLoginPath();
    }
}

function logout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.location.href = getLoginPath();
}