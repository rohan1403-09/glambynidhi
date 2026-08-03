const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "reviews.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    service TEXT DEFAULT '',
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const getAllReviews = db.prepare(`
  SELECT id, name, service, rating, text, created_at AS date
  FROM reviews
  ORDER BY id DESC
`);

const insertReview = db.prepare(`
  INSERT INTO reviews (name, service, rating, text)
  VALUES (@name, @service, @rating, @text)
`);

const getReviewById = db.prepare(`
  SELECT id, name, service, rating, text, created_at AS date
  FROM reviews
  WHERE id = ?
`);

module.exports = {
  getAllReviews: () => getAllReviews.all(),
  createReview: (review) => {
    const result = insertReview.run(review);
    return getReviewById.get(result.lastInsertRowid);
  }
};
