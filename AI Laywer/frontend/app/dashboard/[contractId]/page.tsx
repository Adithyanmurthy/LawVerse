"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

import { getAnalysis, downloadReport } from "@/lib/api";
import { Logo, ArrowLeftIcon, DownloadIcon, CopyIcon, CheckIcon, SpinnerIcon, AlertIcon, BulbIcon, ShieldIcon, ChartIcon } from "@/components/Icons";

type Props = { params: Promise<{ contractId: string }> };

const RISK_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  LOW:      { color: "#166534", bg: "#f0fdf4", border: "#bbf7d0", label: "Low Risk" },
  MEDIUM:   { color: "#92400e", bg: "#fffbeb", border: "#fde68a", label: "Medium Risk" },
  HIGH:     { color: "#991b1b", bg: "#fff5f5", border: "#fecaca", label: "High Risk" },
  CRITICAL: { color: "#7f1d1d", bg: "#fff1f1", border: "#fca5a5", label: "Critical Risk" },
};

export default function Results({ params }: Props) {
  const { contractId } = use(params);
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState("");
  const [activeTab, setActiveTab] = useState<"issues" | "clauses">("issues");

  useEffect(() => {
    getAnalysis(contractId).then(setData).catch(() => setData({ status: "error" }));
  }, [contractId]);

  const copyText = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 1500);
  };

  const handleDownloadReport = async () => {
    try {
      const blob = await downloadReport(contractId);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `contract-report-${contractId.slice(0, 8)}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (e: any) {
      alert(e.message || "Download failed");
    }
  };

  // Shared header
  const Header = () => (
    <header style={{
      background: "#ffffff", borderBottom: "1px solid #f0f0f0",
      position: "sticky", top: 0, zIndex: 50,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
    }}>
      <nav style={{
        maxWidth: 1400, margin: "0 auto", padding: "16px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: 12,
          fontSize: 20, fontWeight: 500, color: "#1a1a1a",
          textDecoration: "none", letterSpacing: "0.5px"
        }}>
          <div style={{ background: "#000000", padding: 6, borderRadius: 6, color: "white" }}>
            <Logo size={20} />
          </div>
          AI Contract Copilot
        </Link>
        <Link href="/dashboard" style={{
          display: "flex", alignItems: "center", gap: 8,
          color: "#666666", textDecoration: "none", fontSize: 14,
          fontWeight: 400, transition: "color 0.3s ease"
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#1a1a1a"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "#666666"; }}>
          <ArrowLeftIcon size={16} />
          Back to Dashboard
        </Link>
      </nav>
    </header>
  );

  if (!data) return (
    <>
      <Header />
      <main style={{ minHeight: "calc(100vh - 57px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#1a1a1a", marginBottom: 20, display: "flex", justifyContent: "center" }}>
            <SpinnerIcon size={40} />
          </div>
          <p style={{ color: "#888888", fontSize: 15, fontWeight: 400 }}>Loading analysis...</p>
        </div>
      </main>
    </>
  );

  if (data.status === "processing") return (
    <>
      <Header />
      <main style={{ minHeight: "calc(100vh - 57px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff" }}>
        <div className="animate-fadeIn" style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ color: "#1a1a1a", marginBottom: 20, display: "flex", justifyContent: "center" }}>
            <SpinnerIcon size={40} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 300, marginBottom: 10, color: "#1a1a1a", letterSpacing: "-0.01em" }}>
            Analysis in progress
          </h2>
          <p style={{ color: "#888888", marginBottom: 28, fontSize: 15 }}>
            Your contract is being analysed. Refresh in a few seconds.
          </p>
          <button onClick={() => window.location.reload()} style={{
            background: "#000000", color: "white",
            padding: "12px 28px", borderRadius: 4, border: "none",
            fontWeight: 500, cursor: "pointer", fontSize: 14,
            textTransform: "uppercase", letterSpacing: "1px",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#333333"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#000000"; }}>
            Refresh
          </button>
        </div>
      </main>
    </>
  );

  if (data.status === "error") return (
    <>
      <Header />
      <main style={{ minHeight: "calc(100vh - 57px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff" }}>
        <div className="animate-fadeIn" style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ color: "#cc0000", marginBottom: 20, display: "flex", justifyContent: "center" }}>
            <AlertIcon size={40} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 300, marginBottom: 10, color: "#1a1a1a" }}>Analysis failed</h2>
          <p style={{ color: "#888888", marginBottom: 28, fontSize: 15 }}>
            We couldn't load the analysis. Please try uploading again.
          </p>
          <Link href="/dashboard" style={{
            display: "inline-block", background: "#000000", color: "white",
            padding: "12px 28px", borderRadius: 4, textDecoration: "none",
            fontWeight: 500, fontSize: 14, textTransform: "uppercase", letterSpacing: "1px"
          }}>
            Back to Dashboard
          </Link>
        </div>
      </main>
    </>
  );

  const risk = RISK_CONFIG[data.risk_level || "MEDIUM"];
  const issues: any[] = data.issues || [];
  const clauses: any[] = data.clauses || [];

  return (
    <>
      <Header />
      <main style={{ minHeight: "calc(100vh - 57px)", background: "#ffffff" }}>

        {/* Title strip */}
        <div style={{ borderBottom: "1px solid #f0f0f0", padding: "48px 24px 40px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <p style={{ fontSize: 13, color: "#888888", textTransform: "uppercase", letterSpacing: "2px", marginBottom: 12, fontWeight: 500 }}>
              Analysis Result
            </p>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
              <div>
                <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 300, color: "#1a1a1a", letterSpacing: "-0.02em", margin: 0, marginBottom: 8 }}>
                  {data.filename || "Contract Analysis"}
                </h1>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <span style={{
                    background: risk.bg, color: risk.color,
                    border: `1px solid ${risk.border}`,
                    padding: "4px 12px", borderRadius: 4,
                    fontSize: 12, fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: "1px"
                  }}>
                    {risk.label}
                  </span>
                  <span style={{ color: "#888888", fontSize: 14 }}>
                    Risk score: <strong style={{ color: "#1a1a1a" }}>{data.risk_score}/10</strong>
                  </span>
                  {data.contract_type && (
                    <span style={{ color: "#888888", fontSize: 14 }}>
                      Type: <strong style={{ color: "#1a1a1a" }}>{data.contract_type}</strong>
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={handleDownloadReport} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "#000000", color: "white",
                  padding: "12px 20px", borderRadius: 4, border: "none",
                  fontWeight: 500, cursor: "pointer", fontSize: 14,
                  textTransform: "uppercase", letterSpacing: "1px",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#333333"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#000000"; }}>
                  <DownloadIcon size={16} />
                  PDF Report
                </button>
                <button onClick={() => copyText(issues.map((x) => x.suggested_edit).join("\n\n"), "all")} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "#ffffff", color: "#1a1a1a",
                  padding: "12px 20px", borderRadius: 4,
                  border: "1px solid #e0e0e0",
                  fontWeight: 500, cursor: "pointer", fontSize: 14,
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f8f8f8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; }}>
                  {copied === "all" ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                  {copied === "all" ? "Copied" : "Copy All"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 48, alignItems: "start" }}>

            {/* Left — main content */}
            <div>
              {/* Summary */}
              <div style={{ marginBottom: 48 }}>
                <p style={{ fontSize: 11, color: "#888888", textTransform: "uppercase", letterSpacing: "2px", marginBottom: 16, fontWeight: 500 }}>
                  Summary
                </p>
                <p style={{ fontSize: 16, color: "#4a4a4a", lineHeight: 1.8, fontWeight: 400 }}>
                  {data.summary}
                </p>
              </div>

              {/* Tabs */}
              <div style={{ borderBottom: "1px solid #e0e0e0", marginBottom: 32, display: "flex", gap: 0 }}>
                {(["issues", "clauses"] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    background: "none", border: "none",
                    padding: "14px 24px", fontSize: 15, fontWeight: 400,
                    color: activeTab === tab ? "#1a1a1a" : "#888888",
                    borderBottom: activeTab === tab ? "2px solid #000000" : "2px solid transparent",
                    cursor: "pointer", transition: "all 0.3s ease",
                    textTransform: "capitalize", letterSpacing: "0.3px"
                  }}>
                    {tab === "issues" ? `Issues (${issues.length})` : `Clauses (${clauses.length})`}
                  </button>
                ))}
              </div>

              {/* Issues tab */}
              {activeTab === "issues" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {issues.length === 0 && (
                    <div style={{ padding: "48px 0", textAlign: "center", color: "#888888", fontSize: 15 }}>
                      No issues detected.
                    </div>
                  )}
                  {issues.map((issue: any, idx: number) => (
                    <article key={`${issue.clause_id}-${idx}`} className="animate-fadeIn" style={{
                      border: "1px solid #f0f0f0", borderRadius: 6,
                      padding: 28, marginBottom: 16, background: "#ffffff",
                      transition: "border-color 0.3s ease"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#d0d0d0"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#f0f0f0"; }}>
                      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                        <span style={{
                          background: "#f8f8f8", color: "#1a1a1a",
                          padding: "4px 10px", borderRadius: 4,
                          fontSize: 12, fontWeight: 600,
                          textTransform: "uppercase", letterSpacing: "0.5px",
                          border: "1px solid #e0e0e0"
                        }}>
                          {issue.tag === "ip" || issue.tag === "intellectual_property"
                            ? "IP"
                            : issue.tag.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </span>
                        <span style={{ color: "#aaaaaa", fontSize: 12, padding: "4px 0" }}>
                          {issue.clause_id}
                        </span>
                      </div>

                      <p style={{ color: "#4a4a4a", lineHeight: 1.7, marginBottom: 20, fontSize: 15 }}>
                        {issue.explanation}
                      </p>

                      <div style={{
                        background: "#fafafa", border: "1px solid #f0f0f0",
                        borderRadius: 6, padding: 20
                      }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ color: "#888888" }}><BulbIcon size={16} /></span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                              Suggested Edit
                            </span>
                          </div>
                          <button onClick={() => copyText(issue.suggested_edit, `s${idx}`)} style={{
                            display: "flex", alignItems: "center", gap: 6,
                            background: "#ffffff", color: "#666666",
                            border: "1px solid #e0e0e0", borderRadius: 4,
                            padding: "6px 12px", cursor: "pointer",
                            fontSize: 12, fontWeight: 500, transition: "all 0.3s ease"
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#f0f0f0"; e.currentTarget.style.color = "#1a1a1a"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.color = "#666666"; }}>
                            {copied === `s${idx}` ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                            {copied === `s${idx}` ? "Copied" : "Copy"}
                          </button>
                        </div>
                        <p style={{ color: "#4a4a4a", margin: 0, lineHeight: 1.7, fontSize: 14 }}>
                          {issue.suggested_edit}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* Clauses tab */}
              {activeTab === "clauses" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {clauses.length === 0 && (
                    <div style={{ padding: "48px 0", textAlign: "center", color: "#888888", fontSize: 15 }}>
                      No clause data available.
                    </div>
                  )}
                  {clauses.map((clause: any, idx: number) => (
                    <div key={idx} style={{
                      border: "1px solid #f0f0f0", borderRadius: 6,
                      padding: "20px 24px", marginBottom: 12,
                      transition: "border-color 0.3s ease"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#d0d0d0"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#f0f0f0"; }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            {clause.clause_id || clause.type || `Clause ${idx + 1}`}
                          </p>
                          <p style={{ fontSize: 14, color: "#4a4a4a", lineHeight: 1.6, margin: 0 }}>
                            {clause.text || clause.summary || clause.content || "—"}
                          </p>
                        </div>
                        {clause.risk_level && (
                          <span style={{
                            background: RISK_CONFIG[clause.risk_level]?.bg || "#f8f8f8",
                            color: RISK_CONFIG[clause.risk_level]?.color || "#888888",
                            border: `1px solid ${RISK_CONFIG[clause.risk_level]?.border || "#e0e0e0"}`,
                            padding: "3px 10px", borderRadius: 4,
                            fontSize: 11, fontWeight: 600,
                            textTransform: "uppercase", letterSpacing: "0.5px",
                            flexShrink: 0
                          }}>
                            {clause.risk_level}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right — metadata sidebar */}
            <div>
              {/* Risk meter */}
              <div style={{ border: "1px solid #f0f0f0", borderRadius: 8, padding: "24px", marginBottom: 24 }}>
                <p style={{ fontSize: 11, color: "#888888", textTransform: "uppercase", letterSpacing: "2px", marginBottom: 20, fontWeight: 500 }}>
                  Risk Score
                </p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 16 }}>
                  <span style={{ fontSize: 52, fontWeight: 300, color: "#1a1a1a", lineHeight: 1, letterSpacing: "-0.03em" }}>
                    {data.risk_score}
                  </span>
                  <span style={{ fontSize: 20, color: "#aaaaaa", fontWeight: 300 }}>/10</span>
                </div>
                <div style={{ background: "#f0f0f0", borderRadius: 2, height: 4, marginBottom: 12, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    background: data.risk_score >= 7 ? "#cc0000" : data.risk_score >= 4 ? "#d97706" : "#16a34a",
                    width: `${(data.risk_score / 10) * 100}%`,
                    transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)"
                  }} />
                </div>
                <span style={{
                  background: risk.bg, color: risk.color,
                  border: `1px solid ${risk.border}`,
                  padding: "4px 10px", borderRadius: 4,
                  fontSize: 11, fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "1px"
                }}>
                  {risk.label}
                </span>
              </div>

              {/* Contract metadata */}
              <div style={{ border: "1px solid #f0f0f0", borderRadius: 8, padding: "24px" }}>
                <p style={{ fontSize: 11, color: "#888888", textTransform: "uppercase", letterSpacing: "2px", marginBottom: 20, fontWeight: 500 }}>
                  Details
                </p>
                {[
                  { label: "Contract Type", value: data.contract_type },
                  { label: "Governing Law", value: data.governing_law },
                  { label: "Parties", value: Array.isArray(data.parties) ? data.parties.join(", ") : data.parties },
                  { label: "Confidence", value: data.confidence ? `${Math.round(data.confidence * 100)}%` : null },
                  { label: "Processing", value: data.processing_ms ? `${(data.processing_ms / 1000).toFixed(1)}s` : null },
                ].filter(d => d.value).map(({ label, value }, i, arr) => (
                  <div key={i} style={{
                    paddingBottom: i < arr.length - 1 ? 14 : 0,
                    marginBottom: i < arr.length - 1 ? 14 : 0,
                    borderBottom: i < arr.length - 1 ? "1px solid #f0f0f0" : "none"
                  }}>
                    <p style={{ fontSize: 11, color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4, fontWeight: 500 }}>
                      {label}
                    </p>
                    <p style={{ fontSize: 14, color: "#1a1a1a", fontWeight: 400, margin: 0 }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
