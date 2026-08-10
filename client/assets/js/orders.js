/* ============================================================
   Cake Delight — orders page
   ============================================================ */
(function () {
  const list = document.getElementById("cd-orders-list");
  const errorBanner = document.getElementById("cd-error-banner");
  const THUMB_FALLBACK =
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=160&q=70&auto=format&fit=crop";

  function showError(message) {
    errorBanner.style.display = message ? "block" : "none";
    errorBanner.querySelector(".cd-error-banner__inner").textContent = message || "";
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
  }

  function formatDate(iso) {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return iso;
    }
  }

  function statusStyle(status) {
    const s = (status || "").toUpperCase();
    if (s === "CONFIRMED") return "background:#e4ecdd; color:#7f9a6c;";
    if (s === "CANCELLED") return "background:#fbeaee; color:#9e3453;";
    return "background:#f3ead0; color:#8a6d1f;";
  }

  function skeletonTickets() {
    list.innerHTML = Array.from({ length: 2 })
      .map(() => `<div class="cd-skeleton" style="height:220px; border-radius:14px;"></div>`)
      .join("");
  }

  function renderEmpty() {
    list.innerHTML = `
      <div class="cd-empty-state">
        <div class="cd-empty-state__icon">🧾</div>
        <h3>No orders yet</h3>
        <p>Once you checkout from your basket, your receipts will show up here.</p>
        <a href="index.html" class="cd-btn cd-btn--primary">Browse the catalog</a>
      </div>`;
  }

  function starsInput(cakeId, currentScore) {
    let html = `<span class="cd-stars" data-rate-stars data-cake-id="${cakeId}">`;
    for (let i = 1; i <= 5; i++) {
      html += `<span data-score="${i}" style="${i <= currentScore ? "" : "opacity:.35;"}">★</span>`;
    }
    html += `</span>`;
    return html;
  }

  function renderOrders(orders) {
    if (orders.length === 0) {
      renderEmpty();
      return;
    }
    list.innerHTML = orders
      .map((order) => {
        const items = order.items || [];
        return `
        <article class="cd-ticket" data-order-id="${order._id}">
          <div class="cd-ticket__header">
            <div>
              <div class="cd-ticket__id">ORDER #${order._id.slice(-8).toUpperCase()}</div>
              <div class="cd-ticket__date">${formatDate(order.createdAt)}</div>
            </div>
            <span class="cd-ticket__status" style="${statusStyle(order.status)}">${escapeHtml(order.status || "PENDING")}</span>
          </div>
          <div class="cd-ticket__items">
            ${items
              .map(
                (item) => `
              <div class="cd-ticket-item" data-cake-id="${item.cakeId}">
                <img class="cd-ticket-item__thumb" src="${THUMB_FALLBACK}" alt="" />
                <div>
                  <p class="cd-ticket-item__name">${escapeHtml(item.name)}</p>
                  <p class="cd-ticket-item__meta">Qty ${item.quantity} · ₹${item.price.toFixed(2)} each</p>
                  <div class="cd-rate-row">
                    <span class="cd-rate-label">Rate this cake:</span>
                    ${starsInput(item.cakeId, 0)}
                    <span class="cd-rate-saved" data-rate-saved style="display:none;">Saved ✓</span>
                  </div>
                </div>
                <div class="cd-ticket-item__price">₹${(item.price * item.quantity).toFixed(2)}</div>
              </div>`
              )
              .join("")}
          </div>
          <div class="cd-ticket__footer">
            <span style="color:var(--cocoa-soft); font-size:.85rem;">${items.length} item${items.length === 1 ? "" : "s"}</span>
            <span class="cd-ticket__total">₹${order.totalAmount.toFixed(2)}</span>
          </div>
        </article>`;
      })
      .join("");

    wireRatingWidgets(orders);
  }

  function wireRatingWidgets(orders) {
    // pick up an existing rating (if any) for each unique cakeId owned by this user
    const uniqueCakeIds = [
      ...new Set(orders.flatMap((o) => (o.items || []).map((i) => i.cakeId))),
    ];
    prefillExistingRatings(uniqueCakeIds);

    list.querySelectorAll("[data-rate-stars]").forEach((starGroup) => {
      const cakeId = starGroup.dataset.cakeId;
      starGroup.querySelectorAll("span[data-score]").forEach((starEl) => {
        starEl.addEventListener("click", () => submitRating(cakeId, Number(starEl.dataset.score)));
        starEl.addEventListener("mouseenter", () => previewStars(starGroup, Number(starEl.dataset.score)));
      });
      starGroup.addEventListener("mouseleave", () => {
        const saved = Number(starGroup.dataset.savedScore || 0);
        previewStars(starGroup, saved);
      });
    });
  }

  function previewStars(starGroup, score) {
    starGroup.querySelectorAll("span[data-score]").forEach((el) => {
      el.style.opacity = Number(el.dataset.score) <= score ? "1" : ".35";
    });
  }

  async function prefillExistingRatings(cakeIds) {
    const cfg = cdGetConfig();
    const userId = cdGetUserId();
    await Promise.allSettled(
      cakeIds.map(async (cakeId) => {
        try {
          const res = await cdFetch(`${cfg.rating}/api/ratings/${cakeId}`, { timeout: 15000 });
          const mine = (res.data || []).find((r) => r.userId === userId);
          if (!mine) return;
          list.querySelectorAll(`[data-rate-stars][data-cake-id="${cakeId}"]`).forEach((starGroup) => {
            starGroup.dataset.savedScore = mine.score;
            previewStars(starGroup, mine.score);
            const savedLabel = starGroup.closest(".cd-rate-row").querySelector("[data-rate-saved]");
            savedLabel.style.display = "inline";
          });
        } catch (e) {
          /* rating service unreachable for this cake — leave stars empty, non-blocking */
        }
      })
    );
  }

  async function submitRating(cakeId, score) {
    const cfg = cdGetConfig();
    try {
      await cdPostJSON(`${cfg.rating}/api/ratings`, { cakeId, userId: cdGetUserId(), score });
      cdInvalidateCache(cfg.rating);
      list.querySelectorAll(`[data-rate-stars][data-cake-id="${cakeId}"]`).forEach((starGroup) => {
        starGroup.dataset.savedScore = score;
        previewStars(starGroup, score);
        const savedLabel = starGroup.closest(".cd-rate-row").querySelector("[data-rate-saved]");
        savedLabel.style.display = "inline";
      });
      cdShowToast({ title: "Rating saved", message: `You rated this cake ${score}/5. Thanks for the feedback!`, tone: "success", duration: 3000 });
    } catch (err) {
      cdShowToast({ title: "Couldn't save rating", message: err.message, tone: "error" });
    }
  }

  async function loadOrders() {
    skeletonTickets();
    showError("");
    try {
      const cfg = cdGetConfig();
      const res = await cdFetch(`${cfg.order}/api/orders/${cdGetUserId()}`, { timeout: 15000 });
      renderOrders(res.data || []);
    } catch (err) {
      list.innerHTML = "";
      showError(`Couldn't load your orders: ${err.message}`);
    }
  }

  window.cdOnSettingsSaved = () => loadOrders();

  cdInitNav("orders");
  loadOrders();
})();
