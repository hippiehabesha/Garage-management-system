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

function getDbRW() {
  return new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE);
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

// Create a new car entry
app.post("/api/cars", (req, res) => {
  const body = req.body || {};
  const db = getDbRW();

  db.all("PRAGMA table_info(CAR);", [], (err, rows) => {
    if (err) {
      db.close();
      return res.status(500).json({
        ok: false,
        message: "Failed to read CAR table schema",
        error: String(err),
      });
    }

    const columns = rows.map((r) => r.name);
    const col = (cands) => pickColumns(columns, cands);

    const mapping = {
      plate: col(["plate"]),
      department: col(["department"]),
      model: col(["model"]),
      era_number: col(["era_number"]),
      driver_first_name: col(["driver_first_name"]),
      driver_last_name: col(["driver_last_name"]),
      engine_number: col(["engine_number"]),
      serial_number: col(["serial_number"]),
      mileage: col(["mileage"]),
    };

    // Build insert from fields present in the request AND recognized in schema
    const payload = {
      plate: body.plate,
      department: body.department,
      model: body.model,
      era_number: body.eraNumber,
      driver_first_name: body.driverFirstName,
      driver_last_name: body.driverLastName,
      engine_number: body.engineNumber,
      serial_number: body.serialNumber,
      mileage: body.mileage,
    };

    const cols = Object.entries(mapping)
      .filter(([k, v]) => v && payload[k] !== undefined && payload[k] !== null)
      .map(([k, v]) => v);
    const vals = Object.entries(mapping)
      .filter(([k, v]) => v && payload[k] !== undefined && payload[k] !== null)
      .map(([k]) => payload[k]);

    if (cols.length === 0) {
      db.close();
      return res.status(400).json({
        ok: false,
        message: "No valid fields to insert based on CAR schema",
      });
    }

    const placeholders = cols.map(() => "?").join(", ");
    const colList = cols.map((c) => `"${c}"`).join(", ");
    const sql = `INSERT INTO CAR (${colList}) VALUES (${placeholders})`;
    db.run(sql, vals, function (qErr) {
      db.close();
      if (qErr) {
        return res
          .status(500)
          .json({ ok: false, message: "Insert failed", error: String(qErr) });
      }
      return res.json({ ok: true, message: "Car saved", id: this?.lastID });
    });
  });
});

// Search cars by plate or serial number
app.get("/api/cars/search", (req, res) => {
  const q = (req.query.q || "").toString().trim();
  if (!q) {
    return res.json({ ok: true, results: [] });
  }

  const db = getDb();
  db.all("PRAGMA table_info(CAR);", [], (err, rows) => {
    if (err) {
      db.close();
      return res.status(500).json({
        ok: false,
        message: "Failed to read CAR table schema",
        error: String(err),
      });
    }

    const columns = rows.map((r) => r.name);
    const plateField = pickColumns(columns, ["plate"]);
    const serialField = pickColumns(columns, ["serial_number"]);
    const modelField = pickColumns(columns, ["model"]);

    if (!plateField && !serialField) {
      db.close();
      return res.status(500).json({
        ok: false,
        message: "Could not identify plate or serial columns in CAR table",
        columns,
      });
    }

    const selectedCols = [plateField, serialField, modelField]
      .filter(Boolean)
      .map((c) => `"${c}" AS "${c}"`)
      .join(", ");
    const whereParts = [];
    const params = [];
    const like = `%${q.toLowerCase()}%`;
    if (plateField) {
      whereParts.push(`LOWER(${plateField}) LIKE ?`);
      params.push(like);
    }
    if (serialField) {
      whereParts.push(`LOWER(${serialField}) LIKE ?`);
      params.push(like);
    }

    const sql = `SELECT ${selectedCols || "*"} FROM CAR WHERE ${whereParts.join(
      " OR "
    )} LIMIT 20`;
    db.all(sql, params, (qErr, rows2) => {
      db.close();
      if (qErr) {
        return res
          .status(500)
          .json({ ok: false, message: "Database error", error: String(qErr) });
      }
      const results = (rows2 || []).map((r) => ({
        plate: plateField ? r[plateField] : null,
        serial: serialField ? r[serialField] : null,
        model: modelField ? r[modelField] : null,
      }));
      return res.json({ ok: true, results });
    });
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Auth server listening on http://localhost:${PORT}`);
});
