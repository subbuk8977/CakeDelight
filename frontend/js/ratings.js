async function loadRatings() {
  const cakeId = document.getElementById("ratingCakeId").value.trim();

  if (!cakeId) {
    showMessage("Enter a cake ID.", "error");
    return;
  }

  try {
    const [average, ratings] = await Promise.all([
      request(`/api/ratings/${encodeURIComponent(cakeId)}/average`),
      request(`/api/ratings/${encodeURIComponent(cakeId)}`)
    ]);

    renderAverage(average);
    renderRatings(ratings);

    showMessage("Ratings loaded successfully.");
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function getAverageValue(data) {
  if (typeof data === "number") return data;
  return Number(
    data?.average ??
    data?.averageRating ??
    data?.rating ??
    data?.data?.average ??
    data?.data?.averageRating ??
    0
  );
}

function renderAverage(data) {
  const average = getAverageValue(data);

  document.getElementById("averageValue").textContent =
    average ? average.toFixed(1) : "-";

  const rounded = Math.round(average);

  document.getElementById("averageStars").textContent =
    "★★★★★".split("").map((_, index) =>
      index < rounded ? "★" : "☆"
    ).join("");
}

function renderRatings(data) {
  let ratings;

  if (Array.isArray(data)) {
    ratings = data;
  } else if (Array.isArray(data?.ratings)) {
    ratings = data.ratings;
  } else if (Array.isArray(data?.data)) {
    ratings = data.data;
  } else {
    ratings = [];
  }

  const container = document.getElementById("ratingsList");

  if (!ratings.length) {
    container.innerHTML = `<p>No ratings found.</p>`;
    return;
  }

  container.innerHTML = ratings.map(rating => `
    <div class="rating-item">
      <div class="rating-stars">
        ${"★★★★★".slice(0, Number(rating.rating || 0))}
      </div>
      <p>${escapeHtml(rating.comment || rating.review || "No comment")}</p>
      <small>User: ${escapeHtml(rating.userId || "Unknown")}</small>
    </div>
  `).join("");
}

async function submitRating() {
  const userId = getUserId();
  const cakeId = document.getElementById("ratingCakeId").value.trim();
  const rating = Number(document.getElementById("ratingValue").value);
  const comment = document.getElementById("ratingComment").value.trim();

  if (!cakeId) {
    showMessage("Enter a cake ID.", "error");
    return;
  }

  try {
    await request("/api/ratings", {
      method: "POST",
      body: JSON.stringify({
        userId,
        cakeId,
        score: rating,
        comment
      })
    });

    showMessage("Rating submitted successfully.");
    document.getElementById("ratingComment").value = "";

    await loadRatings();
  } catch (error) {
    showMessage(error.message, "error");
  }
}
