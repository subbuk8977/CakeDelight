/* ============================================================
   Cake Delight — toast notifications
   ============================================================ */
function cdEnsureToastRoot() {
  let root = document.getElementById("cd-toast-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "cd-toast-root";
    root.className = "cd-toast-root";
    document.body.appendChild(root);
  }
  return root;
}

function cdShowToast({ title, message, tone = "success", duration = 6000 }) {
  const root = cdEnsureToastRoot();
  const toast = document.createElement("div");
  toast.className = `cd-toast cd-toast--${tone}`;
  toast.innerHTML = `
    <div class="cd-toast__ribbon"></div>
    <div class="cd-toast__body">
      <p class="cd-toast__title">${title}</p>
      <p class="cd-toast__message">${message}</p>
    </div>
    <button class="cd-toast__close" aria-label="Dismiss">&times;</button>
  `;
  root.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("cd-toast--visible"));

  let timer = setTimeout(() => dismiss(), duration);
  toast.addEventListener("mouseenter", () => clearTimeout(timer));
  toast.addEventListener("mouseleave", () => {
    timer = setTimeout(() => dismiss(), 2000);
  });
  toast.querySelector(".cd-toast__close").addEventListener("click", dismiss);

  function dismiss() {
    toast.classList.remove("cd-toast--visible");
    toast.classList.add("cd-toast--leaving");
    setTimeout(() => toast.remove(), 350);
  }
}
