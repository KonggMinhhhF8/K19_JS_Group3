const logoutBtn = document.getElementById("logout");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {

        localStorage.removeItem("token");
        localStorage.removeItem("editProduct");

        alert("Đăng xuất thành công");

        window.location.href = "../login.html";

    });
}