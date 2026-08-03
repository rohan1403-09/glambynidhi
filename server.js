const express = require("express");
const path = require("path");
const { getAllReviews, createReview } = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "32kb" }));
app.use(express.static(__dirname));

app.get("/api/reviews", (_req, res) => {
  try {
    res.json(getAllReviews());
  } catch (error) {
    console.error("Failed to load reviews:", error);
    res.status(500).json({ error: "Could not load reviews." });
  }
});

app.post("/api/reviews", (req, res) => {
  const name = String(req.body.name || "").trim();
  const service = String(req.body.service || "").trim();
  const rating = Number(req.body.rating);
  const text = String(req.body.text || "").trim();

  if (!name || name.length > 80) {
    return res.status(400).json({ error: "Please enter your name." });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Please choose a rating from 1 to 5 stars." });
  }

  if (text.length < 10 || text.length > 500) {
    return res.status(400).json({ error: "Your review should be between 10 and 500 characters." });
  }

  if (service.length > 120) {
    return res.status(400).json({ error: "Service name is too long." });
  }

  try {
    const review = createReview({ name, service, rating, text });
    res.status(201).json(review);
  } catch (error) {
    console.error("Failed to save review:", error);
    res.status(500).json({ error: "Could not save your review. Please try again." });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Glow by Nidhi site running at http://localhost:${PORT}`);
  console.log(`On your phone (same Wi-Fi): http://<your-computer-ip>:${PORT}`);
});
