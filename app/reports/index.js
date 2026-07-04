import { formatCurrency } from "../utils/format.js";

const API = "https://wo365ovs53.execute-api.ap-southeast-1.amazonaws.com";

const token = localStorage.getItem("token");

const headers = {
  "Content-Type": "application/json",
  Authorization: "Bearer " + token,
};

async function init() {
  const res = await fetch(API + "/orders", { headers });
  const orders = await res.json();
  if (!Array.isArray(orders)) return;

  renderStats(orders);
  renderCharts(orders);
  renderTable(orders);
}

function renderStats(orders) {
  const done = orders.filter((o) => o.status === "done");
  const revenue = done.reduce(
    (s, o) => s + (o.product.price || 0) * (o.amount || 1),
    0,
  );
  const customers = new Set(orders.map((o) => o.customer.id).filter(Boolean))
    .size;

  const vals = document.querySelectorAll(".stats-grid .stat-card .value");
  vals[0].innerText = formatCurrency(revenue);
  vals[1].innerText = orders.length;
  vals[2].innerText = formatCurrency(revenue * 0.25);
  vals[3].innerText = customers;
}

// ---------- CHARTS ----------
function renderCharts(orders) {
  const doneOrders = orders.filter((o) => o.status === "done");

  const byDate = {};

  doneOrders.forEach((o) => {
    const date = (o.date || "").slice(0, 10);

    if (!date) return;

    const revenue = Number(o.product.price || 0) * Number(o.amount || 1);

    byDate[date] = (byDate[date] || 0) + revenue;
  });

  const dates = Object.keys(byDate).sort();

  new Chart(document.getElementById("revenueChart"), {
    type: "line",
    data: {
      labels: dates.map((d) => d.slice(5).replace("-", "/")),
      datasets: [
        {
          label: "Doanh thu (VNĐ)",
          data: dates.map((d) => byDate[d]),
          borderColor: "#3498db",
          backgroundColor: "rgba(52,152,219,0.15)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          ticks: {
            callback: (value) => formatCurrency(value),
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (c) => formatCurrency(c.raw),
          },
        },
      },
    },
  });

  const byCat = {};

  doneOrders.forEach((o) => {
    const cat = o.product.category.name;

    const revenue = Number(o.product.price || 0) * Number(o.amount || 1);

    byCat[cat] = (byCat[cat] || 0) + revenue;
  });

  const cats = Object.keys(byCat);

  new Chart(document.getElementById("categoryChart"), {
    type: "doughnut",
    data: {
      labels: cats,
      datasets: [
        {
          data: cats.map((c) => byCat[c]),
          backgroundColor: [
            "#3498db",
            "#2ecc71",
            "#f1c40f",
            "#e74c3c",
            "#9b59b6",
            "#1abc9c",
            "#34495e",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: (c) => {
              const total = c.dataset.data.reduce((a, b) => a + b, 0);
              const percent = ((c.raw / total) * 100).toFixed(1);

              return `${c.label}: ${formatCurrency(c.raw)} (${percent}%)`;
            },
          },
        },
      },
    },
  });
}

function renderTable(orders) {
  const byProduct = {};
  orders.forEach((o) => {
    if (!o.product) return;
    const p = (byProduct[o.product.id] ||= {
      name: o.product.name,
      qty: 0,
      revenue: 0,
    });
    p.qty += o.amount || 1;
    p.revenue += (o.product.price || 0) * (o.amount || 1);
  });

  const tbody = document.querySelector(".top-products tbody");

  tbody.innerHTML = Object.values(byProduct)
    .sort((a, b) => b.revenue - a.revenue)
    .map(
      (p) => `<tr>
      <td>${p.name}</td>
      <td>${p.qty}</td>
      <td>${formatCurrency(p.revenue)}</td>
      <td><span style="color:var(--success)">Còn hàng</span></td>
    </tr>`,
    )
    .join("");
}

init();
