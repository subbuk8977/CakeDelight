/* ============================================================
   Cake Delight — shared navbar behavior
   Expects markup with: #cd-user-chip, #cd-basket-count,
   #cd-settings-btn, #cd-settings-modal (+ its inputs/buttons)
   ============================================================ */

function cdInitNav(activePage) {
  cdEnsureUserId();
  cdRenderUserChip();
  cdRefreshBasketCount();
  cdWireUserChip();
  cdWireSettingsModal();
  cdHighlightNav(activePage);
}

function cdHighlightNav(activePage) {
  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (link.dataset.nav === activePage) link.classList.add("is-active");
  });
}

function cdRenderUserChip() {
  const chip = document.getElementById("cd-user-chip");
  if (chip) chip.textContent = cdGetUserId();
}

function cdWireUserChip() {
  const chip = document.getElementById("cd-user-chip");
  if (!chip) return;
  chip.addEventListener("click", () => {
    const next = prompt("Your baker ID (used across basket, orders & ratings):", cdGetUserId());
    if (next && next.trim()) {
      cdSetUserId(next);
      cdRenderUserChip();
      cdRefreshBasketCount();
      cdShowToast({
        title: "Switched baker ID",
        message: `Now browsing as "${next.trim()}".`,
        tone: "info",
        duration: 3000,
      });
    }
  });
}

async function cdRefreshBasketCount() {
  const badge = document.getElementById("cd-basket-count");
  if (!badge) return;
  try {
    const cfg = cdGetConfig();
    const userId = cdGetUserId();
    const res = await cdFetch(`${cfg.basket}/api/basket/${userId}`, { timeout: 5000 });
    const items = (res && res.data && res.data.items) || [];
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    badge.textContent = count;
    badge.style.display = count > 0 ? "inline-flex" : "none";
  } catch (e) {
    badge.style.display = "none";
  }
}

function cdWireSettingsModal() {
  const btn = document.getElementById("cd-settings-btn");
  const modal = document.getElementById("cd-settings-modal");
  if (!btn || !modal) return;

  const closeBtn = modal.querySelector("[data-close-modal]");
  const form = modal.querySelector("form");
  const gatewayInput = modal.querySelector("#cfg-gateway");

  function open() {
    const cfg = cdGetConfig();
    gatewayInput.value = cfg.gateway;
    modal.classList.add("is-open");
  }
  function close() {
    modal.classList.remove("is-open");
  }

  btn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const next = { gateway: gatewayInput.value.trim().replace(/\/$/, "") };
    cdSaveConfig(next);
    cdInvalidateCache();
    close();
    cdShowToast({
      title: "Settings saved",
      message: "Service URLs updated. Reloading fresh data now.",
      tone: "info",
      duration: 3000,
    });
    cdRefreshBasketCount();
    if (typeof window.cdOnSettingsSaved === "function") window.cdOnSettingsSaved();
  });

  modal.querySelector("[data-reset-config]").addEventListener("click", () => {
    cdResetConfig();
    open();
  });
}
