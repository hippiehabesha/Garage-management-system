"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
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
      const res = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
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
    <div
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        background: "#0f172a",
      }}>
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#0b1220",
          border: "1px solid #1f2a44",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "linear-gradient(135deg,#22d3ee,#6366f1)",
              boxShadow: "0 10px 20px rgba(79,70,229,.4)",
            }}
          />
          <div
            style={{ color: "#e2e8f0", fontWeight: 600, letterSpacing: 0.3 }}>
            Garage Management
          </div>
        </div>
        <div style={{ color: "#94a3b8", fontSize: 14, marginBottom: 18 }}>
          Sign in to continue
        </div>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ color: "#94a3b8", fontSize: 12 }}>Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              style={{
                background: "#0a1020",
                color: "#e2e8f0",
                border: "1px solid #1f2a44",
                outline: "none",
                padding: "12px 14px",
                borderRadius: 12,
                fontSize: 14,
              }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ color: "#94a3b8", fontSize: 12 }}>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                background: "#0a1020",
                color: "#e2e8f0",
                border: "1px solid #1f2a44",
                outline: "none",
                padding: "12px 14px",
                borderRadius: 12,
                fontSize: 14,
              }}
            />
          </label>

          {error && (
            <div
              style={{
                color: "#fca5a5",
                fontSize: 13,
                padding: "8px 10px",
                background: "#2b0f12",
                border: "1px solid #7f1d1d",
                borderRadius: 10,
              }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              padding: "12px 14px",
              background: loading
                ? "#334155"
                : "linear-gradient(135deg,#22d3ee,#6366f1)",
              color: "#0b1220",
              border: "none",
              borderRadius: 12,
              fontWeight: 700,
              letterSpacing: 0.4,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 10px 20px rgba(79,70,229,.35)",
            }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
