"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register, googleLoginUrl } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { Logo, SpinnerIcon, CheckIcon } from "@/components/Icons";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!fullName.trim()) { setError("Please enter your name."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const data = await register(email, password, fullName.trim());
      setToken(data.access_token);
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "11px 14px", border: "1px solid #e0e0e0",
    borderRadius: 6, fontSize: 14, color: "#1a1a1a", outline: "none",
    boxSizing: "border-box", background: "#ffffff",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#ffffff" }}>
      {/* Left: form */}
      <div style={{ width: 520, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 48px", borderRight: "1px solid #f0f0f0", flexShrink: 0, overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 36 }}>
            <div style={{ background: "#000000", padding: 8, borderRadius: 8, color: "white", display: "flex" }}>
              <Logo size={20} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 600, color: "#1a1a1a" }}>AI Contract Copilot</span>
          </Link>

          <h1 style={{ fontSize: 26, fontWeight: 500, color: "#1a1a1a", letterSpacing: "-0.02em", marginBottom: 6 }}>Create your account</h1>
          <p style={{ fontSize: 14, color: "#888888", marginBottom: 28 }}>Start analysing contracts free — no card required</p>

          <button
            type="button"
            onClick={() => { window.location.href = googleLoginUrl(); }}
            style={{ width: "100%", padding: "11px 16px", background: "#ffffff", border: "1px solid #e0e0e0", borderRadius: 6, fontSize: 14, fontWeight: 500, color: "#1a1a1a", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20, transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#f8f8f8"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "#e8e8e8" }} />
            <span style={{ fontSize: 12, color: "#aaaaaa", fontWeight: 500 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "#e8e8e8" }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#1a1a1a", marginBottom: 6 }}>Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" autoComplete="name" required style={inp}
                onFocus={(e) => { e.target.style.borderColor = "#000"; }} onBlur={(e) => { e.target.style.borderColor = "#e0e0e0"; }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#1a1a1a", marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required style={inp}
                onFocus={(e) => { e.target.style.borderColor = "#000"; }} onBlur={(e) => { e.target.style.borderColor = "#e0e0e0"; }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#1a1a1a", marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" autoComplete="new-password" required style={inp}
                onFocus={(e) => { e.target.style.borderColor = "#000"; }} onBlur={(e) => { e.target.style.borderColor = "#e0e0e0"; }} />
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#1a1a1a", marginBottom: 6 }}>Confirm Password</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat your password" autoComplete="new-password" required style={inp}
                onFocus={(e) => { e.target.style.borderColor = "#000"; }} onBlur={(e) => { e.target.style.borderColor = "#e0e0e0"; }} />
            </div>

            {error && (
              <div style={{ background: "#fff5f5", border: "1px solid #ffd0d0", borderRadius: 6, color: "#cc0000", padding: "11px 14px", fontSize: 13, marginBottom: 18 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "12px", background: loading ? "#555" : "#000", color: "white", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#333"; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#000"; }}>
              {loading ? <><SpinnerIcon size={16} /> Creating account...</> : "Create Account"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 13, color: "#888888", marginTop: 20 }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#000000", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
          </p>
          <p style={{ textAlign: "center", fontSize: 11, color: "#bbbbbb", marginTop: 12, lineHeight: 1.5 }}>
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>

      {/* Right: brand panel */}
      <div style={{ flex: 1, background: "#0a0a0a", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 72px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 480 }}>
          <p style={{ fontSize: 11, color: "#555555", textTransform: "uppercase", letterSpacing: "3px", fontWeight: 600, marginBottom: 24 }}>Free to start</p>
          <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", fontWeight: 300, color: "#ffffff", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: 24 }}>
            Analyse your first contract in under 60 seconds
          </h2>
          <p style={{ fontSize: 16, color: "#666666", lineHeight: 1.7, marginBottom: 48 }}>
            No credit card. No setup. Upload a PDF or DOCX and get a full risk report instantly.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              "3 free contract analyses included",
              "Risk scoring and clause-by-clause breakdown",
              "AI-generated suggested edits",
              "Downloadable PDF report",
              "Upgrade anytime, cancel anytime",
            ].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <CheckIcon size={11} />
                </div>
                <span style={{ fontSize: 14, color: "#888888" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
