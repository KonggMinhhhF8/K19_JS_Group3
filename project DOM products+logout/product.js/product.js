const API = "https://wo365ovs53.execute-api.ap-southeast-1.amazonaws.com";

const token = localStorage.getItem("token");

const headers = {
  "Content-Type": "application/json",
  Authorization: "Bearer " + token,
};

let products = [];

// ==============================
// LOAD PRODUCTS
// ==============================

async function loadProducts() {
  try {
    const res = await fetch(API + "/products", {
      headers,
    });

    products = await res.json();

    renderProducts(products);

    updateStats(products);
  } catch (error) {
    console.log(error);
  }
}

// ==============================
// RENDER TABLE
// ==============================

function renderProducts(data) {
  const table = document.getElementById("productTableBody");

  if (!table) return;

  table.innerHTML = "";

  data.forEach((product) => {
    table.innerHTML += `

<tr>


<td>

<img 
class="img-thumb"
src="${product.imageUrl || "https://picsum.photos/50"}">

</td>



<td>

<strong>
${product.name}
</strong>

<br>

<small>
SKU: ${product.sku}
</small>

</td>



<td>

${product.category?.name || ""}

</td>



<td>

${Number(product.price).toLocaleString()} đ

</td>




<td class="${product.remaining <= 10 ? "stock-low" : ""}">

${product.remaining}

${product.remaining <= 10 ? "(Cảnh báo)" : ""}

</td>




<td>


<button 
class="btn-icon edit"
onclick="editProduct(${product.id})">

<i class="fas fa-edit"></i>

</button>




<button 
class="btn-icon delete"
onclick="deleteProduct(${product.id}, '${product.name}')">

<i class="fas fa-trash"></i>

</button>



</td>


</tr>

`;
  });
}

// ==============================
// SEARCH
// ==============================

const searchInput = document.getElementById("searchInput");

if (searchInput) {
  searchInput.addEventListener("input", function () {
    const keyword = this.value.toLowerCase();

    const result = products.filter(
      (product) =>
        product.name.toLowerCase().includes(keyword) ||
        product.sku.toLowerCase().includes(keyword),
    );

    renderProducts(result);
  });
}

// ==============================
// STATISTICS
// ==============================

function updateStats(data) {
  const total = document.getElementById("totalProduct");

  const low = document.getElementById("lowStock");

  const category = document.getElementById("totalCategory");

  if (total) {
    total.innerText = data.length;
  }

  if (low) {
    low.innerText = data.filter((p) => p.remaining <= 10).length;
  }

  if (category) {
    const list = new Set(data.map((p) => p.category?.id));

    category.innerText = list.size;
  }
}

// ==============================
// DELETE PRODUCT
// ==============================

async function deleteProduct(id, name) {
  const confirmDelete = confirm(
    `Bạn có chắc chắn muốn xóa sản phẩm ${name} không?`,
  );

  if (!confirmDelete) return;

  try {
    await fetch(
      API + "/products/" + id,

      {
        method: "DELETE",

        headers,
      },
    );

    alert("Xóa sản phẩm thành công");

    loadProducts();
  } catch (error) {
    console.log(error);
  }
}

// ==============================
// EDIT PRODUCT
// ==============================

function editProduct(id) {
  localStorage.setItem("editProduct", id);

  window.location.href = "create.html";
}

// ==============================
// CREATE / UPDATE
// ==============================

const form = document.getElementById("productForm");

let editId = localStorage.getItem("editProduct");

async function loadCategories() {
  const select = document.getElementById("category");

  if (!select) return;

  const res = await fetch(
    API + "/categories",

    {
      headers,
    },
  );

  const data = await res.json();

  select.innerHTML = "";

  data.forEach((item) => {
    select.innerHTML += `

<option value="${item.id}">

${item.name}

</option>

`;
  });
}

async function loadProductEdit() {
  if (!editId) return;

  const res = await fetch(
    API + "/products/" + editId,

    {
      headers,
    },
  );

  const product = await res.json();

  document.getElementById("name").value = product.name;

  document.getElementById("sku").value = product.sku;

  document.getElementById("price").value = product.price;

  document.getElementById("remaining").value = product.remaining;

  document.getElementById("category").value = product.category.id;
}

if (form) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const body = {
      categoryId: Number(document.getElementById("category").value),

      imageId: "",

      name: document.getElementById("name").value,

      sku: document.getElementById("sku").value,

      price: Number(document.getElementById("price").value),

      remaining: Number(document.getElementById("remaining").value),
    };

    let url = API + "/products";

    let method = "POST";

    if (editId) {
      url = API + "/products/" + editId;

      method = "PUT";
    }

    await fetch(
      url,

      {
        method,

        headers,

        body: JSON.stringify(body),
      },
    );

    alert("Lưu sản phẩm thành công");

    localStorage.removeItem("editProduct");

    window.location.href = "index.html";
  });
}

// ==============================
// START
// ==============================

if (document.getElementById("productTableBody")) {
  loadProducts();
}

if (document.getElementById("productForm")) {
  loadCategories();

  loadProductEdit();
}
