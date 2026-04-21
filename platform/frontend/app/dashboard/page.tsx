"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuth } from "@/components/AuthProvider";

export default function DashboardPage() {
  const { isAuthenticated, user, userPlan, loading } = useAuth();
  const router = useRouter();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/login");
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lexiverse_searches");
      if (saved) setRecentSearches(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  if (loading || !isAuthenticated) return null;

  const quickLinks = [
    { href: "/search", label: "Search Cases", desc: "Semantic search across 120K+ documents" },
    { href: "/timeline", label: "Timeline", desc: "Track concept evolution over decades" },
    { href: "/smi", label: "SMI Dashboard", desc: "Compute semantic drift scores" },
    { href: "/cases", label: "Case Library", desc: "Browse Indian court cases" },
    { href: "/contract", label: "Contract Analysis", desc: "Upload and analyze contracts" },
    { href: "/alerts", label: "Drift Alerts", desc: "Monitor legal concept changes" },
  ];

  return (
    <>
      <Header />
      <div style={{ background: "#fafafa", minHeight: "100vh", padding: "40px 24px 60px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 28, fontWeight: 600, color: "#1a1a1a", marginBottom: 4 }}>
              Welcome back, {user?.full_name || "there"}
            </h1>
            <p style={{ color: "#666", fontSize: 15 }}>
              Here&apos;s your LawVerse activity overview
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
            {[
              { label: "Plan", value: (userPlan || "free").toUpperCase() },
              { label: "Contracts Analyzed", value: user?.analyses_used ?? 0 },
              { label: "Analyses Remaining", value: user?.analyses_remaining ?? "—" },
              { label: "Recent Searches", value: recentSearches.length },
            ].map((stat, i) => (
              <div key={i} style={{
                background: "white", border: "1px solid #f0f0f0", borderRadius: 8,
                padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
              }}>
                <div style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#1a1a1a" }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a1a", marginBottom: 16 }}>Quick Access</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
            {quickLinks.map((link, i) => (
              <Link key={i} href={link.href} style={{
                background: "white", border: "1px solid #f0f0f0", borderRadius: 8,
                padding: 24, textDecoration: "none",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#000"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#f0f0f0"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", marginBottom: 4 }}>{link.label}</div>
                <div style={{ fontSize: 13, color: "#888" }}>{link.desc}</div>
              </Link>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div style={{
              background: "white", border: "1px solid #f0f0f0", borderRadius: 8,
              padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1a1a1a", marginBottom: 16 }}>Recent Searches</h3>
              {recentSearches.length > 0 ? (
                recentSearches.map((q, i) => (
                  <Link key={i} href={`/search?q=${encodeURIComponent(q)}`} style={{
                    display: "block", padding: "10px 0", borderBottom: "1px solid #f5f5f5",
                    color: "#444", textDecoration: "none", fontSize: 14,
                  }}>
                    {q}
                  </Link>
                ))
              ) : (
                <p style={{ color: "#aaa", fontSize: 14 }}>No searches yet. Try the <Link href="/search" style={{ color: "#1a1a1a", fontWeight: 500 }}>Search</Link> feature.</p>
              )}
            </div>

            <div style={{
              background: "white", border: "1px solid #f0f0f0", borderRadius: 8,
              padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1a1a1a", marginBottom: 16 }}>Account</h3>
              <div style={{ fontSize: 14, color: "#444", lineHeight: 2 }}>
                <div><strong>Name:</strong> {user?.full_name || "—"}</div>
                <div><strong>Email:</strong> {user?.email || "—"}</div>
                <div><strong>Plan:</strong> {(userPlan || "free").toUpperCase()}</div>
              </div>
              <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
                <Link href="/account" style={{
                  padding: "8px 16px", borderRadius: 6, border: "1px solid #e0e0e0",
                  color: "#444", textDecoration: "none", fontSize: 13,
                }}>Account Settings</Link>
                <Link href="/pricing" style={{
                  padding: "8px 16px", borderRadius: 6, background: "#000", color: "white",
                  textDecoration: "none", fontSize: 13,
                }}>Upgrade Plan</Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
