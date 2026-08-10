/* ============================================================
   Cake Delight — user identity
   Your services take a userId but there's no auth/login route,
   so we keep a simple baker name/ID in localStorage and send it
   with every basket/order/rating call.
   ============================================================ */
const CD_USER_KEY = "cd_user_id";

function cdGetUserId() {
  return localStorage.getItem(CD_USER_KEY);
}

function cdSetUserId(id) {
  localStorage.setItem(CD_USER_KEY, id.trim());
}

function cdEnsureUserId() {
  let id = cdGetUserId();
  if (!id) {
    id = "baker-" + Math.random().toString(36).slice(2, 8);
    cdSetUserId(id);
  }
  return id;
}
