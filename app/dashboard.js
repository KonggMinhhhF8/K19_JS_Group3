requireAuth();
renderSidebar("dashboard", "");
setupMobileMenu();

const STATUS_LABEL = { pending: "Chờ xử lý", delivering: "Đang giao", done: "Hoàn thành", cancel: "Đã hủy" };

async function loadDashboard() {
    try {
        const [products, customers, orders] = await Promise.all([
            ProductAPI.getAll(),
            CustomerAPI.getAll(),
            OrderAPI.getAll(),
        ]);

        document.getElementById("statProducts").textContent = products.length;
        document.getElementById("statCustomers").textContent = customers.length;
        document.getElementById("statOrders").textContent = orders.length;

        const revenue = orders
            .filter((o) => o.status === "done")
            .reduce((sum, o) => sum + (o.product?.price || 0) * (o.amount || 0), 0);
        document.getElementById("statRevenue").textContent = formatCurrency(revenue);

        renderRecentOrders(orders);
    } catch (err) {
        document.getElementById("recentOrdersBody").innerHTML =
            `<tr><td colspan="4" class="empty-state">Lỗi tải dữ liệu: ${err.message}</td></tr>`;
    }
}

function renderRecentOrders(orders) {
    const tbody = document.getElementById("recentOrdersBody");

    const sorted = [...orders]
        .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
        .slice(0, 8);

    if (!sorted.length) {
        tbody.innerHTML = `<tr><td colspan="4" class="empty-state">Chưa có đơn hàng nào</td></tr>`;
        return;
    }

    tbody.innerHTML = sorted
        .map((o) => {
            const customerName = o.customer ? o.customer.name : "--";
            const total = (o.product?.price || 0) * (o.amount || 0);
            const statusLabel = STATUS_LABEL[o.status] || o.status || "--";

            return `
        <tr>
          <td>#${o.id}</td>
          <td>${escapeHtml(customerName)}</td>
          <td><span class="badge ${o.status}">${statusLabel}</span></td>
          <td>${formatCurrency(total)}</td>
        </tr>
      `;
        })
        .join("");
}

function formatCurrency(value) {
    if (value == null) return "0đ";
    return Number(value).toLocaleString("vi-VN") + "đ";
}

function escapeHtml(str) {
    return String(str ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

loadDashboard();