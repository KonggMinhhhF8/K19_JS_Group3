/**
 * login.js
 * Logic trang đăng nhập, gọi API thật POST /auth/signin (xem api.js).
 */

if (isLoggedIn()) {
    window.location.href = "../index.html";
}

document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorEl = document.getElementById("loginError");
    const submitBtn = document.getElementById("loginSubmitBtn");

    errorEl.textContent = "";
    submitBtn.disabled = true;
    submitBtn.textContent = "Đang đăng nhập...";

    AuthAPI.signin(email, password)
        .then((data) => {
            saveTokens(data.accessToken, data.refreshToken);
            window.location.href = "../index.html";
        })
        .catch((err) => {
            errorEl.textContent = err.message || "Sai email hoặc mật khẩu";
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = "Đăng nhập";
        });
});