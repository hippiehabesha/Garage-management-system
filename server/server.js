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
  const { badge_number, password } = req.body || {};
  if (!badge_number || !password) {
    return res
      .status(400)
      .json({ ok: false, message: "Badge number and password are required" });
  }

  const db = getDb();
  // Try MECHANIC first, then TECHNICIAN
  db.get(
    "SELECT *, 'mechanic' as role FROM MECHANIC WHERE badge_number = ? AND password = ? LIMIT 1",
    [badge_number, password],
    (err, row) => {
      if (err) {
        db.close();
        return res.status(500).json({ ok: false, message: "Database error", error: String(err) });
      }
      if (row) {
        db.close();
        return res.json({ ok: true, message: "Login successful", role: "mechanic", name: `${row.first_name} ${row.last_name}` });
      }
      // Not a mechanic, try technician
      db.get(
        "SELECT *, 'technician' as role FROM TECHNICIAN WHERE badge_number = ? AND password = ? LIMIT 1",
        [badge_number, password],
        (err2, row2) => {
          db.close();
          if (err2) {
            return res.status(500).json({ ok: false, message: "Database error", error: String(err2) });
          }
          if (!row2) {
            return res.status(401).json({ ok: false, message: "Invalid badge number or password" });
          }
          return res.json({ ok: true, message: "Login successful", role: "technician", name: `${row2.first_name} ${row2.last_name}` });
        }
      );
    }
  );
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

// Get recent cars
app.get("/api/cars/recent", (req, res) => {
  const db = getDb();
  db.all("PRAGMA table_info(CAR);", [], (err, rows) => {
    if (err) {
      db.close();
      return res.status(500).json({ ok: false, message: "Schema error" });
    }
    const cols = rows.map((r) => r.name);
    const hasCarId = cols.includes("car_id");
    const sql = `SELECT * FROM CAR ${hasCarId ? "ORDER BY car_id DESC" : ""} LIMIT 10`;
    db.all(sql, [], (qErr, cars) => {
      db.close();
      if (qErr) {
        return res.status(500).json({ ok: false, message: "Database error" });
      }
      return res.json({ ok: true, recent: cars || [] });
    });
  });
});

// Get full car detail by plate or serial_number
app.get("/api/cars/detail", (req, res) => {
  const plate = (req.query.plate || "").toString().trim();
  const serial = (req.query.serial_number || "").toString().trim();
  if (!plate && !serial) {
    return res
      .status(400)
      .json({ ok: false, message: "plate or serial_number is required" });
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

    const whereParts = [];
    const params = [];
    if (plate && plateField) {
      whereParts.push(`${plateField} = ?`);
      params.push(plate);
    }
    if (serial && serialField) {
      whereParts.push(`${serialField} = ?`);
      params.push(serial);
    }
    if (whereParts.length === 0) {
      db.close();
      return res.status(500).json({
        ok: false,
        message: "Could not identify key columns in CAR table",
        columns,
      });
    }

    const sql = `SELECT * FROM CAR WHERE ${whereParts.join(" OR ")} LIMIT 1`;
    db.get(sql, params, (qErr, row) => {
      db.close();
      if (qErr) {
        return res
          .status(500)
          .json({ ok: false, message: "Database error", error: String(qErr) });
      }
      if (!row) {
        return res.status(404).json({ ok: false, message: "Car not found" });
      }
      // Normalize DB columns to expected client keys
      const col = (cands) => pickColumns(columns, cands);
      const mapping = {
        plate: col(["plate"]),
        department: col(["department"]),
        model: col(["model"]),
        era_number: col(["era_number"]),
        driver_first_name: col(["driver_first_name"]),
        driver_last_name: col(["driver_last_name"]),
        mileage: col(["mileage"]),
        engine_number: col(["engine_number"]),
        serial_number: col(["serial_number"]),
      };
      const car = {
        plate: mapping.plate ? row[mapping.plate] : null,
        department: mapping.department ? row[mapping.department] : null,
        model: mapping.model ? row[mapping.model] : null,
        era_number: mapping.era_number ? row[mapping.era_number] : null,
        driver_first_name: mapping.driver_first_name
          ? row[mapping.driver_first_name]
          : null,
        driver_last_name: mapping.driver_last_name
          ? row[mapping.driver_last_name]
          : null,
        mileage: mapping.mileage ? row[mapping.mileage] : null,
        engine_number: mapping.engine_number
          ? row[mapping.engine_number]
          : null,
        serial_number: mapping.serial_number
          ? row[mapping.serial_number]
          : null,
      };
      return res.json({ ok: true, car });
    });
  });
});

