function renderSidebar(activeKey, basePath) {
    const placeholder = document.getElementById("sidebar-placeholder");
    if (!placeholder) return;

    const menu = [
        { key: "dashboard", icon: "fa-home", label: "Tổng quan", href: `${basePath}index.html` },
        { key: "products", icon: "fa-box", label: "Sản phẩm", href: `${basePath}products/index.html` },
        { key: "orders", icon: "fa-shopping-cart", label: "Đơn hàng", href: `${basePath}orders/index.html` },
        { key: "customers", icon: "fa-users", label: "Khách hàng", href: `${basePath}customers/index.html` },
        { key: "reports", icon: "fa-chart-line", label: "Báo cáo", href: `${basePath}reports/index.html` },
    ];

    const itemsHtml = menu
        .map(
            (item) => `
    <li class="${item.key === activeKey ? "active" : ""}">
      <a href="${item.href}">
        <i class="fas ${item.icon}"></i> ${item.label}
      </a>
    </li>
  `
        )
        .join("");

    placeholder.outerHTML = `
    <aside class="sidebar" id="sidebar">
      <h2><i class="fas fa-store"></i> ShopAdmin</h2>
      <ul>
        ${itemsHtml}
      </ul>
      <div class="sidebar-footer">
        <button class="btn-logout" onclick="logout()">
          <i class="fas fa-sign-out-alt"></i> Đăng xuất
        </button>
      </div>
    </aside>
  `;
}

function setupMobileMenu() {
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    if (!menuToggle || !sidebar || !overlay) return;

    function toggleMenu() {
        sidebar.classList.toggle("active");
        overlay.classList.toggle("active");
    }

    menuToggle.addEventListener("click", toggleMenu);
    overlay.addEventListener("click", toggleMenu);
}