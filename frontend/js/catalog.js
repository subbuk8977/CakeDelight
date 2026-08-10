let cakes = [];
let editingCake = null;

const cakeImages = [
  "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=700&q=80"
];

function getArray(data, key = "cakes") {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

async function loadCakes() {
  try {
    const data = await request("/api/catalog/cakes");
    cakes = getArray(data);
    renderCakes();
    showMessage("GET /api/catalog/cakes successful.");
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function loadAllCakes() {
  try {
    const data = await request("/api/catalog/cakes/all");
    cakes = getArray(data);
    renderCakes();
    showMessage("GET /api/catalog/cakes/all successful.");
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function filterCakes() {
  renderCakes();
}

function renderCakes() {
  const grid = document.getElementById("cakeGrid");
  const search = document.getElementById("cakeSearch").value.toLowerCase();

  const filtered = cakes.filter(cake => {
    const text = `${cake.name || ""} ${cake.category || ""} ${cake.cakeId || cake._id || ""}`;
    return text.toLowerCase().includes(search);
  });

  document.getElementById("cakeCount").textContent = `${filtered.length} cakes`;

  if (!filtered.length) {
    grid.innerHTML = `
      <div class="operation-card">
        <h3>No cakes found</h3>
        <p>Make sure the Catalog Service is running and has data.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map((cake, index) => {
    const id = cake.cakeId || cake._id || cake.id;
    const image = cake.image || cake.imageUrl || cakeImages[index % cakeImages.length];

    return `
      <article class="cake-card">
        <div class="cake-image">
          <img src="${image}" alt="${escapeHtml(cake.name || "Cake")}"
               onerror="this.src='${cakeImages[0]}'">
          <span class="category">${escapeHtml(cake.category || "Cake")}</span>
        </div>

        <div class="cake-body">
          <h3>${escapeHtml(cake.name || "Unnamed Cake")}</h3>
          <p>${escapeHtml(cake.description || "Delicious Cake Delight special.")}</p>

          <div class="cake-info">
            <span class="cake-price">₹${Number(cake.price || 0).toLocaleString()}</span>
            <span class="stock">Stock: ${cake.stock ?? "-"}</span>
          </div>

          <div class="card-actions">
            <button class="btn primary" onclick='addToBasket(${JSON.stringify(cake)})'>＋ Basket</button>
            <button class="btn secondary" onclick='viewCake(${JSON.stringify(cake)})'>View</button>
            <button class="btn secondary" onclick='editCake(${JSON.stringify(cake)})'>Edit</button>
            <button class="btn secondary" onclick='deleteCake("${id}")'>Delete</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function viewCake(cake) {
  try {
    const id = cake.cakeId || cake._id || cake.id;
    const data = await request(`/api/catalog/cakes/${encodeURIComponent(id)}`);

    alert(JSON.stringify(data, null, 2));
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function editCake(cake) {
  editingCake = cake;
  openCakeForm(cake);
}

async function deleteCake(id) {
  if (!confirm(`Delete cake ${id}?`)) return;

  try {
    await request(`/api/catalog/cakes/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });

    showMessage("Cake deleted successfully.");
    await loadCakes();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function saveCake(event) {
  event.preventDefault();

  const editId = document.getElementById("editCakeId").value;

  const body = {
    cakeId: document.getElementById("formCakeId").value,
    name: document.getElementById("formName").value,
    price: Number(document.getElementById("formPrice").value),
    category: document.getElementById("formCategory").value,
    stock: Number(document.getElementById("formStock").value || 0),
    image: document.getElementById("formImage").value,
    description: document.getElementById("formDescription").value
  };

  try {
    if (editId) {
      await request(`/api/catalog/cakes/${encodeURIComponent(editId)}`, {
        method: "PUT",
        body: JSON.stringify(body)
      });
      showMessage("Cake updated successfully.");
    } else {
      await request("/api/catalog/cakes", {
        method: "POST",
        body: JSON.stringify(body)
      });
      showMessage("Cake created successfully.");
    }

    closeCakeForm();
    editingCake = null;
    await loadCakes();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function addToBasket(cake) {
  const userId = getUserId();
  const cakeId = cake.cakeId || cake._id || cake.id;

  try {
    await request(`/api/basket/${encodeURIComponent(userId)}/items`, {
      method: "POST",
      body: JSON.stringify({
        cakeId,
        name: cake.name,
        price: Number(cake.price),
        quantity: 1
      })
    });

    showMessage(`${cake.name} added to ${userId}'s basket.`);
  } catch (error) {
    showMessage(error.message, "error");
  }
}
