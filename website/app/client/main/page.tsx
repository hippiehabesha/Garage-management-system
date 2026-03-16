"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/style/client/main.module.css";

type CarResult = {
  plate: string | null;
  serial: string | null;
  model: string | null;
};

export default function Main() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CarResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [recentCars, setRecentCars] = useState<any[]>([]);

  const [plate, setPlate] = useState("");
  const [department, setDepartment] = useState("");
  const [model, setModel] = useState("");
  const [eraNumber, setEraNumber] = useState("");
  const [driverFirstName, setDriverFirstName] = useState("");
  const [driverLastName, setDriverLastName] = useState("");
  const [engineNumber, setEngineNumber] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [mileage, setMileage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      setError(null);
      return () => controller.abort();
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/cars/search?q=${encodeURIComponent(
            query
          )}`,
          {
            signal: controller.signal,
          }
        );
        const contentType = res.headers.get("content-type") || "";
        const rawText = await res.text();
        let data: any = null;
        if (contentType.includes("application/json")) {
          try {
            data = JSON.parse(rawText);
          } catch (err) {
            throw new Error("Invalid JSON from server");
          }
        } else {
          throw new Error(
            rawText?.slice(0, 200) || "Non-JSON response from server"
          );
        }
        if (!res.ok || !data?.ok)
          throw new Error(data?.message || "Search failed");
        setResults(Array.isArray(data.results) ? data.results : []);
        setError(null);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          setError(e?.message || "Search failed");
        }
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [query]);

  // Fetch recent cars
  useEffect(() => {
    fetch("http://localhost:3001/api/cars/recent")
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok) setRecentCars(data.recent || []);
      })
      .catch((e) => console.error("Failed to fetch recent cars:", e));
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>GARAGE MANAGEMENT SYSTEM</div>
      </header>

      <div className={styles.topBar}>
        <div className={styles.searchGroup}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search by plate number or serial number..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button
          className={styles.addCarButton}
          type="button"
          onClick={() => setShowDialog(true)}>
          <img src="/add_car.png" alt="Add Car" className={styles.icon} />
          <span>Add Car</span>
        </button>
      </div>

      {query.trim() && (
        <section className={styles.resultsCard}>
          {loading && <div className={styles.resultHint}>Searching…</div>}
          {error && <div className={styles.resultError}>{error}</div>}
          {!loading && !error && results.length === 0 && (
            <div className={styles.resultHint}>No cars found</div>
          )}
          {!loading && !error && results.length > 0 && (
            <ul className={styles.resultList}>
              {results.map((r, idx) => (
                <li
                  key={`${r.plate || "no-plate"}-${r.serial || idx}`}
                  className={styles.resultItem}
                  onClick={() =>
                    router.push(
                      `/client/car?plate=${encodeURIComponent(
                        r.plate || ""
                      )}&model=${encodeURIComponent(
                        r.model || ""
                      )}&serial_number=${encodeURIComponent(r.serial || "")}`
                    )
                  }>
                  <div className={styles.resultPlate}>{r.plate || "—"}</div>
                  <div className={styles.resultMeta}>
                    <span className={styles.resultSerial}>
                      {r.serial || "—"}
                    </span>
                    <span className={styles.resultDot}>•</span>
                    <span className={styles.resultModel}>{r.model || "—"}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <main className={styles.content}>
        <div className={styles.recentCard}>
          <div className={styles.recentHeader}>
            <div className={styles.recentCol}>Recently</div>
            <div className={styles.statusCol}>Status</div>
          </div>
          <div className={styles.recentList}>
            {recentCars.length === 0 ? (
              <div className={styles.placeholder}>No recent cars yet</div>
            ) : (
              recentCars.map((car, idx) => (
                <div
                  key={car.car_id || idx}
                  style={{
                    display: "flex",
                    padding: "16px",
                    borderBottom: "1px solid #e5e7eb",
                    cursor: "pointer",
                    transition: "background 0.2s"
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#f9fafb")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                  onClick={() =>
                    router.push(
                      `/client/car?plate=${encodeURIComponent(
                        car.plate || ""
                      )}&model=${encodeURIComponent(
                        car.model || ""
                      )}&serial_number=${encodeURIComponent(car.serial_number || "")}`
                    )
                  }
                >
                  <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                    <div style={{ fontWeight: "600", color: "#111827" }}>
                      {car.plate || "—"}
                    </div>
                  </div>
                  <div style={{ width: "100px", display: "flex", alignItems: "center" }}>
                    <span style={{
                      background: "#ecfdf5",
                      color: "#059669",
                      padding: "4px 8px",
                      borderRadius: "9999px",
                      fontSize: "12px",
                      fontWeight: "500"
                    }}>
                      Added
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {showDialog && (
        <div
          className={styles.modalOverlay}
          onClick={() => !saving && setShowDialog(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>Car Register Form</div>
            </div>
            {formError && <div className={styles.resultError}>{formError}</div>}
            <div className={styles.modalBody}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Plate</span>
                <input
                  className={styles.fieldInput}
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Department</span>
                <select
                  className={styles.fieldSelect}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}>
                  <option value="" disabled>
                    Select department
                  </option>
                  <option>Human Resource</option>
                  <option>Department Manager</option>
                  <option>Software</option>
                </select>
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Model</span>
                <input
                  className={styles.fieldInput}
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>ERA Number</span>
                <input
                  className={styles.fieldInput}
                  type="text"
                  value={eraNumber}
                  onChange={(e) => setEraNumber(e.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Driver First Name</span>
                <input
                  className={styles.fieldInput}
                  type="text"
                  value={driverFirstName}
                  onChange={(e) => setDriverFirstName(e.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Driver Last Name</span>
                <input
                  className={styles.fieldInput}
                  type="text"
                  value={driverLastName}
                  onChange={(e) => setDriverLastName(e.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Engine Number</span>
                <input
                  className={styles.fieldInput}
                  type="text"
                  value={engineNumber}
                  onChange={(e) => setEngineNumber(e.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Serial Number</span>
                <input
                  className={styles.fieldInput}
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Mileage</span>
                <input
                  className={styles.fieldInput}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  type="text"
                  value={mileage}
                  onChange={(e) =>
                    setMileage(e.target.value.replace(/\D+/g, ""))
                  }
                />
                <span className={styles.fieldNote}>Numbers only</span>
              </label>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.ghostButton}
                type="button"
                disabled={saving}
                onClick={() => setShowDialog(false)}>
                Cancel
              </button>
              <button
                className={styles.primaryButton}
                type="button"
                disabled={saving}
                onClick={async () => {
                  setFormError(null);
                  setSaving(true);
                  router.push(
                    `/client/car?plate=${encodeURIComponent(
                      plate
                    )}&department=${encodeURIComponent(
                      department
                    )}&model=${encodeURIComponent(
                      model
                    )}&era_number=${encodeURIComponent(
                      eraNumber
                    )}&driver_first_name=${encodeURIComponent(
                      driverFirstName
                    )}&driver_last_name=${encodeURIComponent(
                      driverLastName
                    )}&engine_number=${encodeURIComponent(
                      engineNumber
                    )}&serial_number=${encodeURIComponent(
                      serialNumber
                    )}&mileage=${encodeURIComponent(mileage)}`
                  );
                  try {
                    const res = await fetch("http://localhost:3001/api/cars", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        plate,
                        department,
                        model,
                        eraNumber,
                        driverFirstName,
                        driverLastName,
                        engineNumber,
                        serialNumber,
                        mileage,
                      }),
                    });
                    const ct = res.headers.get("content-type") || "";
                    const raw = await res.text();
                    let data: any = null;
                    if (ct.includes("application/json")) {
                      try {
                        data = JSON.parse(raw);
                      } catch {
                        throw new Error("Invalid JSON from server");
                      }
                    } else {
                      throw new Error(
                        raw?.slice(0, 200) || "Non-JSON response from server"
                      );
                    }
                    if (!res.ok || !data?.ok)
                      throw new Error(data?.message || "Save failed");
                    setShowDialog(false);
                    setPlate("");
                    setDepartment("");
                    setModel("");
                    setEraNumber("");
                    setDriverFirstName("");
                    setDriverLastName("");
                    setEngineNumber("");
                    setSerialNumber("");
                    setMileage("");
                  } catch (e: any) {
                    setFormError(e?.message || "Save failed");
                  } finally {
                    setSaving(false);
                  }
                }}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
