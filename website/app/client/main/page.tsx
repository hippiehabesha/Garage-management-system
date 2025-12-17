"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../../style/client/main.module.css";

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
          onClick={() => router.push("/client/car")}>
          <img src="/add_car.png" alt="Add Car" className={styles.icon} />
          <span>Add Car</span>
        </button>
      </div>

      {query.trim() && (
        <section className={styles.resultsCard}>
          {loading && <div className={styles.resultHint}>Searching…</div>}
          {/* {error && <div className={styles.resultError}>{error}</div>} */}
          {!loading && !error && results.length === 0 && (
            <div className={styles.resultHint}>No cars found</div>
          )}
          {!loading && !error && results.length > 0 && (
            <ul className={styles.resultList}>
              {results.map((r, idx) => (
                <li
                  key={`${r.plate || "no-plate"}-${r.serial || idx}`}
                  className={styles.resultItem}
                  onClick={() => router.push("/client/car")}>
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
        <div className={styles.recentHeader}>
          <div className={styles.recentCol}>Recently</div>
          <div className={styles.statusCol}>Status</div>
        </div>
        <div className={styles.recentList}>
          <div className={styles.placeholder}>No recent cars yet</div>
        </div>
      </main>
    </div>
  );
}