// Get car inspection history
app.get("/api/cars/history", (req, res) => {
  const plate = (req.query.plate || "").toString().trim();
  const serial = (req.query.serial_number || "").toString().trim();
  if (!plate && !serial) {
    return res.status(400).json({ ok: false, message: "plate or serial_number required" });
  }

  const db = getDb();
  const carQuery = plate ? `SELECT car_id FROM CAR WHERE plate = ? LIMIT 1` : `SELECT car_id FROM CAR WHERE serial_number = ? LIMIT 1`;
  const carParam = plate ? plate : serial;

  db.get(carQuery, [carParam], (err, carRow) => {
    if (err) { db.close(); return res.status(500).json({ ok: false, message: "Database error" }); }
    if (!carRow) { db.close(); return res.status(404).json({ ok: false, message: "Car not found" }); }
    
    db.all(`
      SELECT d.di_id as id, d.date, r.rc_id 
      FROM DETAIL_INSPECTION d 
      JOIN RECEIVING_CHECKLIST r ON d.rc_id = r.rc_id 
      WHERE d.car_id = ? 
      ORDER BY d.date DESC, d.di_id DESC
    `, [carRow.car_id], (err, rows) => {
      db.close();
      if (err) return res.status(500).json({ ok: false, message: "Database error" });
      return res.json({ ok: true, history: rows || [] });
    });
  });
});

app.get("/api/cars/history/:id/:rc_id", (req, res) => {
  const { id, rc_id } = req.params;
  const db = getDb();
  
  db.all(`SELECT accessories FROM RC_LIST WHERE rc_id = ?`, [rc_id], (err, rcRows) => {
    if (err) { db.close(); return res.status(500).json({ ok: false, message: "Database error" }); }
    
    db.all(`SELECT item_description FROM DI_LIST WHERE di_id = ?`, [id], (err, diRows) => {
      db.close();
      if (err) return res.status(500).json({ ok: false, message: "Database error" });
      
      res.json({
        ok: true,
        rc_list: rcRows.map(r => r.accessories),
        di_list: diRows.map(r => r.item_description)
      });
    });
  });
});

// ─── Admin API Routes ────────────────────────────────────────────

// Admin login
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ ok: false, message: "username and password are required" });
  }
  const db = getDb();
  db.get("SELECT * FROM ADMIN WHERE username = ? AND password = ? LIMIT 1", [username, password], (err, row) => {
    db.close();
    if (err) return res.status(500).json({ ok: false, message: "Database error", error: String(err) });
    if (!row) return res.status(401).json({ ok: false, message: "Invalid admin credentials" });
    return res.json({ ok: true, message: "Admin login successful", admin: { admin_id: row.admin_id, username: row.username } });
  });
});

// Dashboard stats
app.get("/api/admin/stats", (_req, res) => {
  const db = getDb();
  const queries = [
    "SELECT COUNT(*) as c FROM CAR",
    "SELECT COUNT(*) as c FROM MECHANIC",
    "SELECT COUNT(*) as c FROM TECHNICIAN",
    "SELECT COUNT(*) as c FROM DETAIL_INSPECTION",
    "SELECT COUNT(*) as c FROM RECEIVING_CHECKLIST",
    "SELECT COUNT(*) as c FROM ADMIN",
  ];
  const results = {};
  const keys = ["cars", "mechanics", "technicians", "inspections", "checklists", "admins"];
  let done = 0;
  queries.forEach((sql, i) => {
    db.get(sql, [], (err, row) => {
      results[keys[i]] = err ? 0 : (row?.c || 0);
      done++;
      if (done === queries.length) {
        db.close();
        res.json({ ok: true, stats: results });
      }
    });
  });
});

// ── Generic CRUD helpers ───────────────────────────────────

function adminList(tableName) {
  return (_req, res) => {
    const db = getDb();
    db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
      db.close();
      if (err) return res.status(500).json({ ok: false, message: `Failed to read ${tableName}`, error: String(err) });
      res.json({ ok: true, rows: rows || [] });
    });
  };
}

