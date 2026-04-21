"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/lib/api";
import { Logo, CheckIcon, SpinnerIcon } from "@/components/Icons";

// Razorpay checkout types
declare global {
  interface Window {
    Razorpay: any;
  }
}

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "Free",
    period: "",
    description: "Try it out, no card needed",
    limit: "3 analyses / lifetime",
    features: [
      "3 contract analyses",
      "PDF & DOCX support",
      "Risk scoring",
      "Issue detection",
      "PDF report download",
    ],
    cta: "Current Plan",
    highlight: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: "₹2,400",
    period: "/month",
    description: "For solo practitioners",
    limit: "25 analyses / month",
    features: [
      "25 contract analyses / month",
      "PDF & DOCX support",
      "Full AI analysis (Groq + Gemini)",
      "Risk scoring & clause breakdown",
      "PDF report download",
      "Issue feedback",
      "Email support",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹6,500",
    period: "/month",
    description: "For growing legal teams",
    limit: "100 analyses / month",
    features: [
      "100 contract analyses / month",
      "Everything in Starter",
      "Priority AI processing",
      "Advanced clause analysis",
      "Bulk upload support",
      "API access",
      "Priority support",
    ],
    cta: "Get Pro",
    highlight: true,
  },
  {
    id: "team",
    name: "Team",
    price: "₹20,000",
    period: "/month",
    description: "For law firms & enterprises",
    limit: "500 analyses / month",
    features: [
      "500 contract analyses / month",
      "Everything in Pro",
      "Team collaboration",
      "Custom AI playbooks",
      "White-label reports",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    cta: "Get Team",
    highlight: false,
  },
];

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Pricing() {
  const { isAuthenticated, user, userPlan, refreshUser } = useAuth();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpgrade = async (planId: string) => {
    if (planId === "free") return;
    if (!isAuthenticated) { router.push("/register"); return; }
    if (planId === userPlan) return;

    setLoadingPlan(planId);
    setError("");
    setSuccess("");

    try {
      // 1. Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load Razorpay. Check your internet connection.");

      // 2. Create order on backend
      const order = await createRazorpayOrder(planId);

      // 3. Open Razorpay checkout
      type RzpResolve = (value: void | PromiseLike<void>) => void;
      await new Promise((resolve: RzpResolve, reject: (reason?: unknown) => void) => {
        const rzp = new window.Razorpay({
          key: order.key_id,
          amount: order.amount,
          currency: order.currency,
          name: "AI Contract Copilot",
          description: order.description,
          order_id: order.order_id,
          prefill: {
            email: user?.email || "",
          },
          theme: { color: "#000000" },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled")),
          },
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              // 4. Verify payment on backend → upgrades plan
              await verifyRazorpayPayment(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature,
              );
              await refreshUser();
              setSuccess(`You're now on the ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan.`);
              resolve();
            } catch (err: any) {
              reject(err);
            }
          },
        });
        rzp.open();
      });
    } catch (e: any) {
      if (e.message !== "Payment cancelled") {
        setError(e.message || "Payment failed. Please try again.");
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <>
      <header style={{ background: "#ffffff", borderBottom: "1px solid #f0f0f0", position: "sticky", top: 0, zIndex: 50 }}>
        <nav style={{ maxWidth: 1400, margin: "0 auto", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 20, fontWeight: 500, color: "#1a1a1a", textDecoration: "none", letterSpacing: "0.5px" }}>
            <div style={{ background: "#000000", padding: 6, borderRadius: 6, color: "white", display: "flex" }}>
              <Logo size={20} />
            </div>
            AI Contract Copilot
          </Link>
          <div style={{ display: "flex", gap: 32, alignItems: "center", fontSize: 15 }}>
            <Link href="/" style={{ color: "#666666", textDecoration: "none" }}>Home</Link>
            {isAuthenticated
              ? <Link href="/dashboard" style={{ color: "#666666", textDecoration: "none" }}>Dashboard</Link>
              : <Link href="/login" style={{ color: "#666666", textDecoration: "none" }}>Login</Link>
            }
          </div>
        </nav>
      </header>

      <main style={{ background: "#ffffff", minHeight: "calc(100vh - 57px)" }}>
        {/* Hero */}
        <div style={{ borderBottom: "1px solid #f0f0f0", padding: "72px 24px 64px", textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "#888888", textTransform: "uppercase", letterSpacing: "3px", fontWeight: 600, marginBottom: 16 }}>Pricing</p>
          <h1 style={{ fontSize: "clamp(2.4rem, 5vw, 3.6rem)", fontWeight: 300, color: "#1a1a1a", letterSpacing: "-0.03em", margin: "0 0 16px" }}>
            Simple, transparent pricing
          </h1>
          <p style={{ fontSize: 17, color: "#666666", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
            Start free. Upgrade when you need more. Secure payments via Razorpay.
          </p>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px" }}>
          {/* Alerts */}
          {error && (
            <div style={{ background: "#fff5f5", border: "1px solid #ffd0d0", borderRadius: 6, color: "#cc0000", padding: "14px 18px", fontSize: 14, marginBottom: 32, textAlign: "center" }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, color: "#166534", padding: "14px 18px", fontSize: 14, marginBottom: 32, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <CheckIcon size={16} /> {success}
              <Link href="/dashboard" style={{ color: "#166534", fontWeight: 600, marginLeft: 8 }}>Go to Dashboard →</Link>
            </div>
          )}

          {/* Plans grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {PLANS.map((plan) => {
              const isCurrent = userPlan === plan.id || (!userPlan && plan.id === "free");
              const isLoading = loadingPlan === plan.id;

              return (
                <div key={plan.id} style={{
                  border: plan.highlight ? "2px solid #000000" : "1px solid #e8e8e8",
                  borderRadius: 8,
                  padding: "36px 28px",
                  background: plan.highlight ? "#000000" : "#ffffff",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                }}>
                  {plan.highlight && (
                    <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#000000", color: "white", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", padding: "4px 14px", borderRadius: 20, border: "2px solid #ffffff" }}>
                      Most Popular
                    </div>
                  )}

                  {/* Plan name + price */}
                  <div style={{ marginBottom: 28 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: "#888888", marginBottom: 8 }}>
                      {plan.name}
                    </p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                      <span style={{ fontSize: 40, fontWeight: 300, color: plan.highlight ? "#ffffff" : "#1a1a1a", letterSpacing: "-0.03em", lineHeight: 1 }}>
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span style={{ fontSize: 14, color: plan.highlight ? "#888888" : "#aaaaaa" }}>{plan.period}</span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: plan.highlight ? "#888888" : "#aaaaaa", margin: 0 }}>{plan.description}</p>
                  </div>

                  {/* Features */}
                  <div style={{ borderTop: `1px solid ${plan.highlight ? "#222222" : "#f0f0f0"}`, paddingTop: 24, marginBottom: 28, flex: 1 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: plan.highlight ? "#666666" : "#aaaaaa", marginBottom: 16 }}>
                      {plan.limit}
                    </p>
                    {plan.features.map((f, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                        <div style={{ color: plan.highlight ? "#ffffff" : "#1a1a1a", flexShrink: 0, marginTop: 1 }}>
                          <CheckIcon size={14} />
                        </div>
                        <span style={{ fontSize: 14, color: plan.highlight ? "#cccccc" : "#4a4a4a", lineHeight: 1.4 }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isCurrent || isLoading || plan.id === "free"}
                    style={{
                      width: "100%",
                      padding: "13px",
                      borderRadius: 4,
                      border: plan.highlight ? "1px solid #ffffff" : "1px solid #000000",
                      background: isCurrent
                        ? (plan.highlight ? "#222222" : "#f8f8f8")
                        : (plan.highlight ? "#ffffff" : "#000000"),
                      color: isCurrent
                        ? (plan.highlight ? "#666666" : "#aaaaaa")
                        : (plan.highlight ? "#000000" : "#ffffff"),
                      fontSize: 13,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      cursor: isCurrent || plan.id === "free" ? "default" : "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                    onMouseEnter={(e) => { if (!isCurrent && plan.id !== "free") e.currentTarget.style.opacity = "0.85"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                  >
                    {isLoading ? <SpinnerIcon size={16} /> : null}
                    {isCurrent ? "Current Plan" : plan.cta}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Razorpay badge */}
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <p style={{ fontSize: 13, color: "#aaaaaa" }}>
              Secure payments powered by{" "}
              <span style={{ fontWeight: 600, color: "#666666" }}>Razorpay</span>
              {" "}· UPI, Cards, Net Banking, Wallets accepted
            </p>
          </div>

          {/* FAQ */}
          <div style={{ maxWidth: 720, margin: "64px auto 0" }}>
            <p style={{ fontSize: 11, color: "#888888", textTransform: "uppercase", letterSpacing: "2px", fontWeight: 600, marginBottom: 32, textAlign: "center" }}>
              Common Questions
            </p>
            {[
              { q: "Can I cancel anytime?", a: "Yes. Cancel from your account settings at any time. You keep access until the end of your billing period." },
              { q: "What counts as one analysis?", a: "Each contract file you upload counts as one analysis, regardless of file size or number of issues found." },
              { q: "Do unused analyses roll over?", a: "No. Monthly limits reset at the start of each billing cycle." },
              { q: "What payment methods are accepted?", a: "UPI, Credit/Debit cards, Net Banking, and popular wallets — all via Razorpay." },
              { q: "Is my data secure?", a: "Yes. Files are stored encrypted and only accessible to your account. We never share your contract data." },
            ].map(({ q, a }, i) => (
              <div key={i} style={{ borderBottom: "1px solid #f0f0f0", padding: "20px 0" }}>
                <p style={{ fontSize: 15, fontWeight: 500, color: "#1a1a1a", marginBottom: 8 }}>{q}</p>
                <p style={{ fontSize: 14, color: "#666666", lineHeight: 1.6, margin: 0 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
