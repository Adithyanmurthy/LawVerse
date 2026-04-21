"use client";

import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Header from "./Header";

// Pages that require login
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/login");
  }, [loading, isAuthenticated, router]);

  if (loading) return <><Header /><div style={{ minHeight: "100vh", background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ color: "#666" }}>Loading...</p></div></>;
  if (!isAuthenticated) return null;
  return <>{children}</>;
}

// Pages that require a paid plan (pro or team) — admin bypasses
export function RequirePaid({ children, feature }: { children: React.ReactNode; feature: string }) {
  const { isAuthenticated, user, userPlan, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/login");
  }, [loading, isAuthenticated, router]);

  if (loading) return <><Header /><div style={{ minHeight: "100vh", background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ color: "#666" }}>Loading...</p></div></>;
  if (!isAuthenticated) return null;

  const isPaid = userPlan === "pro" || userPlan === "team" || userPlan === "starter" || userPlan === "firm";
  const isAdmin = user?.email === "admin@lexiverse.in";

  if (isPaid || isAdmin) return <>{children}</>;

  return (
    <>
      <Header />
      <div style={{ minHeight: "100vh", background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ background: "white", border: "1px solid #f0f0f0", borderRadius: 12, padding: 48, textAlign: "center", maxWidth: 480, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>{feature} requires a paid plan</h2>
          <p style={{ color: "#666", marginBottom: 24, lineHeight: 1.6 }}>Upgrade to Professional (₹499/mo) or Law Firm (₹2,999/mo) to access {feature}.</p>
          <Link href="/pricing" style={{ display: "inline-block", background: "#000", color: "white", padding: "12px 32px", borderRadius: 6, textDecoration: "none", fontWeight: 500, fontSize: 14 }}>
            View Plans
          </Link>
        </div>
      </div>
    </>
  );
}
