/* ============================================================
   Cake Delight — API helper

   All browser requests go through the API Gateway.

   Features:
   - GET / POST / PUT / DELETE
   - Request timeout
   - Consistent error handling
   - Short-lived GET cache
   - Cache invalidation
============================================================ */

const cdCache = new Map();

// Cache GET requests for 15 seconds
const CD_CACHE_TTL = 15_000;

// Default request timeout: 15 seconds
const CD_DEFAULT_TIMEOUT = 15_000;


/* ============================================================
   GET / General Request
============================================================ */

async function cdFetch(url, options = {}) {
  const {
    useCache = false,
    timeout = CD_DEFAULT_TIMEOUT,
    ...fetchOpts
  } = options;


  /* ----------------------------------------------------------
     GET cache
  ---------------------------------------------------------- */

  const isGetRequest =
    !fetchOpts.method ||
    fetchOpts.method.toUpperCase() === "GET";

  if (useCache && isGetRequest) {
    const hit = cdCache.get(url);

    if (hit && Date.now() - hit.ts < CD_CACHE_TTL) {
      return hit.data;
    }

    // Remove expired cache
    if (hit) {
      cdCache.delete(url);
    }
  }


  /* ----------------------------------------------------------
     Abort controller / timeout
  ---------------------------------------------------------- */

  const controller = new AbortController();

  const timer = setTimeout(() => {
    controller.abort();
  }, timeout);


  let response;

  try {

    response = await fetch(url, {
      ...fetchOpts,
      signal: controller.signal,

      headers: {
        "Content-Type": "application/json",
        ...(fetchOpts.headers || {})
      }
    });

  } catch (err) {

    clearTimeout(timer);

    /* Request timed out */

    if (err.name === "AbortError") {
      let origin = url;

      try {
        origin = new URL(url).origin;
      } catch (e) {
        // Ignore invalid URL parsing
      }

      throw new Error(
        `Request timed out after ${timeout / 1000}s — is the API Gateway running at ${origin}?`
      );
    }


    /* Browser couldn't connect */

    if (err.name === "TypeError") {
      let origin = url;

      try {
        origin = new URL(url).origin;
      } catch (e) {
        // Ignore invalid URL parsing
      }

      throw new Error(
        `Couldn't reach ${origin}. Check that the API Gateway is running and CORS is enabled.`
      );
    }


    throw err;
  }


  clearTimeout(timer);


  /* ----------------------------------------------------------
     Read response
  ---------------------------------------------------------- */

  let body = null;

  const text = await response.text();

  if (text) {
    try {
      body = JSON.parse(text);
    } catch (e) {
      body = text;
    }
  }


  /* ----------------------------------------------------------
     HTTP error
  ---------------------------------------------------------- */

  if (!response.ok) {

    let message = `Request failed (${response.status})`;

    if (body && typeof body === "object") {

      message =
        body.message ||
        body.error ||
        message;

    } else if (typeof body === "string" && body.trim()) {

      message = body;
    }

    throw new Error(message);
  }


  /* ----------------------------------------------------------
     Save successful GET response in cache
  ---------------------------------------------------------- */

  if (useCache && isGetRequest) {
    cdCache.set(url, {
      ts: Date.now(),
      data: body
    });
  }


  return body;
}


/* ============================================================
   POST JSON
============================================================ */

function cdPostJSON(url, payload, options = {}) {

  return cdFetch(url, {
    ...options,

    method: "POST",

    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },

    body: JSON.stringify(payload)
  });
}


/* ============================================================
   PUT JSON
============================================================ */

function cdPutJSON(url, payload, options = {}) {

  return cdFetch(url, {
    ...options,

    method: "PUT",

    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },

    body: JSON.stringify(payload)
  });
}


/* ============================================================
   DELETE
============================================================ */

function cdDelete(url, options = {}) {

  return cdFetch(url, {
    ...options,
    method: "DELETE"
  });
}


/* ============================================================
   Cache invalidation
============================================================ */

function cdInvalidateCache(prefix = "") {

  for (const key of cdCache.keys()) {

    if (!prefix || key.startsWith(prefix)) {
      cdCache.delete(key);
    }

  }
}


/* ============================================================
   Clear entire cache
============================================================ */

function cdClearCache() {
  cdCache.clear();
}