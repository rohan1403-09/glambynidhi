const offerCards = document.querySelectorAll(".offer-card");
const selectionPanel = document.querySelector("#offer-selection");
const chosenOfferName = document.querySelector("#chosen-offer-name");
const bookingLink = document.querySelector("#book-chosen-offer");
const offerAndServiceLink = document.querySelector("#book-offer-and-service");
const cancelSelection = document.querySelector("#cancel-offer-selection");

offerCards.forEach((card) => {
  card.addEventListener("click", () => {
    const offer = card.dataset.offer;

    offerCards.forEach((item) => item.classList.remove("is-selected"));
    card.classList.add("is-selected");
    chosenOfferName.textContent = offer;
    bookingLink.href = `index.html?offer=${encodeURIComponent(offer)}#booking`;
    offerAndServiceLink.href = `index.html?offer=${encodeURIComponent(offer)}&both=true#services`;
    selectionPanel.hidden = false;
    selectionPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
});

cancelSelection.addEventListener("click", () => {
  offerCards.forEach((card) => card.classList.remove("is-selected"));
  chosenOfferName.textContent = "";
  bookingLink.href = "index.html#booking";
  offerAndServiceLink.href = "index.html#services";
  selectionPanel.hidden = true;
});
