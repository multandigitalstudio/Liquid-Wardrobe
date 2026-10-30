// Mobile navigation
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    });
  });
}

// Scroll reveal animation
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

// Product carousel arrows
const productTrack = document.getElementById("productTrack");
const productPrev = document.getElementById("productPrev");
const productNext = document.getElementById("productNext");

if (productTrack && productPrev && productNext) {
  const scrollAmount = () => {
    const card = productTrack.querySelector(".product-card");
    return card ? card.getBoundingClientRect().width + 18 : 260;
  };

  productNext.addEventListener("click", () => {
    const atEnd = productTrack.scrollLeft + productTrack.clientWidth >= productTrack.scrollWidth - 8;
    productTrack.scrollTo({ left: atEnd ? 0 : productTrack.scrollLeft + scrollAmount(), behavior: "smooth" });
  });

  productPrev.addEventListener("click", () => {
    const atStart = productTrack.scrollLeft <= 8;
    productTrack.scrollTo({
      left: atStart ? productTrack.scrollWidth : Math.max(0, productTrack.scrollLeft - scrollAmount()),
      behavior: "smooth"
    });
  });
}

// Footer year
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();


// Show the tutorial placeholder until the client's video file is added.
const tutorialVideo = document.getElementById("tutorialVideo");
const videoPlaceholder = document.getElementById("videoPlaceholder");
if (tutorialVideo && videoPlaceholder) {
  const showVideo = () => { tutorialVideo.hidden = false; videoPlaceholder.hidden = true; };
  const showPlaceholder = () => { tutorialVideo.hidden = true; videoPlaceholder.hidden = false; };
  tutorialVideo.addEventListener("loadedmetadata", showVideo);
  tutorialVideo.addEventListener("error", showPlaceholder);
  // Try loading the video path; if it is not present, the placeholder remains visible.
  tutorialVideo.load();
}


// Simple browser-only review demo.
// Reviews are stored in localStorage on this device/browser, not shared online.
const reviewForm = document.getElementById("reviewForm");
const reviewList = document.getElementById("reviewList");
const averageRating = document.getElementById("averageRating");
const reviewCount = document.getElementById("reviewCount");
const ratingButtons = [...document.querySelectorAll(".rating-star")];
let selectedRating = 5;

function updateRatingPicker(value) {
  selectedRating = value;
  ratingButtons.forEach((button) => {
    const rating = Number(button.dataset.rating);
    const selected = rating <= value;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(rating === value));
  });
}
ratingButtons.forEach((button) => {
  button.addEventListener("click", () => updateRatingPicker(Number(button.dataset.rating)));
});

function readReviews() {
  try { return JSON.parse(localStorage.getItem("liquidWardrobeReviews") || "[]"); }
  catch { return []; }
}
function renderReviews() {
  if (!reviewList || !averageRating || !reviewCount) return;
  const reviews = readReviews();
  if (!reviews.length) {
    averageRating.textContent = "—";
    reviewCount.textContent = "No reviews yet";
    reviewList.innerHTML = '<div class="empty-reviews"><span>✦</span><h3>Your first review could be here</h3><p>Leave a rating and a few words about your experience.</p></div>';
    return;
  }
  const average = reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;
  averageRating.textContent = average.toFixed(1);
  reviewCount.textContent = `${reviews.length} review${reviews.length === 1 ? "" : "s"}`;
  reviewList.innerHTML = reviews.slice().reverse().map((item) => {
    const safeName = escapeReviewText(item.name);
    const safeText = escapeReviewText(item.text);
    const stars = "★".repeat(item.rating) + "☆".repeat(5 - item.rating);
    return `<article class="review-item"><div class="review-item-top"><h3>${safeName}</h3><span class="review-stars" aria-label="${item.rating} out of 5 stars">${stars}</span></div><p>${safeText}</p></article>`;
  }).join("");
}
function escapeReviewText(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[character]));
}
if (reviewForm) {
  reviewForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("reviewName").value.trim();
    const text = document.getElementById("reviewText").value.trim();
    if (!name || !text) return;
    const reviews = readReviews();
    reviews.push({ name, text, rating: selectedRating, date: new Date().toISOString() });
    try {
      localStorage.setItem("liquidWardrobeReviews", JSON.stringify(reviews));
      reviewForm.reset();
      updateRatingPicker(5);
      renderReviews();
    } catch {
      alert("This browser could not save the review. Please check browser storage settings.");
    }
  });
}
renderReviews();
