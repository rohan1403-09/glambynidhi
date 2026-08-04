const bookingForm = document.querySelector("#booking-form");
const formMessage = document.querySelector("#form-message");
const bookingDate = document.querySelector("#booking-date");
const selectedOffer = document.querySelector("#selected-offer");
const selectedOfferName = document.querySelector("#selected-offer-name");
const cancelOffer = document.querySelector("#cancel-offer");
const selectedService = document.querySelector("#selected-service");
const selectedServiceName = document.querySelector("#selected-service-name");
const cancelService = document.querySelector("#cancel-service");
const serviceCards = document.querySelectorAll(".service-card");
const serviceSelection = document.querySelector("#service-selection");
const selectedServiceCardName = document.querySelector("#selected-service-card-name");
const bookSelectedService = document.querySelector("#book-selected-service");
const bookServiceAndOffer = document.querySelector("#book-service-and-offer");
const cancelServiceCard = document.querySelector("#cancel-service-card");
const homeOfferCards = document.querySelectorAll(".home-offer-card");
const homeOfferSelection = document.querySelector("#home-offer-selection");
const homeSelectedOfferName = document.querySelector("#home-selected-offer-name");
const bookHomeOffer = document.querySelector("#book-home-offer");
const bookHomeOfferAndService = document.querySelector("#book-home-offer-and-service");
const cancelHomeOffer = document.querySelector("#cancel-home-offer");
const bookingTotal = document.querySelector("#booking-total");
const advanceAmount = document.querySelector("#advance-amount");
const remainingAmount = document.querySelector("#remaining-amount");
const payAdvance = document.querySelector("#pay-advance");
const paymentScreenshot = document.querySelector("#payment-screenshot");
const sendBooking = document.querySelector("#send-booking");
const upiPaymentModal = document.querySelector("#upi-payment-modal");
const upiQrCode = document.querySelector("#upi-qr-code");
const upiQrAmount = document.querySelector("#upi-qr-amount");
const closeUpiPayment = document.querySelector("#close-upi-payment");
const themeToggle = document.querySelector("#theme-toggle");

const nidhiWhatsAppNumber = "919871331161";
const nidhiPaytmUpiId = "8368330997@ptyes";
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const bookingParameters = new URLSearchParams(window.location.search);
const knownOfferPrices = {
  "Vitamin C Facial": 1500,
  "Astaberry Whitening & Brightening Facial": 900,
  "Aroma Bridal Glow Facial": 1000,
  "Lotus Whitening Facial": 1150,
  "O3+ Whitening & Brightening Facial": 2000
};

let activeOffer = null;
let activeService = null;
let needsAdditionalService = bookingParameters.get("both") === "true";
let paymentWasStarted = false;
let paymentReference = "";
let serviceFirstOfferMode = false;

function setTheme(theme) {
  document.body.dataset.theme = theme;
  themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
  themeToggle.innerHTML = theme === "dark" ? "☀ <span>Light</span>" : "☾ <span>Dark</span>";
}

try {
  setTheme(localStorage.getItem("glow-theme") === "dark" ? "dark" : "light");
} catch {
  setTheme("light");
}

themeToggle.addEventListener("click", () => {
  const theme = document.body.dataset.theme === "dark" ? "light" : "dark";
  setTheme(theme);
  try {
    localStorage.setItem("glow-theme", theme);
  } catch {
    // The theme still changes if browser storage is unavailable.
  }
});

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.body.classList.add("motion-ready");
  const sectionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".hero, .services, .home-offers, .about, .reviews, .instagram-showcase, .booking").forEach((section) => {
    section.classList.add("animate-on-scroll");
    sectionObserver.observe(section);
  });
}

bookingDate.min = new Date().toISOString().split("T")[0];

function cleanOfferName(value) {
  return String(value || "").replace(/\s*[—-]\s*₹?\s*[\d,]+\s*$/, "").trim();
}

function offerFromValue(value, price) {
  const name = cleanOfferName(value);
  const priceFromText = Number(String(value || "").match(/₹\s*([\d,]+)/)?.[1]?.replace(/,/g, ""));
  return { name, price: Number(price) || knownOfferPrices[name] || priceFromText || 0 };
}

function getTotal() {
  return (activeOffer?.price || 0) + (activeService?.price || 0);
}

function resetPaymentStep() {
  paymentWasStarted = false;
  paymentReference = "";
  paymentScreenshot.value = "";
  paymentScreenshot.disabled = true;
  sendBooking.disabled = true;
}

function updateHomeOfferActions() {
  bookHomeOffer.textContent = serviceFirstOfferMode ? "Book service + this offer ↗" : "Book this offer ↗";
  bookHomeOfferAndService.hidden = serviceFirstOfferMode;
}

function updatePaymentSummary() {
  const total = getTotal();
  const advance = Math.ceil(total / 2);
  const remaining = total - advance;
  const selectionIsComplete = total > 0 && !(needsAdditionalService && !activeService);

  bookingTotal.textContent = total ? money.format(total) : "Select a service or offer";
  advanceAmount.textContent = selectionIsComplete ? money.format(advance) : "—";
  remainingAmount.textContent = selectionIsComplete ? money.format(remaining) : "—";
  payAdvance.disabled = !selectionIsComplete;
}

