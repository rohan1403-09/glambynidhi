const bookingForm = document.querySelector("#booking-form");
const formMessage = document.querySelector("#form-message");
const bookingDate = document.querySelector("#booking-date");
const selectedOffer = document.querySelector("#selected-offer");
const selectedOfferName = document.querySelector("#selected-offer-name");
const cancelOffer = document.querySelector("#cancel-offer");
const serviceChoiceField = document.querySelector("#service-choice-field");
const homeOfferCards = document.querySelectorAll(".home-offer-card");
const homeOfferSelection = document.querySelector("#home-offer-selection");
const homeSelectedOfferName = document.querySelector("#home-selected-offer-name");
const bookHomeOffer = document.querySelector("#book-home-offer");
const bookHomeOfferAndService = document.querySelector("#book-home-offer-and-service");
const cancelHomeOffer = document.querySelector("#cancel-home-offer");

// Replace this with Nidhi's WhatsApp number: country code + number, with no + or spaces.
// Example for India: 919876543210
const nidhiWhatsAppNumber = "919871331161";

bookingDate.min = new Date().toISOString().split("T")[0];

const bookingParameters = new URLSearchParams(window.location.search);
let activeOffer = bookingParameters.get("offer");
const addAnotherService = bookingParameters.get("both") === "true";

function applyOfferToBooking(offer, includeAnotherService) {
  activeOffer = offer;
  selectedOfferName.textContent = offer;
  selectedOffer.hidden = false;
  serviceChoiceField.hidden = !includeAnotherService;
  serviceChoiceField.disabled = !includeAnotherService;
  document.querySelector("#booking").scrollIntoView({ behavior: "smooth", block: "start" });
}

if (activeOffer) {
  selectedOfferName.textContent = activeOffer;
  selectedOffer.hidden = false;

  if (!addAnotherService) {
    serviceChoiceField.hidden = true;
    serviceChoiceField.disabled = true;
  }
}

cancelOffer.addEventListener("click", () => {
  activeOffer = null;
  selectedOfferName.textContent = "";
  selectedOffer.hidden = true;
  serviceChoiceField.hidden = false;
  serviceChoiceField.disabled = false;
  bookingParameters.delete("offer");
  bookingParameters.delete("both");
  const cleanQuery = bookingParameters.toString();
  const cleanUrl = `${window.location.pathname}${cleanQuery ? `?${cleanQuery}` : ""}#booking`;
  window.history.replaceState({}, "", cleanUrl);
  homeOfferCards.forEach((card) => card.classList.remove("is-selected"));
  if (homeOfferSelection) homeOfferSelection.hidden = true;
});

homeOfferCards.forEach((card) => {
  card.addEventListener("click", () => {
    const offer = card.dataset.homeOffer;
    homeOfferCards.forEach((item) => item.classList.remove("is-selected"));
    card.classList.add("is-selected");
    homeSelectedOfferName.textContent = offer;
    homeOfferSelection.hidden = false;
  });
});

bookHomeOffer.addEventListener("click", () => {
  applyOfferToBooking(homeSelectedOfferName.textContent, false);
});

bookHomeOfferAndService.addEventListener("click", () => {
  applyOfferToBooking(homeSelectedOfferName.textContent, true);
});

cancelHomeOffer.addEventListener("click", () => {
  homeOfferCards.forEach((card) => card.classList.remove("is-selected"));
  homeSelectedOfferName.textContent = "";
  homeOfferSelection.hidden = true;
});

const hasWhatsAppNumber = () => !nidhiWhatsAppNumber.includes("X");

function openWhatsApp(message) {
  const url = new URL("https://api.whatsapp.com/send");
  url.searchParams.set("phone", nidhiWhatsAppNumber);
  url.searchParams.set("text", message);
  window.location.href = url.toString();
}

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!bookingForm.checkValidity()) {
    bookingForm.reportValidity();
    return;
  }

  if (!hasWhatsAppNumber()) {
    formMessage.textContent = "Add Nidhi's WhatsApp number in script.js first.";
    return;
  }

  const details = new FormData(bookingForm);
  const name = details.get("name").trim();
  const phone = details.get("phone");
  const address = details.get("address").trim();
  const service = details.get("service");
  const date = details.get("date");
  const time = details.get("time");
  const payment = details.get("payment");
  const bookingId = `GL-${Date.now().toString().slice(-6)}`;
  

  const bookingMessage = [
    "Hello Nidhi! I would like to make a booking.",
    "",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Address: ${address}`,
    ...(activeOffer ? [`Selected offer: ${activeOffer}`] : []),
    ...(service ? [`${activeOffer ? "Additional service" : "Service"}: ${service}`] : []),
    `Preferred date: ${date}`,
    `Preferred time: ${time}`,
    `Payment method: ${payment}`,
    "",
    "Please confirm availability. Thank you!"
  ].join("\n");

  formMessage.textContent = `Booking request for ${name} created. WhatsApp is opening—tap Send to notify Nidhi.`;
  openWhatsApp(bookingMessage);
  bookingForm.reset();
});