function adminCreate(tableName, requiredFields) {
  return (req, res) => {
    const body = req.body || {};
    const db = getDbRW();
    // Get actual column info
    db.all(`PRAGMA table_info(${tableName});`, [], (err, colInfo) => {
      if (err) { db.close(); return res.status(500).json({ ok: false, message: "Schema error", error: String(err) }); }
      const dbCols = colInfo.map(c => c.name).filter(c => !c.endsWith("_id")); // skip auto-increment id
      const cols = [];
      const vals = [];
      for (const col of dbCols) {
        if (body[col] !== undefined && body[col] !== null && body[col] !== "") {
          cols.push(`"${col}"`);
          vals.push(body[col]);
        }
      }
      // Check required
      for (const rf of requiredFields) {
        if (!body[rf] || String(body[rf]).trim() === "") {
          db.close();
          return res.status(400).json({ ok: false, message: `${rf} is required` });
        }
      }
      if (cols.length === 0) { db.close(); return res.status(400).json({ ok: false, message: "No valid fields" }); }
      const placeholders = cols.map(() => "?").join(", ");
      db.run(`INSERT INTO ${tableName} (${cols.join(", ")}) VALUES (${placeholders})`, vals, function (qErr) {
        db.close();
        if (qErr) return res.status(500).json({ ok: false, message: "Insert failed", error: String(qErr) });
        res.json({ ok: true, message: "Created", id: this?.lastID });
      });
    });
  };
}

function adminUpdate(tableName, idField) {
  return (req, res) => {
    const id = req.params.id;
    const body = req.body || {};
    const db = getDbRW();
    db.all(`PRAGMA table_info(${tableName});`, [], (err, colInfo) => {
      if (err) { db.close(); return res.status(500).json({ ok: false, message: "Schema error", error: String(err) }); }
      const dbCols = colInfo.map(c => c.name).filter(c => c !== idField);
      const sets = [];
      const vals = [];
      for (const col of dbCols) {
        if (body[col] !== undefined) {
          sets.push(`"${col}" = ?`);
          vals.push(body[col]);
        }
      }
      if (sets.length === 0) { db.close(); return res.status(400).json({ ok: false, message: "No fields to update" }); }
      vals.push(id);
      db.run(`UPDATE ${tableName} SET ${sets.join(", ")} WHERE ${idField} = ?`, vals, function (qErr) {
        db.close();
        if (qErr) return res.status(500).json({ ok: false, message: "Update failed", error: String(qErr) });
        if (this.changes === 0) return res.status(404).json({ ok: false, message: "Not found" });
        res.json({ ok: true, message: "Updated" });
      });
    });
  };
}

function adminDelete(tableName, idField) {
  return (req, res) => {
    const id = req.params.id;
    const db = getDbRW();
    db.run(`DELETE FROM ${tableName} WHERE ${idField} = ?`, [id], function (err) {
      db.close();
      if (err) return res.status(500).json({ ok: false, message: "Delete failed", error: String(err) });
      if (this.changes === 0) return res.status(404).json({ ok: false, message: "Not found" });
      res.json({ ok: true, message: "Deleted" });
    });
  };
}

// ── Cars CRUD ──────────────────────────
app.get("/api/admin/cars", adminList("CAR"));
app.post("/api/admin/cars", adminCreate("CAR", ["plate"]));
app.put("/api/admin/cars/:id", adminUpdate("CAR", "car_id"));
app.delete("/api/admin/cars/:id", adminDelete("CAR", "car_id"));

// ── Admins (list, create, delete-own) ──
app.get("/api/admin/admins", adminList("ADMIN"));
app.post("/api/admin/admins", adminCreate("ADMIN", ["username", "password"]));
app.delete("/api/admin/admins/:id", adminDelete("ADMIN", "admin_id"));



// ── Mechanics CRUD ─────────────────────
app.get("/api/admin/mechanics", adminList("MECHANIC"));
app.post("/api/admin/mechanics", adminCreate("MECHANIC", ["first_name", "last_name", "badge_number"]));
app.put("/api/admin/mechanics/:id", adminUpdate("MECHANIC", "mechanic_id"));
app.delete("/api/admin/mechanics/:id", adminDelete("MECHANIC", "mechanic_id"));

// ── Technicians CRUD ───────────────────
app.get("/api/admin/technicians", adminList("TECHNICIAN"));
app.post("/api/admin/technicians", adminCreate("TECHNICIAN", ["first_name", "last_name", "badge_number"]));
app.put("/api/admin/technicians/:id", adminUpdate("TECHNICIAN", "technician_id"));
app.delete("/api/admin/technicians/:id", adminDelete("TECHNICIAN", "technician_id"));

// ── Inspections CRUD ───────────────────
app.get("/api/admin/inspections", adminList("DETAIL_INSPECTION"));
app.post("/api/admin/inspections", adminCreate("DETAIL_INSPECTION", ["car_id", "mechanic_id", "date", "rc_id"]));
app.put("/api/admin/inspections/:id", adminUpdate("DETAIL_INSPECTION", "di_id"));
app.delete("/api/admin/inspections/:id", adminDelete("DETAIL_INSPECTION", "di_id"));