function updateBookingSelection() {
  if (activeOffer) {
    selectedOfferName.textContent = `${activeOffer.name} — ${money.format(activeOffer.price)}`;
    selectedOffer.hidden = false;
  } else {
    selectedOfferName.textContent = "";
    selectedOffer.hidden = true;
  }

  if (activeService) {
    selectedServiceName.textContent = `${activeService.name} — ${money.format(activeService.price)}`;
    selectedService.hidden = false;
  } else {
    selectedServiceName.textContent = "";
    selectedService.hidden = true;
  }

  updatePaymentSummary();
}

function scrollToBooking() {
  document.querySelector("#booking").scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateOfferUrl() {
  if (activeOffer) {
    bookingParameters.set("offer", activeOffer.name);
  } else {
    bookingParameters.delete("offer");
  }

  if (needsAdditionalService) {
    bookingParameters.set("both", "true");
  } else {
    bookingParameters.delete("both");
  }

  const query = bookingParameters.toString();
  window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
}

function selectOffer(offer, withAnotherService) {
  resetPaymentStep();
  activeOffer = offer;
  needsAdditionalService = withAnotherService;
  serviceFirstOfferMode = false;
  updateHomeOfferActions();

  if (!withAnotherService) {
    activeService = null;
    serviceCards.forEach((card) => card.classList.remove("is-selected"));
    if (serviceSelection) serviceSelection.hidden = true;
  }

  updateBookingSelection();
  updateOfferUrl();

  if (withAnotherService && !activeService) {
    formMessage.textContent = "Now choose the additional service above, then continue to booking.";
    document.querySelector("#services").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  scrollToBooking();
}

function clearOffer() {
  resetPaymentStep();
  activeOffer = null;
  needsAdditionalService = false;
  serviceFirstOfferMode = false;
  updateHomeOfferActions();
  homeOfferCards.forEach((card) => card.classList.remove("is-selected"));
  if (homeOfferSelection) homeOfferSelection.hidden = true;
  updateBookingSelection();
  updateOfferUrl();
}

function clearService() {
  resetPaymentStep();
  activeService = null;
  serviceFirstOfferMode = false;
  updateHomeOfferActions();
  serviceCards.forEach((card) => card.classList.remove("is-selected"));
  if (serviceSelection) serviceSelection.hidden = true;
  updateBookingSelection();
}

const initialOffer = bookingParameters.get("offer");
if (initialOffer) {
  activeOffer = offerFromValue(initialOffer);
  updateBookingSelection();
  if (needsAdditionalService) {
    formMessage.textContent = "Choose the additional service above to complete this offer booking.";
  }
}

serviceCards.forEach((card) => {
  card.addEventListener("click", () => {
    resetPaymentStep();
    activeService = { name: card.dataset.service, price: Number(card.dataset.price) };
    needsAdditionalService = false;
    serviceFirstOfferMode = false;
    updateHomeOfferActions();
    serviceCards.forEach((item) => item.classList.remove("is-selected"));
    card.classList.add("is-selected");
    selectedServiceCardName.textContent = `${activeService.name} — ${money.format(activeService.price)}`;
    serviceSelection.hidden = false;
    updateBookingSelection();
    updateOfferUrl();
  });
});

bookSelectedService.addEventListener("click", () => {
  serviceSelection.hidden = true;
  scrollToBooking();
});

bookServiceAndOffer.addEventListener("click", () => {
  serviceFirstOfferMode = true;
  updateHomeOfferActions();
  serviceSelection.hidden = true;
  formMessage.textContent = "Now select an offer to add to your chosen service.";
  document.querySelector("#offers").scrollIntoView({ behavior: "smooth", block: "start" });
});

cancelServiceCard.addEventListener("click", clearService);
cancelService.addEventListener("click", clearService);
cancelOffer.addEventListener("click", clearOffer);

homeOfferCards.forEach((card) => {
  card.addEventListener("click", () => {
    homeOfferCards.forEach((item) => item.classList.remove("is-selected"));
    card.classList.add("is-selected");
    homeSelectedOfferName.textContent = `${card.dataset.homeOffer} — ${money.format(Number(card.dataset.price))}`;
    homeOfferSelection.hidden = false;
  });
});

bookHomeOffer.addEventListener("click", () => {
  const card = document.querySelector(".home-offer-card.is-selected");
  if (card) {
    const includeSelectedService = serviceFirstOfferMode && Boolean(activeService);
    selectOffer(offerFromValue(card.dataset.homeOffer, card.dataset.price), includeSelectedService);
  }
});

bookHomeOfferAndService.addEventListener("click", () => {
  const card = document.querySelector(".home-offer-card.is-selected");
  if (card) selectOffer(offerFromValue(card.dataset.homeOffer, card.dataset.price), true);
});

cancelHomeOffer.addEventListener("click", () => {
  homeOfferCards.forEach((card) => card.classList.remove("is-selected"));
  homeSelectedOfferName.textContent = "";
  homeOfferSelection.hidden = true;
  serviceFirstOfferMode = false;
  updateHomeOfferActions();
});

payAdvance.addEventListener("click", () => {
  const total = getTotal();
  if (!total || (needsAdditionalService && !activeService)) {
    formMessage.textContent = "Select the service or offer you want before making the advance payment.";
    return;
  }

  const advance = Math.ceil(total / 2);
  paymentReference ||= `GL-${Date.now().toString().slice(-6)}`;
  const upiUrl = new URL("upi://pay");
  upiUrl.searchParams.set("pa", nidhiPaytmUpiId);
  upiUrl.searchParams.set("pn", "Nidhi");
  upiUrl.searchParams.set("am", advance.toFixed(2));
  upiUrl.searchParams.set("cu", "INR");
  upiUrl.searchParams.set("tn", `Glow by Nidhi advance ${paymentReference}`);

  paymentWasStarted = true;
  paymentScreenshot.value = "";
  paymentScreenshot.disabled = false;
  sendBooking.disabled = true;
  const isMobileDevice = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobileDevice) {
    formMessage.textContent = `Pay ${money.format(advance)} in Paytm or another UPI app, then return here and upload the payment screenshot.`;
    window.location.href = upiUrl.toString();
  } else {
    formMessage.textContent = "Scan the QR code with Paytm on your phone, then upload the payment screenshot.";
    showDesktopPaymentQr(upiUrl, advance);
  }
});

paymentScreenshot.addEventListener("change", () => {
  if (paymentWasStarted && paymentScreenshot.files[0]) {
    sendBooking.disabled = false;
    formMessage.textContent = "Screenshot added. Send your booking and proof to Nidhi on WhatsApp.";
  }
});

function openWhatsApp(message) {
  const url = new URL("https://api.whatsapp.com/send");
  url.searchParams.set("phone", nidhiWhatsAppNumber);
  url.searchParams.set("text", message);
  window.location.href = url.toString();
}

function showDesktopPaymentQr(upiUrl, advance) {
  const qrUrl = new URL("https://api.qrserver.com/v1/create-qr-code/");
  qrUrl.searchParams.set("size", "280x280");
  qrUrl.searchParams.set("format", "svg");
  qrUrl.searchParams.set("data", upiUrl.toString());
  upiQrCode.src = qrUrl.toString();
  upiQrAmount.textContent = `Pay now: ${money.format(advance)}`;
  upiPaymentModal.hidden = false;
}

closeUpiPayment.addEventListener("click", () => {
  upiPaymentModal.hidden = true;
});

async function shareScreenshotAndBooking(message, screenshot) {
  if (navigator.canShare && navigator.canShare({ files: [screenshot] })) {
    try {
      await navigator.share({
        title: "Glow by Nidhi booking",
        text: message,
        files: [screenshot]
      });
      formMessage.textContent = "Choose WhatsApp, then choose Nidhi, to send the booking and screenshot together.";
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }

  openWhatsApp(message);
  formMessage.textContent = "WhatsApp is open. Please tap Attach and add the screenshot you selected before sending.";
}

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!activeOffer && !activeService) {
    formMessage.textContent = "Please select a service or offer above first.";
    document.querySelector("#services").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (needsAdditionalService && !activeService) {
    formMessage.textContent = "Please choose the additional service above first.";
    document.querySelector("#services").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (!paymentWasStarted) {
    formMessage.textContent = "First tap ‘Pay 50% advance by UPI’, complete payment, then upload its screenshot.";
    return;
  }

  if (!bookingForm.checkValidity()) {
    bookingForm.reportValidity();
    return;
  }

  const details = new FormData(bookingForm);
  const total = getTotal();
  const advance = Math.ceil(total / 2);
  const remaining = total - advance;
  paymentReference ||= `GL-${Date.now().toString().slice(-6)}`;
  const screenshot = paymentScreenshot.files[0];

  const bookingMessage = [
    "Hello Nidhi! I would like to make a booking.",
    "",
    `Booking reference: ${paymentReference}`,
    `Name: ${details.get("name").trim()}`,
    `Phone: ${details.get("phone")}`,
    `Address: ${details.get("address").trim()}`,
    ...(activeOffer ? [`Offer: ${activeOffer.name} (${money.format(activeOffer.price)})`] : []),
    ...(activeService ? [`Service: ${activeService.name} (${money.format(activeService.price)})`] : []),
    `Preferred date: ${details.get("date")}`,
    `Preferred time: ${details.get("time")}`,
    "",
    `Total booking amount: ${money.format(total)}`,
    `Paytm advance (50%): ${money.format(advance)}`,
    `Remaining amount after service: ${money.format(remaining)}`,
    `Paytm UPI used: ${nidhiPaytmUpiId}`,
    "Customer selected a payment screenshot. Please verify the Paytm payment and screenshot before confirming the appointment.",
    "Thank you!"
  ].join("\n");

  shareScreenshotAndBooking(bookingMessage, screenshot);
});
