"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Login failed");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ background: "linear-gradient(135deg, var(--navy) 0%, #1a3a6b 60%, #0d2e5c 100%)" }}
    >
      <form
        onSubmit={handleSubmit}
        className="ww-card"
        style={{ width: 390, padding: "48px 40px", boxShadow: "0 24px 60px rgba(0,0,0,.35)" }}
      >
        <div className="text-center mb-7">
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 26, fontWeight: 800, color: "var(--navy)", letterSpacing: 1 }}>
            WHITE WHALE
          </h1>
          <p style={{ fontSize: 11, color: "var(--muted)", letterSpacing: 2, textTransform: "uppercase" }}>
            Procurement System
          </p>
        </div>

        <div className="mb-3">
          <label className="block text-xs font-bold uppercase mb-1" style={{ color: "var(--muted)", letterSpacing: 1 }}>
            Username
          </label>
          <input className="ww-input" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-bold uppercase mb-1" style={{ color: "var(--muted)", letterSpacing: 1 }}>
            Password
          </label>
          <input className="ww-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <button className="ww-btn ww-btn-primary" style={{ width: "100%", padding: 13, fontSize: 17 }} disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
        {error && <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 10, textAlign: "center" }}>{error}</p>}
      </form>
    </div>
  );
}
