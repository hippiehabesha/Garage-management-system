const express = require("express");
const cors = require("cors");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, "../database/ERA-Garage-Database.sqlite");

function getDb() {
  return new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY);
}

function pickColumns(columns, candidates) {
  const lower = new Set(columns.map((c) => c.toLowerCase()));
  for (const cand of candidates) {
    if (lower.has(cand)) return columns.find((c) => c.toLowerCase() === cand);
  }
  return null;
}

app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res
      .status(400)
      .json({ ok: false, message: "username and password are required" });
  }

  const db = getDb();
  db.all("PRAGMA table_info(USER);", [], (err, rows) => {
    if (err) {
      db.close();
      return res.status(500).json({
        ok: false,
        message: "Failed to read USER table schema",
        error: String(err),
      });
    }
    const columns = rows.map((r) => r.name);
    const userField = pickColumns(columns, ["username"]);
    const passField = pickColumns(columns, ["password"]);

    if (!userField || !passField) {
      db.close();
      return res.status(500).json({
        ok: false,
        message: "Could not identify username/password columns in USER table",
        columns,
      });
    }

    const sql = `SELECT * FROM USER WHERE ${userField} = ? AND ${passField} = ? LIMIT 1`;
    db.get(sql, [username, password], (qErr, row) => {
      db.close();
      if (qErr) {
        return res
          .status(500)
          .json({ ok: false, message: "Database error", error: String(qErr) });
      }
      if (!row) {
        return res
          .status(401)
          .json({ ok: false, message: "Invalid credentials" });
      }
      return res.json({ ok: true, message: "Login successful" });
    });
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Auth server listening on http://localhost:${PORT}`);
});
