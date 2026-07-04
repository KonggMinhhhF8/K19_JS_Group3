import { formatProducts, formatCurrency } from "../utils/format.js";

const API = "https://wo365ovs53.execute-api.ap-southeast-1.amazonaws.com";

const token = localStorage.getItem("token");

const headers = {
  "Content-Type": "application/json",
  Authorization: "Bearer " + token,
};

let orders = [];
let currentTab = "all";
let editingOrderId = null;

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
  const tbody = document.querySelector("table tbody");
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
        <td>${formatProducts(order)}</td>
        <td>${formatCurrency(order.product?.price * order.amount)}</td>
        <td>${getStatusBadge(order.status)}</td>
        <td>
          <button class="btn-action" title="Sửa" onclick="openEdit(${order.id})">
            <i class="fas fa-edit"></i>
          </button>
        </td>
      </tr>`;
  });
}

function getStatusBadge(status) {
  const map = {
    pending: '<span class="badge pending">Chờ xử lý</span>',
    delivering: '<span class="badge shipping">Đang giao</span>',
    done: '<span class="badge completed">Hoàn thành</span>',
    cancel: '<span class="badge cancelled">Đã hủy</span>',
  };
  return map[status] || `<span class="badge">${status}</span>`;
}

function filterByTab(data, tab) {
  const map = { pending: "pending", delivering: "delivering", done: "done" };
  return map[tab] ? data.filter((o) => o.status === map[tab]) : data;
}

function updateStats(data) {
  const cards = document.querySelectorAll(".stats .card p");
  if (cards.length < 4) return;

  cards[0].innerText = data.length;
  cards[1].innerText = data.filter(
    (o) => o.status === "pending" || o.status === "delivering",
  ).length;
  cards[2].innerText = data.filter((o) => o.status === "done").length;
  cards[3].innerText = data.filter((o) => o.status === "cancel").length;
}

const tabButtons = document.querySelectorAll(".tabs .tab");
const tabOrder = ["all", "pending", "delivering", "done"];

tabButtons.forEach((btn, index) => {
  btn.addEventListener("click", function () {
    tabButtons.forEach((t) => t.classList.remove("active"));
    this.classList.add("active");
    currentTab = tabOrder[index];
    renderOrders(filterByTab(orders, currentTab));
  });
});

const searchInput = document.querySelector(".search-bar input");
if (searchInput) {
  searchInput.addEventListener("input", function () {
    const kw = this.value.toLowerCase();
    const result = orders.filter(
      (o) =>
        String(o.id).includes(kw) ||
        (o.customer?.name || "").toLowerCase().includes(kw),
    );
    renderOrders(filterByTab(result, currentTab));
  });
}

function openModal() {
  document.getElementById("popup-toggle").checked = true;
}

function closeModal() {
  document.getElementById("popup-toggle").checked = false;
  editingOrderId = null;
  resetForm();
}

document
  .getElementById("btn-add-customers")
  .addEventListener("click", async () => {
    editingOrderId = null;
    await loadSelectData();
    resetForm();
  });

async function openEdit(id) {
  editingOrderId = id;
  await loadSelectData();

  try {
    const res = await fetch(API + "/orders/" + id, { headers });
    const order = await res.json();

    const custSelect = document.getElementById("customers");
    const prodSelect = document.getElementById("products");
    const statusSelect = document.querySelector('select[name="status"]');

    if (custSelect) custSelect.value = order.customer?.id || "";
    if (prodSelect) prodSelect.value = order.product?.id || "";
    if (statusSelect) statusSelect.value = order.status || "pending";
  } catch (e) {
    console.log(e);
  }

  openModal();
}

async function loadSelectData() {
  try {
    const [custRes, prodRes] = await Promise.all([
      fetch(API + "/customers", { headers }),
      fetch(API + "/products", { headers }),
    ]);
    const customers = await custRes.json();
    const products = await prodRes.json();

    const custSel = document.getElementById("customers");
    const prodSel = document.getElementById("products");

    if (custSel) {
      custSel.innerHTML = customers
        .map((c) => `<option value="${c.id}">${c.name}</option>`)
        .join("");
    }
    if (prodSel) {
      prodSel.innerHTML = products
        .map((p) => `<option value="${p.id}">${p.name}</option>`)
        .join("");
    }
  } catch (e) {
    console.log(e);
  }
}

const saveBtn = document.querySelector(".popup-content .btn-save");
if (saveBtn) {
  saveBtn.addEventListener("click", async () => {
    const customerId = Number(document.getElementById("customers").value);
    const productId = Number(document.getElementById("products").value);
    const status = document.querySelector('select[name="status"]').value;

    const body = {
      customerId,
      productId,
      amount: 1,
      status,
    };

    let url = API + "/orders";
    let method = "POST";

    if (editingOrderId) {
      url = API + "/orders/" + editingOrderId;
      method = "PUT";
    }

    await fetch(url, { method, headers, body: JSON.stringify(body) });

    alert(
      editingOrderId
        ? "Cập nhật đơn hàng thành công"
        : "Tạo đơn hàng thành công",
    );
    closeModal();
    loadOrders();
  });
}

function resetForm() {
  const custSel = document.getElementById("customers");
  const prodSel = document.getElementById("products");
  const statusSel = document.querySelector('select[name="status"]');

  if (custSel) custSel.selectedIndex = 0;
  if (prodSel) prodSel.selectedIndex = 0;
  if (statusSel) statusSel.selectedIndex = 0;
}

loadOrders();
