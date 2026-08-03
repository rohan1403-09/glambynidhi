const reviewsList = document.querySelector("#reviews-list");
const reviewsAverage = document.querySelector("#reviews-average");
const reviewsSummaryStars = document.querySelector("#reviews-summary-stars");
const reviewsCount = document.querySelector("#reviews-count");
const reviewsSummary = document.querySelector("#reviews-summary");
const heroRating = document.querySelector("#hero-rating");
const reviewForm = document.querySelector("#review-form");
const reviewMessage = document.querySelector("#review-message");
const reviewSubmit = reviewForm.querySelector('button[type="submit"]');

const API_BASE = window.location.origin;

function formatReviewDate(dateStr) {
  const normalized = String(dateStr).includes("T") ? dateStr : String(dateStr).replace(" ", "T");
  return new Date(normalized).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function starsHtml(rating, className = "review-card__stars") {
  const filled = "★".repeat(rating);
  const empty = "☆".repeat(5 - rating);
  return `<span class="${className}" aria-label="${rating} out of 5 stars">${filled}${empty}</span>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderReviews(reviews) {
  if (!reviews.length) {
    reviewsList.innerHTML = `<p class="reviews__empty">No reviews yet. Be the first to share your experience below.</p>`;
    return;
  }

  reviewsList.innerHTML = reviews
    .map(
      (review) => `
        <article class="review-card glass">
          ${starsHtml(review.rating)}
          <blockquote>${escapeHtml(review.text)}</blockquote>
          <footer>
            <strong>${escapeHtml(review.name)}</strong>
            ${review.service ? `<span>${escapeHtml(review.service)}</span>` : ""}
            <time datetime="${review.date}">${formatReviewDate(review.date)}</time>
          </footer>
        </article>
      `
    )
    .join("");
}

function updateSummary(reviews) {
  const count = reviews.length;

  if (!count) {
    reviewsAverage.textContent = "—";
    reviewsSummaryStars.textContent = "☆☆☆☆☆";
    reviewsCount.textContent = "No reviews yet";
    if (reviewsSummary) reviewsSummary.hidden = false;
    if (heroRating) heroRating.textContent = "—";
    return;
  }

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / count;
  const rounded = average.toFixed(1);
  const starCount = Math.round(average);

  reviewsAverage.textContent = rounded;
  reviewsSummaryStars.textContent = "★".repeat(starCount) + "☆".repeat(5 - starCount);
  reviewsCount.textContent = count === 1 ? "Based on 1 review" : `Based on ${count} reviews`;
  if (reviewsSummary) reviewsSummary.hidden = false;
  if (heroRating) heroRating.textContent = rounded;
}

function setLoadingState(isLoading) {
  reviewSubmit.disabled = isLoading;
  reviewSubmit.textContent = isLoading ? "Submitting…" : "Submit review ↗";
}

async function loadReviewsFromServer() {
  reviewsList.innerHTML = `<p class="reviews__empty reviews__loading">Loading reviews…</p>`;

  try {
    const response = await fetch(`${API_BASE}/api/reviews`);
    if (!response.ok) throw new Error("Failed to load reviews");

    const reviews = await response.json();
    renderReviews(reviews);
    updateSummary(reviews);
    return reviews;
  } catch {
    reviewsList.innerHTML = `<p class="reviews__empty reviews__error">Could not load reviews. Make sure the site server is running, then refresh.</p>`;
    reviewMessage.textContent = "";
    return [];
  }
}

let reviews = [];

loadReviewsFromServer().then((loaded) => {
  reviews = loaded;
});

reviewForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = new FormData(reviewForm);
  const name = data.get("reviewer-name").trim();
  const service = data.get("review-service").trim();
  const rating = Number(data.get("rating"));
  const text = data.get("review-text").trim();

  if (!name || !rating || text.length < 10) {
    reviewMessage.textContent = "Please fill in your name, rating, and a review of at least 10 characters.";
    return;
  }

  setLoadingState(true);
  reviewMessage.textContent = "";

  try {
    const response = await fetch(`${API_BASE}/api/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, service, rating, text })
    });

    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Could not save review");

    reviews = [payload, ...reviews];
    renderReviews(reviews);
    updateSummary(reviews);
    reviewForm.reset();
    reviewMessage.textContent = "Thank you! Your review has been added.";
  } catch (error) {
    reviewMessage.textContent = error.message || "Could not save your review. Please try again.";
  } finally {
    setLoadingState(false);
  }
});
