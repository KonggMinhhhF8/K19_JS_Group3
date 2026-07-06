requireAuth();
renderSidebar("customers", "../");
setupMobileMenu();

let allCustomers = [];
let customerIdToDelete = null;

const RANK_LABEL = { GOLD: "VÀNG", SILVER: "BẠC", BRONZE: "ĐỒNG" };
const RANK_CLASS = { GOLD: "gold", SILVER: "silver", BRONZE: "bronze" };

async function loadCustomers() {
    const tbody = document.getElementById("customerTableBody");
    tbody.innerHTML = `<tr><td colspan="5" class="loading-state">Đang tải dữ liệu...</td></tr>`;

    try {
        allCustomers = await CustomerAPI.getAll();

        document.getElementById("statTotalCustomers").textContent = allCustomers.length;
        document.getElementById("statGold").textContent = allCustomers.filter((c) => c.rank === "GOLD").length;
        document.getElementById("statSilver").textContent = allCustomers.filter((c) => c.rank === "SILVER").length;

        renderCustomers(allCustomers);
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state">Lỗi tải dữ liệu: ${err.message}</td></tr>`;
    }
}

function renderCustomers(list) {
    const tbody = document.getElementById("customerTableBody");

    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state">Không có khách hàng nào</td></tr>`;
        return;
    }

    tbody.innerHTML = list
        .map((c) => {
            const initials = (c.name || "?")
                .split(" ")
                .map((w) => w[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
            const rankClass = RANK_CLASS[c.rank] || "bronze";
            const rankLabel = RANK_LABEL[c.rank] || c.rank || "--";

            return `
        <tr>
          <td>
            <div class="cust-info" style="display:flex; align-items:center; gap:12px;">
              <div class="avatar" style="width:40px; height:40px; border-radius:50%; background:#eee; display:flex; align-items:center; justify-content:center; font-weight:bold; color:#7f8c8d;">${initials}</div>
              <div>
                <strong>${escapeHtml(c.name)}</strong><br />
                <small>ID: ${c.id}</small>
              </div>
            </div>
          </td>
          <td>${escapeHtml(c.email)}<br /><small>${escapeHtml(c.phone || "--")}</small></td>
          <td><span class="tier ${rankClass}">${rankLabel}</span></td>
          <td><strong>${formatCurrency(c.totalSpending)}</strong></td>
          <td>
            <button class="btn-icon edit" onclick="goEditCustomer(${c.id})" title="Sửa"><i class="fas fa-user-edit"></i></button>
            <button class="btn-icon delete" onclick="openDeleteModal(${c.id}, '${escapeHtml(c.name)}')" title="Xóa"><i class="fas fa-trash"></i></button>
          </td>
        </tr>
      `;
        })
        .join("");
}

function filterCustomers() {
    const keyword = document.getElementById("searchInput").value.trim().toLowerCase();
    if (!keyword) {
        renderCustomers(allCustomers);
        return;
    }
    const filtered = allCustomers.filter(
        (c) =>
            (c.name || "").toLowerCase().includes(keyword) ||
            (c.email || "").toLowerCase().includes(keyword)
    );
    renderCustomers(filtered);
}

function goEditCustomer(id) {
    window.location.href = `create.html?id=${id}`;
}

function openDeleteModal(id, name) {
    customerIdToDelete = id;
    document.getElementById("deleteModalText").textContent = `Bạn có chắc chắn muốn xóa khách hàng ${name} không?`;
    document.getElementById("deleteModal").classList.add("active");
}

function closeDeleteModal() {
    customerIdToDelete = null;
    document.getElementById("deleteModal").classList.remove("active");
}

async function confirmDeleteCustomer() {
    if (!customerIdToDelete) return;
    try {
        await CustomerAPI.remove(customerIdToDelete);
        closeDeleteModal();
        loadCustomers();
    } catch (err) {
        alert("Xóa thất bại: " + err.message);
    }
}

function formatCurrency(value) {
    if (value == null || value === "") return "0đ";
    return Number(value).toLocaleString("vi-VN") + "đ";
}

function escapeHtml(str) {
    return String(str ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/'/g, "&#39;")
        .replace(/"/g, "&quot;");
}

/* ===== Event bindings ===== */
document.getElementById("searchInput").addEventListener("input", filterCustomers);
document.getElementById("deleteCancelBtn").addEventListener("click", closeDeleteModal);
document.getElementById("deleteConfirmBtn").addEventListener("click", confirmDeleteCustomer);

/* ===== Init ===== */
loadCustomers();