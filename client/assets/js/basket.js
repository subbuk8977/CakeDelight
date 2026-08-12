/* ============================================================
   Cake Delight — basket page
   ============================================================ */
(function () {
  const itemsRoot = document.getElementById("cd-basket-items");
  const sumItems = document.getElementById("cd-sum-items");
  const sumTotal = document.getElementById("cd-sum-total");
  const checkoutBtn = document.getElementById("cd-checkout-btn");
  const errorBanner = document.getElementById("cd-error-banner");
  const checkoutEmail = document.getElementById("cd-checkout-email");

  const THUMB_FALLBACK =
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&q=70&auto=format&fit=crop";

  function showError(message) {
    errorBanner.style.display = message ? "block" : "none";
    errorBanner.querySelector(".cd-error-banner__inner").textContent = message || "";
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
  }

  function renderEmpty() {
    itemsRoot.innerHTML = `
      <div class="cd-empty-state" style="margin:20px 0;">
        <div class="cd-empty-state__icon">🧺</div>
        <h3>Your basket is empty</h3>
        <p>Nothing here yet — go pick something delicious from the catalog.</p>
        <a href="index.html" class="cd-btn cd-btn--primary">Browse the catalog</a>
      </div>`;
    checkoutBtn.disabled = true;
  }

  function renderItems(items) {
    if (items.length === 0) {
      renderEmpty();
      sumItems.textContent = "0";
      sumTotal.textContent = "₹0.00";
      return;
    }
    checkoutBtn.disabled = false;
    itemsRoot.innerHTML = items
      .map(
        (item) => `
      <div class="cd-basket-item" data-cake-id="${item.cakeId}">
        <img class="cd-basket-item__thumb" src="${THUMB_FALLBACK}" alt="" />
        <div>
          <p class="cd-basket-item__name">${escapeHtml(item.name)}</p>
          <p class="cd-basket-item__price">₹${item.price.toFixed(2)} each</p>
        </div>
        <div class="cd-qty-stepper">
          <button type="button" data-step="-1" aria-label="Decrease quantity">−</button>
          <input type="text" value="${item.quantity}" data-qty readonly />
          <button type="button" data-step="1" aria-label="Increase quantity">+</button>
        </div>
        <button class="cd-icon-btn" data-remove aria-label="Remove item" title="Remove">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z"/></svg>
        </button>
      </div>`
      )
      .join("");

    const totalCount = items.reduce((s, i) => s + i.quantity, 0);
    const total = items.reduce((s, i) => s + i.quantity * i.price, 0);
    sumItems.textContent = totalCount;
    sumTotal.textContent = `₹${total.toFixed(2)}`;

    wireItemInteractions();
  }

  function wireItemInteractions() {
    itemsRoot.querySelectorAll(".cd-basket-item").forEach((row) => {
      const cakeId = row.dataset.cakeId;
      const qtyInput = row.querySelector("[data-qty]");

      row.querySelectorAll("[data-step]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const delta = Number(btn.dataset.step);
          const next = Number(qtyInput.value) + delta;
          if (next < 1) return;
          qtyInput.value = next;
          try {
            const cfg = cdGetConfig();
            await cdPutJSON(`${cfg.basket}/api/basket/${cdGetUserId()}/items/${cakeId}`, { quantity: next });
            cdInvalidateCache(cfg.basket);
            await loadBasket();
            cdRefreshBasketCount();
          } catch (err) {
            cdShowToast({ title: "Couldn't update quantity", message: err.message, tone: "error" });
          }
        });
      });

      row.querySelector("[data-remove]").addEventListener("click", async () => {
        try {
          const cfg = cdGetConfig();
          await cdDelete(`${cfg.basket}/api/basket/${cdGetUserId()}/items/${cakeId}`);
          cdInvalidateCache(cfg.basket);
          await loadBasket();
          cdRefreshBasketCount();
        } catch (err) {
          cdShowToast({ title: "Couldn't remove item", message: err.message, tone: "error" });
        }
      });
    });
  }

  async function loadBasket() {
    itemsRoot.innerHTML = `
      <div class="cd-skeleton" style="height:90px; margin-bottom:12px;"></div>
      <div class="cd-skeleton" style="height:90px; margin-bottom:12px;"></div>`;
    showError("");
    try {
      const cfg = cdGetConfig();
      const res = await cdFetch(`${cfg.basket}/api/basket/${cdGetUserId()}`, { timeout: 15000 });
      renderItems((res.data && res.data.items) || []);
    } catch (err) {
      itemsRoot.innerHTML = "";
      showError(`Couldn't load your basket: ${err.message}`);
    }
  }

  async function getLatestNotificationId() {
    try {
      const cfg = cdGetConfig();
      const res = await cdFetch(`${cfg.notification}/api/notifications/${cdGetUserId()}`, { timeout: 4000 });
      const list = res.data || [];
      return list[0] ? list[0]._id : null;
    } catch (e) {
      return null;
    }
  }

  async function pollForNewNotification(sinceId, attempts = 8, delayMs = 1200) {
    const cfg = cdGetConfig();
    for (let i = 0; i < attempts; i++) {
      await new Promise((r) => setTimeout(r, delayMs));
      try {
        const res = await cdFetch(`${cfg.notification}/api/notifications/${cdGetUserId()}`, { timeout: 4000 });
        const list = res.data || [];
        if (list[0] && list[0]._id !== sinceId) return list[0];
      } catch (e) {
        /* keep trying — notification service may still be starting up */
      }
    }
    return null;
  }

  checkoutBtn.addEventListener("click", async () => {
    checkoutBtn.disabled = true;
    const original = checkoutBtn.textContent;
    checkoutBtn.textContent = "Placing order…";
    try {
      const cfg = cdGetConfig();
      const sinceId = await getLatestNotificationId();

      const email = checkoutEmail.value.trim();

    if (!email) {
      cdShowToast({
        title: "Email required",
        message: "Please enter your email address.",
        tone: "error"
      });
      checkoutBtn.textContent = original;
      checkoutBtn.disabled = false;
      checkoutEmail.focus();
      return;
    }

    const order = await cdPostJSON(`${cfg.order}/api/orders/checkout`, {
      userId: cdGetUserId(),
      email
    });
      cdInvalidateCache(cfg.basket);
      cdInvalidateCache(cfg.order);
      cdRefreshBasketCount();
      renderEmpty();

      checkoutBtn.textContent = "Confirming…";
      const notification = await pollForNewNotification(sinceId);

      if (notification) {
        cdShowToast({
          title: notification.title || "🎉 Order confirmed!",
          message: notification.message || "Your order is baking — we'll keep you posted.",
          tone: "success",
          duration: 7000,
        });
      } else {
        cdShowToast({
          title: "🎉 Order placed",
          message: `Order #${(order.data && order.data._id) ? order.data._id.slice(-6) : ""} confirmed — check the Orders page for details.`,
          tone: "success",
          duration: 7000,
        });
      }

      setTimeout(() => {
        window.location.href = "orders.html";
      }, 900);
    } catch (err) {
      checkoutBtn.textContent = original;
      checkoutBtn.disabled = false;
      cdShowToast({ title: "Checkout failed", message: err.message, tone: "error" });
    }
  });

  window.cdOnSettingsSaved = () => loadBasket();

  cdInitNav("basket");
  loadBasket();
})();
