async function loadBasket() {
  const userId = getUserId();

  try {
    const data = await request(`/api/basket/${encodeURIComponent(userId)}`);

    const basket = data?.basket || data?.data || data || {};
    const items = Array.isArray(basket.items) ? basket.items : [];

    renderBasket(items, basket.totalAmount);
  } catch (error) {
    document.getElementById("basketItems").innerHTML = `
      <div class="operation-card">
        <h3>Basket unavailable</h3>
        <p>${escapeHtml(error.message)}</p>
      </div>
    `;

    showMessage(error.message, "error");
  }
}

function renderBasket(items, serverTotal) {
  const container = document.getElementById("basketItems");

  document.getElementById("basketItemCount").textContent = items.length;

  const total = serverTotal ?? items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  document.getElementById("basketTotal").textContent =
    `₹${Number(total).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  if (!items.length) {
    container.innerHTML = `
      <div class="operation-card">
        <h3>🛒 Basket is empty</h3>
        <p>Go to Catalog and click "＋ Basket" on a cake.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="basket-item">
      <div class="basket-icon">🍰</div>

      <div class="basket-info">
        <h3>${escapeHtml(item.name)}</h3>
        <small>${escapeHtml(item.cakeId)}</small>
        <br>
        <small>₹${Number(item.price).toLocaleString()} each</small>
      </div>

      <div class="quantity">
        <button onclick="updateBasketItem('${item.cakeId}', ${item.quantity - 1})">−</button>
        <strong>${item.quantity}</strong>
        <button onclick="updateBasketItem('${item.cakeId}', ${item.quantity + 1})">＋</button>
      </div>

      <strong>
        ₹${(Number(item.price) * Number(item.quantity)).toLocaleString()}
      </strong>

      <button class="delete-btn"
        onclick="removeBasketItem('${item.cakeId}')">🗑</button>
    </div>
  `).join("");
}

async function updateBasketItem(cakeId, quantity) {
  if (quantity < 1) return;

  const userId = getUserId();

  try {
    await request(
      `/api/basket/${encodeURIComponent(userId)}/items/${encodeURIComponent(cakeId)}`,
      {
        method: "PUT",
        body: JSON.stringify({ quantity })
      }
    );

    await loadBasket();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function removeBasketItem(cakeId) {
  const userId = getUserId();

  try {
    await request(
      `/api/basket/${encodeURIComponent(userId)}/items/${encodeURIComponent(cakeId)}`,
      { method: "DELETE" }
    );

    showMessage("Item removed from basket.");
    await loadBasket();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function checkout() {
  const userId = getUserId();

  try {
    const data = await request("/api/orders/checkout", {
      method: "POST",
      body: JSON.stringify({ userId })
    });

    showMessage(
      `Checkout successful. Order ID: ${data?.orderId || data?._id || "created"}`
    );

    await loadBasket();
  } catch (error) {
    showMessage(error.message, "error");
  }
}
