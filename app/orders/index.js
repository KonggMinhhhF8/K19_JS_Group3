const API = "https://wo365ovs53.execute-api.ap-southeast-1.amazonaws.com";

const token = localStorage.getItem("token");

const headers = {
  "Content-Type": "application/json",
  Authorization: "Bearer " + token,
};

let orders = [];
let currentTab = "all";
let editingOrderId = null;

console.log(localStorage.getItem("token"));

async function loadOrders() {
  try {
    const res = await fetch(API + "/orders", { headers });
    orders = await res.json();

    if (!Array.isArray(orders)) {
      console.log("API không trả về mảng:", orders);
      orders = [];
    }

    renderOrders(filterByTab(orders, currentTab));
    updateStats(orders);
  } catch (error) {
    console.log(error);
  }
}

function renderOrders(data) {
  const tbody = document.getElementById("orderTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  data.forEach((order) => {
    tbody.innerHTML += `
      <tr>
        <td><strong>#ORD-${order.id}</strong></td>
        <td>
          ${order.customer?.name || "—"}
          <small>${order.customer?.phone || ""}</small>
        </td>
        <td>${formatProducts(order.items || order.orderItems)}</td>
        <td>${formatCurrency(order.total || order.totalAmount)}</td>
        <td>${getStatusBadge(order.status)}</td>
        <td>
          <button class="btn-action" title="Sửa" onclick="openEdit(${order.id})">
            <i class="fas fa-edit"></i>
          </button>
        </td>
      </tr>`;
  });
}
