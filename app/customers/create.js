requireAuth();
renderSidebar("customers", "../");
setupMobileMenu();

const params = new URLSearchParams(window.location.search);
const editingId = params.get("id");

async function loadCustomerForEdit() {
    if (!editingId) return;

    document.getElementById("pageTitle").textContent = "Sửa khách hàng | ShopAdmin";
    document.getElementById("formHeading").textContent = "Sửa khách hàng";
    document.getElementById("submitBtn").textContent = "Lưu thay đổi";

    try {
        const customers = await CustomerAPI.getAll();
        const customer = customers.find((c) => String(c.id) === String(editingId));
        if (!customer) {
            document.getElementById("formError").textContent = "Không tìm thấy khách hàng";
            return;
        }
        document.getElementById("name").value = customer.name || "";
        document.getElementById("email").value = customer.email || "";
        document.getElementById("phone").value = customer.phone || "";
        document.getElementById("address").value = customer.address || "";
        document.getElementById("rank").value = customer.rank || "BRONZE";
    } catch (err) {
        document.getElementById("formError").textContent = "Không tải được dữ liệu: " + err.message;
    }
}

document.getElementById("customerForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const errorEl = document.getElementById("formError");
    const submitBtn = document.getElementById("submitBtn");
    errorEl.textContent = "";

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();

    if (!name || !email) {
        errorEl.textContent = "Vui lòng nhập họ tên và email";
        return;
    }

    const payload = {
        name,
        email,
        phone: document.getElementById("phone").value.trim() || null,
        address: document.getElementById("address").value.trim() || null,
        rank: document.getElementById("rank").value,
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Đang lưu...";

    try {
        if (editingId) {
            await CustomerAPI.update(editingId, payload);
        } else {
            await CustomerAPI.create(payload);
        }
        window.location.href = "index.html";
    } catch (err) {
        errorEl.textContent = "Lưu thất bại: " + err.message;
        submitBtn.disabled = false;
        submitBtn.textContent = editingId ? "Lưu thay đổi" : "Lưu khách hàng";
    }
});

/* ===== Init ===== */
loadCustomerForEdit();