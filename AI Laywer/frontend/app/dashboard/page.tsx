"use client";

import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { deleteContract, getAnalysis, listContracts, uploadContract } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import ProfileDropdown from "@/components/ProfileDropdown";
import {
  Logo, UploadIcon, LightningIcon, TargetIcon, ChartIcon,
  SpinnerIcon, DocumentIcon, ShieldIcon, CheckIcon,
} from "@/components/Icons";

type Contract = {
  id: string;
  filename: string;
  status: string;
  contract_type: string;
  size_bytes: number;
  word_count: number;
  created_at: string;
};

function fmt(bytes: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Dashboard() {
  return (
    <Suspense fallback={<main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><SpinnerIcon size={32} /></main>}>
      <DashboardInner />
    </Suspense>
  );
}

function DashboardInner() {
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "processing">("idle");
  const [progress, setProgress] = useState("");
  const [progressStep, setProgressStep] = useState(0);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();
  const params = useSearchParams();
  const upgraded = params.get("upgraded") === "true";
  const { isAuthenticated, user, userPlan, loading, refreshUser } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/login");
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (upgraded) refreshUser();
  }, [upgraded]);

  const loadHistory = useCallback(async () => {
    try {
      const data = await listContracts();
      setContracts(data);
    } catch { /* silent */ } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadHistory();
  }, [isAuthenticated, loadHistory]);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.match(/\.(pdf|docx)$/i)) {
      setError("Please upload a PDF or DOCX file only.");
      return;
    }
    if (pollRef.current) clearInterval(pollRef.current);
    try {
      setError("");
      setUploadStatus("uploading");
      setProgressStep(1);
      setProgress("Uploading file...");
      const { contract_id } = await uploadContract(file);
      setUploadStatus("processing");
      const steps = [
        "Extracting text from document...",
        "Detecting contract clauses...",
        "Running risk analysis rules...",
        "Generating AI insights...",
        "Finalising report...",
      ];
      let idx = 0;
      pollRef.current = setInterval(async () => {
        setProgressStep(Math.min(idx + 2, steps.length + 1));
        setProgress(steps[Math.min(idx++, steps.length - 1)]);
        try {
          const result = await getAnalysis(contract_id);
          if (result.status === "done") {
            clearInterval(pollRef.current!);
            router.push(`/dashboard/${contract_id}`);
          } else if (result.status === "error") {
            clearInterval(pollRef.current!);
            setError("Analysis failed. Please try re-uploading.");
            setUploadStatus("idle");
          }
        } catch {
          clearInterval(pollRef.current!);
          setError("Analysis check failed. Try re-uploading.");
          setUploadStatus("idle");
        }
      }, 2500);
    } catch (e: any) {
      setError(e.message || "Upload failed");
      setUploadStatus("idle");
    }
  }, [router]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteContract(id);
      setContracts(prev => prev.filter(c => c.id !== id));
      await refreshUser();
    } catch { /* silent */ } finally {
      setDeletingId(null);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const totalSteps = 6;
  const progressPct = Math.round((progressStep / totalSteps) * 100);
  const usedPct = user ? Math.min(100, Math.round((user.analyses_used / user.analyses_limit) * 100)) : 0;

  if (loading) return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff" }}>
      <SpinnerIcon size={32} />
    </main>
  );
  if (!isAuthenticated) return null;

  return (
    <>
      <header style={{ background: "#ffffff", borderBottom: "1px solid #f0f0f0", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <nav style={{ maxWidth: 1400, margin: "0 auto", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 20, fontWeight: 500, color: "#1a1a1a", textDecoration: "none", letterSpacing: "0.5px" }}>
            <div style={{ background: "#000000", padding: 6, borderRadius: 6, color: "white", display: "flex" }}>
              <Logo size={20} />
            </div>
            AI Contract Copilot
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Link href="/pricing" style={{ color: "#666666", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#1a1a1a"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#666666"; }}>
              Pricing
            </Link>
            <ProfileDropdown />
          </div>
        </nav>
      </header>

      <main style={{ minHeight: "calc(100vh - 57px)", background: "#fafafa" }}>
        {/* Upgraded banner */}
        {upgraded && (
          <div style={{ background: "#000000", color: "white", textAlign: "center", padding: "12px", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <CheckIcon size={16} />
            Plan upgraded successfully. Your new limits are active.
          </div>
        )}

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 32, alignItems: "start" }}>

            {/* ── LEFT COLUMN ── */}
            <div>
              {/* Upload section */}
              <div style={{ background: "#ffffff", border: "1px solid #e8e8e8", borderRadius: 8, marginBottom: 32 }}>
                <div style={{ padding: "24px 28px", borderBottom: "1px solid #f0f0f0" }}>
                  <p style={{ fontSize: 11, color: "#888888", textTransform: "uppercase", letterSpacing: "2px", fontWeight: 600, margin: 0 }}>New Analysis</p>
                </div>
                <div style={{ padding: "28px" }}>
                  {uploadStatus === "idle" && (
                    <>
                      <div
                        onDrop={onDrop}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onClick={() => document.getElementById("fi")?.click()}
                        style={{ border: `2px dashed ${dragOver ? "#000000" : "#d8d8d8"}`, borderRadius: 6, padding: "52px 32px", textAlign: "center", cursor: "pointer", background: dragOver ? "#f8f8f8" : "#fafafa", transition: "all 0.25s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#aaaaaa"; e.currentTarget.style.background = "#f8f8f8"; }}
                        onMouseLeave={(e) => { if (!dragOver) { e.currentTarget.style.borderColor = "#d8d8d8"; e.currentTarget.style.background = "#fafafa"; } }}
                      >
                        <div style={{ color: "#1a1a1a", marginBottom: 16, display: "flex", justifyContent: "center" }}>
                          <UploadIcon size={40} />
                        </div>
                        <p style={{ fontSize: 17, fontWeight: 400, color: "#1a1a1a", marginBottom: 6, letterSpacing: "-0.01em" }}>Drop your contract here</p>
                        <p style={{ color: "#aaaaaa", fontSize: 13, marginBottom: 20 }}>PDF or DOCX · up to 20 MB</p>
                        <div style={{ display: "inline-block", background: "#000000", color: "white", padding: "10px 24px", borderRadius: 4, fontSize: 13, fontWeight: 500, textTransform: "uppercase", letterSpacing: "1px" }}>
                          Choose File
                        </div>
                        <input id="fi" type="file" accept=".pdf,.docx" hidden onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                      </div>
                      {error && (
                        <div style={{ marginTop: 16, background: "#fff5f5", border: "1px solid #ffd0d0", borderRadius: 6, color: "#cc0000", padding: "12px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                          <span>⚠</span><span>{error}</span>
                        </div>
                      )}
                    </>
                  )}

                  {(uploadStatus === "uploading" || uploadStatus === "processing") && (
                    <div style={{ padding: "32px 0", textAlign: "center" }}>
                      <div style={{ color: "#1a1a1a", marginBottom: 20, display: "flex", justifyContent: "center" }}>
                        <SpinnerIcon size={40} />
                      </div>
                      <p style={{ fontSize: 17, fontWeight: 400, color: "#1a1a1a", marginBottom: 6 }}>{progress}</p>
                      <p style={{ color: "#aaaaaa", fontSize: 13, marginBottom: 28 }}>Usually 30–60 seconds</p>
                      <div style={{ background: "#f0f0f0", borderRadius: 2, height: 2, overflow: "hidden", marginBottom: 8 }}>
                        <div style={{ height: "100%", background: "#000000", width: `${progressPct}%`, transition: "width 0.6s ease" }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 24 }}>
                        {["Upload", "Extract", "Clauses", "Risk", "AI", "Done"].map((label, i) => (
                          <div key={i} style={{ textAlign: "center" }}>
                            <div style={{ width: 24, height: 24, borderRadius: "50%", background: progressStep > i ? "#000000" : "#f0f0f0", border: `1px solid ${progressStep > i ? "#000000" : "#e0e0e0"}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 4px", transition: "all 0.3s" }}>
                              {progressStep > i ? <span style={{ color: "white", fontSize: 10 }}>✓</span> : <span style={{ color: "#aaaaaa", fontSize: 9, fontWeight: 600 }}>{i + 1}</span>}
                            </div>
                            <span style={{ fontSize: 9, color: "#bbbbbb", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contract history */}
              <div style={{ background: "#ffffff", border: "1px solid #e8e8e8", borderRadius: 8 }}>
                <div style={{ padding: "20px 28px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontSize: 11, color: "#888888", textTransform: "uppercase", letterSpacing: "2px", fontWeight: 600, margin: 0 }}>
                    Recent Analyses
                  </p>
                  <span style={{ fontSize: 12, color: "#aaaaaa" }}>{contracts.length} contract{contracts.length !== 1 ? "s" : ""}</span>
                </div>

                {historyLoading ? (
                  <div style={{ padding: "40px", textAlign: "center" }}>
                    <SpinnerIcon size={24} />
                  </div>
                ) : contracts.length === 0 ? (
                  <div style={{ padding: "48px 28px", textAlign: "center" }}>
                    <div style={{ color: "#d0d0d0", marginBottom: 12, display: "flex", justifyContent: "center" }}>
                      <DocumentIcon size={36} />
                    </div>
                    <p style={{ color: "#aaaaaa", fontSize: 14 }}>No contracts analysed yet</p>
                  </div>
                ) : (
                  <div>
                    {contracts.map((c, i) => (
                      <div key={c.id} style={{ padding: "16px 28px", borderBottom: i < contracts.length - 1 ? "1px solid #f4f4f4" : "none", display: "flex", alignItems: "center", gap: 16, transition: "background 0.2s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#fafafa"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                        {/* Status dot */}
                        <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: c.status === "done" ? "#22c55e" : c.status === "error" ? "#ef4444" : "#f59e0b" }} />
                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 500, color: "#1a1a1a", margin: 0, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {c.filename}
                          </p>
                          <p style={{ fontSize: 12, color: "#aaaaaa", margin: 0 }}>
                            {c.contract_type || "—"} · {fmt(c.size_bytes)} · {timeAgo(c.created_at)}
                          </p>
                        </div>
                        {/* Actions */}
                        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                          {c.status === "done" && (
                            <Link href={`/dashboard/${c.id}`} style={{ fontSize: 12, color: "#1a1a1a", textDecoration: "none", padding: "6px 12px", border: "1px solid #e0e0e0", borderRadius: 4, fontWeight: 500, transition: "all 0.2s" }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = "#f8f8f8"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                              View
                            </Link>
                          )}
                          {c.status === "processing" && (
                            <span style={{ fontSize: 12, color: "#f59e0b", padding: "6px 12px" }}>Processing…</span>
                          )}
                          <button onClick={() => handleDelete(c.id)} disabled={deletingId === c.id} style={{ fontSize: 12, color: "#aaaaaa", background: "none", border: "none", cursor: "pointer", padding: "6px 8px", borderRadius: 4, transition: "all 0.2s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "#cc0000"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "#aaaaaa"; }}>
                            {deletingId === c.id ? "…" : "✕"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Usage card */}
              <div style={{ background: "#ffffff", border: "1px solid #e8e8e8", borderRadius: 8, padding: "24px" }}>
                <p style={{ fontSize: 11, color: "#888888", textTransform: "uppercase", letterSpacing: "2px", fontWeight: 600, marginBottom: 16 }}>Usage This Month</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 12 }}>
                  <span style={{ fontSize: 32, fontWeight: 300, color: "#1a1a1a", letterSpacing: "-0.02em" }}>{user?.analyses_used ?? 0}</span>
                  <span style={{ fontSize: 16, color: "#aaaaaa" }}>/ {user?.analyses_limit ?? 3}</span>
                </div>
                <div style={{ background: "#f0f0f0", borderRadius: 2, height: 3, marginBottom: 10, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: usedPct >= 90 ? "#ef4444" : "#000000", width: `${usedPct}%`, transition: "width 0.6s ease" }} />
                </div>
                <p style={{ fontSize: 12, color: "#aaaaaa", margin: 0 }}>
                  {user?.analyses_remaining ?? 0} remaining · resets monthly
                </p>
              </div>

              {/* Plan card */}
              <div style={{ background: "#ffffff", border: "1px solid #e8e8e8", borderRadius: 8, padding: "24px" }}>
                <p style={{ fontSize: 11, color: "#888888", textTransform: "uppercase", letterSpacing: "2px", fontWeight: 600, marginBottom: 16 }}>Your Plan</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontSize: 20, fontWeight: 300, color: "#1a1a1a", textTransform: "capitalize" }}>{userPlan || "Free"}</span>
                  <span style={{ background: "#f8f8f8", color: "#888888", padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", border: "1px solid #e0e0e0" }}>
                    {userPlan || "free"}
                  </span>
                </div>
                <Link href="/pricing" style={{ display: "block", textAlign: "center", background: "#000000", color: "white", padding: "10px", borderRadius: 4, textDecoration: "none", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", transition: "background 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#333333"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#000000"; }}>
                  {userPlan === "free" ? "Upgrade Plan" : "Manage Plan"}
                </Link>
              </div>

              {/* Features */}
              <div style={{ background: "#ffffff", border: "1px solid #e8e8e8", borderRadius: 8, padding: "24px" }}>
                <p style={{ fontSize: 11, color: "#888888", textTransform: "uppercase", letterSpacing: "2px", fontWeight: 600, marginBottom: 16 }}>What You Get</p>
                {[
                  { Icon: LightningIcon, title: "Fast Analysis", desc: "Under 60 seconds" },
                  { Icon: TargetIcon, title: "AI Accuracy", desc: "Multi-provider cascade" },
                  { Icon: ChartIcon, title: "Risk Scoring", desc: "Clause-by-clause" },
                  { Icon: DocumentIcon, title: "PDF Reports", desc: "Branded exports" },
                  { Icon: ShieldIcon, title: "Secure", desc: "JWT + encrypted storage" },
                ].map(({ Icon, title, desc }, i, arr) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: i < arr.length - 1 ? 12 : 0, marginBottom: i < arr.length - 1 ? 12 : 0, borderBottom: i < arr.length - 1 ? "1px solid #f4f4f4" : "none" }}>
                    <div style={{ color: "#888888", flexShrink: 0 }}><Icon size={16} /></div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a", margin: 0 }}>{title}</p>
                      <p style={{ fontSize: 12, color: "#aaaaaa", margin: 0 }}>{desc}</p>
                    </div>
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
