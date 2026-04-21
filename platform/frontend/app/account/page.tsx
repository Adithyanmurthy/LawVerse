"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { Logo, SpinnerIcon, CheckIcon } from "@/components/Icons";
import { getToken } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

async function patchMe(body: object) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.detail || "Failed to save");
  }
  return res.json();
}

export default function Account() {
  const { isAuthenticated, user, userPlan, loading, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/login");
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (user) setFullName(user.full_name || "");
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveErr("");
    try {
      await patchMe({ full_name: fullName });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setSaveErr(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const planLimit = user?.analyses_limit ?? 3;
  const usedPct = user
    ? Math.min(100, Math.round((user.analyses_used / planLimit) * 100))
    : 0;

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <SpinnerIcon size={32} />
      </main>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <header style={{ background: "#ffffff", borderBottom: "1px solid #f0f0f0", position: "sticky", top: 0, zIndex: 50 }}>
        <nav style={{ maxWidth: 1400, margin: "0 auto", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 20, fontWeight: 500, color: "#1a1a1a", textDecoration: "none" }}>
            <div style={{ background: "#000000", padding: 6, borderRadius: 6, color: "white", display: "flex" }}>
              <Logo size={20} />
            </div>
            AI Contract Copilot
          </Link>
          <div style={{ display: "flex", gap: 24, alignItems: "center", fontSize: 14 }}>
            <Link href="/dashboard" style={{ color: "#666666", textDecoration: "none" }}>Dashboard</Link>
            <button
              onClick={logout}
              style={{ background: "#f8f8f8", border: "1px solid #e0e0e0", color: "#666666", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontSize: 14 }}
            >
              Logout
            </button>
          </div>
        </nav>
      </header>

      <main style={{ background: "#fafafa", minHeight: "calc(100vh - 57px)" }}>
        <div style={{ borderBottom: "1px solid #f0f0f0", background: "#ffffff", padding: "48px 24px 40px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <p style={{ fontSize: 11, color: "#888888", textTransform: "uppercase", letterSpacing: "2px", fontWeight: 600, marginBottom: 12 }}>Account</p>
            <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 300, color: "#1a1a1a", letterSpacing: "-0.02em", margin: 0 }}>
              Settings
            </h1>
          </div>
        </div>

        <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>

          <section style={{ background: "#ffffff", border: "1px solid #e8e8e8", borderRadius: 8, marginBottom: 24 }}>
            <div style={{ padding: "20px 28px", borderBottom: "1px solid #f0f0f0" }}>
              <p style={{ fontSize: 11, color: "#888888", textTransform: "uppercase", letterSpacing: "2px", fontWeight: 600, margin: 0 }}>Profile</p>
            </div>
            <div style={{ padding: "28px" }}>
              <form onSubmit={handleSave}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    style={{ width: "100%", padding: "11px 14px", border: "1px solid #e8e8e8", borderRadius: 6, fontSize: 14, color: "#aaaaaa", background: "#fafafa", boxSizing: "border-box" }}
                  />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name"
                    style={{ width: "100%", padding: "11px 14px", border: "1px solid #e8e8e8", borderRadius: 6, fontSize: 14, color: "#1a1a1a", background: "#ffffff", boxSizing: "border-box", outline: "none" }}
                    onFocus={(e) => { e.target.style.borderColor = "#000000"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#e8e8e8"; }}
                  />
                </div>
                {saveErr && (
                  <p style={{ color: "#cc0000", fontSize: 13, marginBottom: 12 }}>{saveErr}</p>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  style={{ display: "flex", alignItems: "center", gap: 8, background: "#000000", color: "white", padding: "10px 20px", borderRadius: 4, border: "none", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", cursor: saving ? "not-allowed" : "pointer" }}
                  onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "#333333"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#000000"; }}
                >
                  {saved ? "Saved" : saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          </section>

          <section style={{ background: "#ffffff", border: "1px solid #e8e8e8", borderRadius: 8, marginBottom: 24 }}>
            <div style={{ padding: "20px 28px", borderBottom: "1px solid #f0f0f0" }}>
              <p style={{ fontSize: 11, color: "#888888", textTransform: "uppercase", letterSpacing: "2px", fontWeight: 600, margin: 0 }}>Plan and Usage</p>
            </div>
            <div style={{ padding: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <p style={{ fontSize: 11, color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4, fontWeight: 600 }}>Current Plan</p>
                  <p style={{ fontSize: 22, fontWeight: 300, color: "#1a1a1a", textTransform: "capitalize", margin: 0 }}>{userPlan || "Free"}</p>
                </div>
                <Link
                  href="/pricing"
                  style={{ background: "#000000", color: "white", padding: "10px 20px", borderRadius: 4, textDecoration: "none", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}
                >
                  {userPlan === "free" ? "Upgrade" : "Change Plan"}
                </Link>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <p style={{ fontSize: 13, color: "#666666", margin: 0 }}>Analyses used this month</p>
                <p style={{ fontSize: 13, color: "#1a1a1a", fontWeight: 500, margin: 0 }}>{user?.analyses_used ?? 0} / {planLimit}</p>
              </div>
              <div style={{ background: "#f0f0f0", borderRadius: 2, height: 4, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ height: "100%", background: usedPct >= 90 ? "#ef4444" : "#000000", width: `${usedPct}%`, transition: "width 0.6s ease" }} />
              </div>
              <p style={{ fontSize: 12, color: "#aaaaaa", margin: 0 }}>{user?.analyses_remaining ?? 0} remaining, resets monthly</p>
            </div>
          </section>

          <section style={{ background: "#ffffff", border: "1px solid #ffd0d0", borderRadius: 8 }}>
            <div style={{ padding: "20px 28px", borderBottom: "1px solid #ffd0d0" }}>
              <p style={{ fontSize: 11, color: "#cc0000", textTransform: "uppercase", letterSpacing: "2px", fontWeight: 600, margin: 0 }}>Danger Zone</p>
            </div>
            <div style={{ padding: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "#1a1a1a", marginBottom: 4 }}>Sign out of all devices</p>
                  <p style={{ fontSize: 13, color: "#888888", margin: 0 }}>Revokes your current session token</p>
                </div>
                <button
                  onClick={logout}
                  style={{ background: "#ffffff", color: "#cc0000", border: "1px solid #ffd0d0", padding: "10px 20px", borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: "pointer", textTransform: "uppercase", letterSpacing: "1px" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#fff5f5"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; }}
                >
                  Logout
                </button>
              </div>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}