// ── Checklists CRUD ────────────────────
app.get("/api/admin/checklists", adminList("RECEIVING_CHECKLIST"));
app.post("/api/admin/checklists", adminCreate("RECEIVING_CHECKLIST", ["car_id", "technician_id", "date"]));
app.put("/api/admin/checklists/:id", adminUpdate("RECEIVING_CHECKLIST", "rc_id"));
app.delete("/api/admin/checklists/:id", adminDelete("RECEIVING_CHECKLIST", "rc_id"));

// ── Complete Checklist & Inspection ─────
app.post("/api/checklists/complete", (req, res) => {
  const { plate, serial_number, checks, checks2 } = req.body || {};
  if (!plate && !serial_number) {
    return res.status(400).json({ ok: false, message: "plate or serial_number required" });
  }

  const db = getDbRW();

  // Find car_id
  const carQuery = plate ? `SELECT car_id FROM CAR WHERE plate = ? LIMIT 1` : `SELECT car_id FROM CAR WHERE serial_number = ? LIMIT 1`;
  const carParam = plate ? plate : serial_number;

  db.get(carQuery, [carParam], (err, carRow) => {
    if (err) { db.close(); return res.status(500).json({ ok: false, message: "Database error", error: String(err) }); }
    if (!carRow) { db.close(); return res.status(404).json({ ok: false, message: "Car not found" }); }
    
    const car_id = carRow.car_id;

    // Get a default technician and mechanic since frontend doesn't supply them yet
    db.get("SELECT technician_id FROM TECHNICIAN LIMIT 1", [], (err, techRow) => {
      const technician_id = techRow ? techRow.technician_id : 1;
      
      db.get("SELECT mechanic_id FROM MECHANIC LIMIT 1", [], (err, mechRow) => {
        const mechanic_id = mechRow ? mechRow.mechanic_id : 1;
        const date = new Date().toISOString().split("T")[0];

        // Insert RECEIVING_CHECKLIST
        db.run(`INSERT INTO RECEIVING_CHECKLIST (car_id, technician_id, date) VALUES (?, ?, ?)`, [car_id, technician_id, date], function (err) {
          if (err) { db.close(); return res.status(500).json({ ok: false, message: "Failed to create rc", error: String(err) }); }
          const rc_id = this.lastID;

          // Insert RC_LIST items
          const rcListCols = [];
          const rcListVals = [];
          for (const item of (checks || [])) {
            rcListCols.push(`(?, ?)`);
            rcListVals.push(rc_id, item);
          }
          
          const insertRCLink = () => {
            if (rcListCols.length === 0) return Promise.resolve();
            return new Promise((resolve, reject) => {
              db.run(`INSERT INTO RC_LIST (rc_id, accessories) VALUES ${rcListCols.join(",")}`, rcListVals, function(err) {
                if(err) reject(err); else resolve();
              });
            });
          };

          insertRCLink().then(() => {
            // Insert DETAIL_INSPECTION
            db.run(`INSERT INTO DETAIL_INSPECTION (car_id, mechanic_id, date, rc_id) VALUES (?, ?, ?, ?)`, [car_id, mechanic_id, date, rc_id], function (err) {
              if (err) { db.close(); return res.status(500).json({ ok: false, message: "Failed to create di", error: String(err) }); }
              const di_id = this.lastID;

              // Insert DI_LIST items
              const diListCols = [];
              const diListVals = [];
              for (const item of (checks2 || [])) {
                diListCols.push(`(?, ?, ?)`);
                diListVals.push(di_id, "Inspection", item); // default type
              }

              const insertDILink = () => {
                if (diListCols.length === 0) return Promise.resolve();
                return new Promise((resolve, reject) => {
                  db.run(`INSERT INTO DI_LIST (di_id, type, item_description) VALUES ${diListCols.join(",")}`, diListVals, function(err) {
                    if(err) reject(err); else resolve();
                  });
                });
              };

              insertDILink().then(() => {
                db.close();
                res.json({ ok: true, message: "Saved successfully", rc_id, di_id });
              }).catch(err => {
                db.close();
                res.status(500).json({ ok: false, message: "Failed to create di lists", error: String(err) });
              });
            });
          }).catch(err => {
            db.close();
            res.status(500).json({ ok: false, message: "Failed to create rc lists", error: String(err) });
          });
        });
      });
    });
  });
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Auth server listening on http://localhost:${PORT}`);
});
