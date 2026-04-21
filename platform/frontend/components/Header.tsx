"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { Logo } from "./Icons";
import ProfileDropdown from "./ProfileDropdown";

const platformLinks = [
  { href: "/search", label: "Search" },
  { href: "/timeline", label: "Timeline" },
  { href: "/smi", label: "SMI Dashboard" },
  { href: "/cases", label: "Case Library" },
  { href: "/contract", label: "Contract Analysis" },
  { href: "/alerts", label: "Alerts" },
];

export default function Header() {
  const { isAuthenticated } = useAuth();
  const [platformOpen, setPlatformOpen] = useState(false);

  return (
    <header style={{
      background: "#ffffff", borderBottom: "1px solid #f0f0f0",
      position: "sticky", top: 0, zIndex: 50,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
    }}>
      <nav style={{
        maxWidth: 1400, margin: "0 auto", padding: "14px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: 12,
          fontSize: 20, fontWeight: 500, color: "#1a1a1a",
          textDecoration: "none", letterSpacing: "0.5px", transition: "opacity 0.2s"
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}>
          <div style={{ background: "#000000", padding: 6, borderRadius: 6, color: "white", display: "flex" }}>
            <Logo size={20} />
          </div>
          LawVerse
        </Link>

        <div style={{ display: "flex", gap: 32, alignItems: "center", fontSize: 15 }}>
          {/* Product Dropdown */}
          <div style={{ position: "relative" }}
            onMouseEnter={() => setPlatformOpen(true)}
            onMouseLeave={() => setPlatformOpen(false)}>
            <span style={{ color: "#666666", cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#1a1a1a"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#666666"; }}>
              Product ▾
            </span>
            {platformOpen && (
              <div style={{
                position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
                paddingTop: 0, zIndex: 100,
              }}>
              <div style={{
                width: 200, background: "#ffffff",
                border: "1px solid #f0f0f0", borderRadius: 8,
                padding: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              }}>
                {platformLinks.map(({ href, label }) => (
                  <Link key={href} href={href} style={{
                    display: "block", padding: "10px 14px", borderRadius: 6,
                    color: "#444", textDecoration: "none", fontSize: 14, transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#f5f5f5"; e.currentTarget.style.color = "#000"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#444"; }}>
                    {label}
                  </Link>
                ))}
              </div>
              </div>
            )}
          </div>

          <Link href="/pricing" style={{ color: "#666666", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#1a1a1a"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#666666"; }}>
            Pricing
          </Link>
          <Link href="/#trust" style={{ color: "#666666", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#1a1a1a"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#666666"; }}>
            Security
          </Link>

          {isAuthenticated ? (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Link href="/dashboard" style={{ color: "#666666", textDecoration: "none", fontSize: 15, transition: "color 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#1a1a1a"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#666666"; }}>
                Dashboard
              </Link>
              <ProfileDropdown />
            </div>
          ) : (
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <Link href="/login" style={{ color: "#666666", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#1a1a1a"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#666666"; }}>
                Login
              </Link>
              <Link href="/register" style={{
                background: "#000000", color: "white", padding: "10px 20px",
                borderRadius: 6, textDecoration: "none", fontWeight: 500, fontSize: 14,
                textTransform: "uppercase", letterSpacing: "1px", transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#333333"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#000000"; }}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
