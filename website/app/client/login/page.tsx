"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/style/client/login.module.css";

export default function Home() {
  const router = useRouter();
  const [badgeNumber, setBadgeNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badge_number: badgeNumber, password }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.message || "Login failed");
      }
      router.push("/client/main");
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo} />
          <div className={styles.title}>Garage Management</div>
        </div>
        <div className={styles.subtitle}>Sign in to continue</div>
        <form onSubmit={onSubmit} className={styles.form}>
          <label className={styles.label}>
            <span className={styles.labelText}>Badge Number</span>
            <input
              type="text"
              value={badgeNumber}
              onChange={(e) => setBadgeNumber(e.target.value)}
              placeholder="Enter your badge number"
              required
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            <span className={styles.labelText}>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={styles.input}
            />
          </label>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
