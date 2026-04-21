"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";

const PLAN_BADGE: Record<string, { bg: string; color: string }> = {
  free:    { bg: "#f0f0f0", color: "#888888" },
  starter: { bg: "#000000", color: "#ffffff" },
  pro:     { bg: "#000000", color: "#ffffff" },
  team:    { bg: "#000000", color: "#ffffff" },
};

function Avatar({ name, avatarUrl, size = 34 }: { name: string; avatarUrl?: string; size?: number }) {
  const initials = name ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "?";
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} width={size} height={size} style={{ borderRadius: "50%", objectFit: "cover", display: "block" }} />;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "#1a1a1a", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 600, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

export default function ProfileDropdown() {
  const { user, userPlan, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  const plan = userPlan || "free";
  const badge = PLAN_BADGE[plan] || PLAN_BADGE.free;
  const usedPct = Math.min(100, Math.round((user.analyses_used / user.analyses_limit) * 100));

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "1px solid #e0e0e0", borderRadius: 8, padding: "5px 10px 5px 6px", cursor: "pointer", outline: "none" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#f8f8f8"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
      >
        <Avatar name={user.full_name || user.email} avatarUrl={user.avatar_url} size={28} />
        <span style={{ fontSize: 13, color: "#1a1a1a", fontWeight: 500, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {user.full_name || user.email.split("@")[0]}
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", color: "#888888" }}>
          <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 260, background: "#ffffff", border: "1px solid #e8e8e8", borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 100, overflow: "hidden" }}>
          <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <Avatar name={user.full_name || user.email} avatarUrl={user.avatar_url} size={40} />
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.full_name || "No name set"}
                </p>
                <p style={{ fontSize: 12, color: "#888888", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.email}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ background: badge.bg, color: badge.color, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", padding: "3px 8px", borderRadius: 4 }}>
                {plan}
              </span>
              <span style={{ fontSize: 11, color: "#aaaaaa" }}>{user.analyses_used}/{user.analyses_limit} analyses</span>
            </div>
            <div style={{ background: "#f0f0f0", borderRadius: 2, height: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", background: usedPct >= 90 ? "#ef4444" : "#000000", width: `${usedPct}%`, transition: "width 0.4s" }} />
            </div>
          </div>

          <div style={{ padding: "6px 0" }}>
            {[
              { href: "/dashboard", label: "Dashboard", icon: "⊞" },
              { href: "/account", label: "Account Settings", icon: "⚙" },
              { href: "/pricing", label: plan === "free" ? "Upgrade Plan" : "Manage Plan", icon: "◈" },
            ].map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", textDecoration: "none", color: "#1a1a1a", fontSize: 13 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f8f8f8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize: 14, color: "#888888", width: 18, textAlign: "center" }}>{icon}</span>
                {label}
              </Link>
            ))}
          </div>

          <div style={{ borderTop: "1px solid #f0f0f0", padding: "6px 0" }}>
            <button
              onClick={() => { setOpen(false); logout(); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", background: "none", border: "none", color: "#cc0000", fontSize: 13, cursor: "pointer", textAlign: "left" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fff5f5"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}