/* ============================================================
   Cake Delight — Service Configuration

   Everything goes through one API Gateway.

   Docker Compose:
      Frontend
          ↓
      API Gateway :8080
          ↓
      ┌───────────────┬───────────────┬───────────────┐
      ↓               ↓               ↓               ↓
   Catalog        Order/Basket      Rating       Notification

   The Order Service handles both:
      /api/orders/*
      /api/basket/*

   Change the Gateway URL from the Settings icon.
============================================================ */


/* ============================================================
   Default configuration
============================================================ */

const CD_DEFAULT_CONFIG = {
  gateway: "http://localhost:8080"
};


/* ============================================================
   LocalStorage keys
============================================================ */

const CD_CONFIG_KEY = "cd_gateway_config";

// Kept only for compatibility with older versions
const CD_LEGACY_CONFIG_KEY = "cd_service_config";


/* ============================================================
   Remove trailing slash
============================================================ */

function cdNormalizeGateway(url) {

  return String(url || "")
    .trim()
    .replace(/\/+$/, "");
}


/* ============================================================
   Get current configuration
============================================================ */

function cdGetConfig() {

  let gateway = CD_DEFAULT_CONFIG.gateway;


  try {

    const stored =
      JSON.parse(
        localStorage.getItem(CD_CONFIG_KEY)
      );


    if (
      stored &&
      typeof stored === "object" &&
      stored.gateway
    ) {

      gateway = cdNormalizeGateway(
        stored.gateway
      );
    }

  } catch (error) {

    // Ignore invalid localStorage data
    gateway = CD_DEFAULT_CONFIG.gateway;
  }


  /*
    All services use the same API Gateway.

    Catalog:
      /api/catalog/*

    Basket:
      /api/basket/*
      handled by Order Service

    Orders:
      /api/orders/*
      handled by Order Service

    Rating:
      /api/ratings/*

    Notification:
      /api/notifications/*
  */

  return {

    gateway: gateway,

    catalog: gateway,

    basket: gateway,

    order: gateway,

    rating: gateway,

    notification: gateway
  };
}


/* ============================================================
   Save configuration
============================================================ */

function cdSaveConfig(next) {

  const gateway = cdNormalizeGateway(
    next && next.gateway
      ? next.gateway
      : CD_DEFAULT_CONFIG.gateway
  );


  localStorage.setItem(
    CD_CONFIG_KEY,
    JSON.stringify({
      gateway: gateway
    })
  );


  // Remove old multi-service configuration
  localStorage.removeItem(
    CD_LEGACY_CONFIG_KEY
  );
}


/* ============================================================
   Reset configuration
============================================================ */

function cdResetConfig() {

  localStorage.removeItem(
    CD_CONFIG_KEY
  );

  localStorage.removeItem(
    CD_LEGACY_CONFIG_KEY
  );
}


/* ============================================================
   Get default Gateway URL
============================================================ */

function cdGetDefaultGateway() {

  return CD_DEFAULT_CONFIG.gateway;
}