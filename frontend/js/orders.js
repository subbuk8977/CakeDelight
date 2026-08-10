async function loadOrders() {
  const userId = getUserId();

  document.getElementById("orderUserLabel").textContent = userId;

  try {
    const data = await request(`/api/orders/${encodeURIComponent(userId)}`);

    let orders;

    if (Array.isArray(data)) {
      orders = data;
    } else if (Array.isArray(data?.orders)) {
      orders = data.orders;
    } else if (Array.isArray(data?.data)) {
      orders = data.data;
    } else {
      orders = data ? [data] : [];
    }

    renderOrders(orders);
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function renderOrders(orders) {
  const container = document.getElementById("orderGrid");

  if (!orders.length) {
    container.innerHTML = `
      <div class="operation-card">
        <h3>No orders found</h3>
        <p>This user has no orders yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = orders.map(order => {
    const id = order.orderId || order._id || "unknown";
    const total = order.totalAmount ?? order.total ?? 0;
    const itemCount = order.items?.length ?? order.products?.length ?? "-";

    return `
      <article class="order-card">
        <div class="order-top">
          <span class="status">${escapeHtml(order.status || "CONFIRMED")}</span>
          <strong>#${escapeHtml(id)}</strong>
        </div>

        <div class="order-row">
          <span>User</span>
          <strong>${escapeHtml(order.userId || getUserId())}</strong>
        </div>

        <div class="order-row">
          <span>Total</span>
          <strong>₹${Number(total).toLocaleString()}</strong>
        </div>

        <div class="order-row">
          <span>Items</span>
          <strong>${itemCount}</strong>
        </div>

        <button class="btn secondary full"
          onclick='showOrderJson(${JSON.stringify(order)})'>
          View Details
        </button>
      </article>
    `;
  }).join("");
}

function showOrderJson(order) {
  alert(JSON.stringify(order, null, 2));
}

async function findOrder() {
  const orderId = document.getElementById("orderIdInput").value.trim();

  if (!orderId) {
    showMessage("Enter an order ID.", "error");
    return;
  }

  try {
    const data = await request(
      `/api/orders/detail/${encodeURIComponent(orderId)}`
    );

    document.getElementById("orderDetail").textContent =
      JSON.stringify(data, null, 2);
  } catch (error) {
    document.getElementById("orderDetail").textContent = error.message;
  }
}

async function checkPurchase() {
  const userId = getUserId();
  const cakeId = document.getElementById("purchaseCakeId").value.trim();

  if (!cakeId) {
    showMessage("Enter a cake ID.", "error");
    return;
  }

  try {
    const data = await request(
      `/api/orders/check-purchase/${encodeURIComponent(userId)}/${encodeURIComponent(cakeId)}`
    );

    document.getElementById("purchaseResult").textContent =
      JSON.stringify(data, null, 2);
  } catch (error) {
    document.getElementById("purchaseResult").textContent = error.message;
  }
}
