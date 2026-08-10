// All browser requests go through Express Gateway.
const API_BASE = "http://localhost:8080";

async function request(url, options = {}) {
  try {
    const response = await fetch(API_BASE + url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });

    const text = await response.text();

    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!response.ok) {
      const errorMessage =
        data && typeof data === "object" && data.message
          ? data.message
          : typeof data === "string"
            ? data
            : `HTTP ${response.status}`;

      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    if (error.name === "TypeError") {
      throw new Error(
        "Cannot connect to API Gateway. Make sure Express Gateway is running on port 8080 and CORS is enabled."
      );
    }
    throw error;
  }
}
