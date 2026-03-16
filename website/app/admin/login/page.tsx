"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/style/admin/login.module.css";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.message || "Login failed");
      }
      if (data.admin) {
        sessionStorage.setItem("adminUser", JSON.stringify(data.admin));
      }
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      {/* Decorative left panel */}
      <div className={styles.hero}>
        <div className={styles.heroIcon}>🏗️</div>
        <div className={styles.heroTitle}>ERA Garage</div>
        <div className={styles.heroSub}>
          Manage your fleet, track inspections, and keep your garage running
          smoothly.
        </div>
      </div>

      {/* Login form */}
      <div className={styles.formPanel}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.title}>Welcome back</div>
            <div className={styles.subtitle}>
              Sign in to the admin console
            </div>
          </div>

          <form onSubmit={onSubmit} className={styles.form}>
            <label className={styles.label}>
              <span className={styles.labelText}>Username</span>
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className={styles.input}
              />
            </label>

            <label className={styles.label}>
              <span className={styles.labelText}>Password</span>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className={styles.input}
              />
            </label>

            {error && <div className={styles.error}>{error}</div>}

            <button
              id="admin-login-btn"
              type="submit"
              disabled={loading}
              className={styles.button}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className={styles.footer}>
            <a href="/client/login" className={styles.footerLink}>
              ← Back to client login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
