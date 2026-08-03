const reviewForm = document.querySelector("#review-form");
const reviewsList = document.querySelector("#reviews-list");
const reviewsAverage = document.querySelector("#reviews-average");
const reviewsSummaryStars = document.querySelector("#reviews-summary-stars");
const reviewsCount = document.querySelector("#reviews-count");
const reviewMessage = document.querySelector("#review-message");
const localReviewKey = "glow-by-nidhi-reviews";

function getSavedReviews() {
  try {
    return JSON.parse(localStorage.getItem(localReviewKey)) || [];
  } catch {
    return [];
  }
}

function saveReviews(reviews) {
  localStorage.setItem(localReviewKey, JSON.stringify(reviews));
}

function stars(rating) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Recently" : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function renderReviews(reviews) {
  reviewsList.replaceChildren();

  if (!reviews.length) {
    const empty = document.createElement("p");
    empty.className = "reviews__empty";
    empty.textContent = "No reviews yet. Be the first to share your Glow by Nidhi experience.";
    reviewsList.append(empty);
    reviewsAverage.textContent = "—";
    reviewsSummaryStars.textContent = "☆☆☆☆☆";
    reviewsCount.textContent = "No reviews yet";
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
  const average = totalRating / reviews.length;
  reviewsAverage.textContent = average.toFixed(1);
  reviewsSummaryStars.textContent = stars(Math.round(average));
  reviewsCount.textContent = `${reviews.length} review${reviews.length === 1 ? "" : "s"}`;

  reviews.forEach((review) => {
    const card = document.createElement("article");
    card.className = "review-card glass";

    const rating = document.createElement("div");
    rating.className = "review-card__stars";
    rating.textContent = stars(Number(review.rating));
    rating.setAttribute("aria-label", `${review.rating} out of 5 stars`);

    const quote = document.createElement("blockquote");
    quote.textContent = `“${review.text || review.review}”`;

    const footer = document.createElement("footer");
    const name = document.createElement("strong");
    name.textContent = review.name;
    const service = document.createElement("span");
    service.textContent = review.service || "Glow by Nidhi client";
    const date = document.createElement("time");
    date.textContent = formatDate(review.date || review.created_at);
    footer.append(name, service, date);

    card.append(rating, quote, footer);
    reviewsList.append(card);
  });
}

async function loadReviews() {
  reviewsList.innerHTML = '<p class="reviews__empty reviews__loading">Loading client reviews…</p>';

  try {
    const response = await fetch("/api/reviews");
    if (!response.ok) throw new Error("Reviews API is unavailable");
    const reviews = await response.json();
    renderReviews(reviews);
  } catch {
    renderReviews(getSavedReviews());
  }
}

reviewForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!reviewForm.checkValidity()) {
    reviewForm.reportValidity();
    return;
  }

  const formData = new FormData(reviewForm);
  const review = {
    id: Date.now(),
    name: formData.get("reviewer-name").trim(),
    service: formData.get("review-service"),
    rating: Number(formData.get("rating")),
    text: formData.get("review-text").trim(),
    date: new Date().toISOString()
  };

  const submitButton = reviewForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  reviewMessage.textContent = "Saving your review…";

  try {
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(review)
    });
    if (!response.ok) throw new Error("Reviews API is unavailable");

    reviewMessage.textContent = "Thank you—your review is now visible.";
    reviewForm.reset();
    await loadReviews();
  } catch {
    const reviews = getSavedReviews();
    reviews.unshift(review);
    saveReviews(reviews);
    renderReviews(reviews);
    reviewForm.reset();
    reviewMessage.textContent = "Thank you—your review is now visible on this device.";
  } finally {
    submitButton.disabled = false;
  }
});

loadReviews();
