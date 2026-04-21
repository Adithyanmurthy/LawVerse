"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import { semanticSearch } from "../../lib/api";

const ALL_TOPICS = [
  { q: "How did dowry laws change over the decades?", brief: "Track the evolution of Section 498A and dowry prohibition from 1961 to present day court interpretations" },
  { q: "Right to privacy landmark judgments", brief: "From Kharak Singh (1963) to Puttaswamy (2017) — how privacy became a fundamental right in India" },
  { q: "Sedition law constitutional challenges", brief: "Section 124A debates, Kedar Nath Singh ruling, and the ongoing push to repeal sedition laws" },
  { q: "Due process in Indian criminal courts", brief: "How Indian courts adopted and adapted due process protections under Article 21" },
  { q: "Free speech vs reasonable restrictions", brief: "Article 19(1)(a) and its limits — from Romesh Thappar to Shreya Singhal" },
  { q: "Negligence standards in medical malpractice", brief: "Evolution of duty of care and negligence in Indian medical law" },
  { q: "Habeas corpus during emergency periods", brief: "ADM Jabalpur and the dark chapter — how habeas corpus was suspended and restored" },
  { q: "Judicial review of legislative actions", brief: "Kesavananda Bharati and the basic structure doctrine that shaped Indian democracy" },
  { q: "Anticipatory bail conditions and limits", brief: "From Gurbaksh Singh Sibbia to modern interpretations of Section 438 CrPC" },
  { q: "Right to equality and reservation policy", brief: "Articles 14-16, Mandal Commission, creamy layer, and EWS reservation debates" },
  { q: "Environmental protection and liability", brief: "Bhopal gas tragedy, absolute liability doctrine, polluter pays principle, and green tribunals" },
  { q: "Consumer protection law evolution", brief: "From the 1986 Act to the 2019 overhaul — stronger rights, e-commerce coverage, and product liability" },
  { q: "Cyber crime laws and digital evidence", brief: "IT Act 2000, Section 66A strike-down, and the challenges of digital forensics in courts" },
  { q: "Arbitration law reforms in India", brief: "From the 1996 Act through 2015 and 2019 amendments — making India arbitration-friendly" },
  { q: "Contempt of court and free speech", brief: "Prashant Bhushan case and the fine line between criticism and contempt of judiciary" },
  { q: "Breach of contract remedies evolution", brief: "Specific performance, damages, and how Indian courts handle commercial disputes" },
  { q: "Money laundering prevention framework", brief: "PMLA 2002, ED powers, Vijay Madanlal Choudhary ruling, and constitutional challenges" },
  { q: "Right to education as fundamental right", brief: "Article 21A, the RTE Act 2009, and its impact on private schools and reservations" },
  { q: "Intellectual property rights in India", brief: "Patent law, copyright disputes, and trademark protection in the digital age" },
  { q: "Prevention of corruption act cases", brief: "How anti-corruption law evolved from 1947 to the 2018 amendment and its impact" },
  { q: "Land acquisition and compensation", brief: "From the colonial 1894 Act to the 2013 RFCTLARR Act — balancing development and rights" },
  { q: "Domestic violence protection laws", brief: "Protection of Women from Domestic Violence Act 2005 and its judicial interpretation" },
  { q: "Right to information act impact", brief: "RTI Act 2005 — transparency revolution, whistleblower protection, and government accountability" },
  { q: "Criminal law reforms BNS BNSS BSA", brief: "The 2023 overhaul replacing IPC, CrPC, and Evidence Act with Bharatiya Nyaya Sanhita" },
  { q: "Fundamental rights vs directive principles", brief: "The tension between Part III and Part IV of the Constitution and how courts balance them" },
  { q: "Bail jurisprudence in India", brief: "Bail is the rule, jail is the exception — how this principle evolved in Indian criminal law" },
  { q: "Death penalty and rarest of rare", brief: "Bachan Singh, Machhi Singh, and the evolving standards for capital punishment" },
  { q: "Transgender rights recognition", brief: "NALSA judgment and the legal recognition of third gender identity in India" },
  { q: "Triple talaq and personal law reform", brief: "Shayara Bano case and the criminalization of instant triple talaq" },
  { q: "Aadhaar and surveillance concerns", brief: "Puttaswamy II — balancing digital identity with privacy and data protection" },
  { q: "Defamation criminal vs civil remedies", brief: "Subramanian Swamy case and whether criminal defamation violates free speech" },
  { q: "Uniform civil code debates", brief: "Article 44, Goa model, and the ongoing debate on common personal law for all citizens" },
  { q: "SC ST Prevention of Atrocities Act", brief: "Dr. Subhash Kashinath Mahajan case, dilution concerns, and 2018 amendment restoration" },
  { q: "Lokpal and anti-corruption framework", brief: "From Anna Hazare movement to the Lokpal Act 2013 and its implementation challenges" },
  { q: "Mercy petition and presidential powers", brief: "Article 72, delay in execution, and judicial review of mercy petition decisions" },
  { q: "Property rights and eminent domain", brief: "From fundamental right to constitutional amendment — the journey of property rights in India" },
  { q: "Witness protection in criminal trials", brief: "The need for witness protection laws and the 2018 scheme approved by the Supreme Court" },
  { q: "Juvenile justice law reforms", brief: "From the 2000 Act to the 2015 amendment after the Nirbhaya case — trying juveniles as adults" },
  { q: "Right to food and public distribution", brief: "PUCL case, mid-day meal schemes, and the National Food Security Act 2013" },
  { q: "Marital rape criminalization debate", brief: "Exception 2 to Section 375 IPC and the ongoing constitutional challenge in Indian courts" },
  { q: "Electoral bonds and political funding", brief: "The 2024 Supreme Court verdict striking down electoral bonds as unconstitutional" },
  { q: "Collegium system for judicial appointments", brief: "Three Judges Cases, NJAC strike-down, and the debate over judicial independence" },
  { q: "Sedition vs national security laws", brief: "From colonial-era Section 124A to UAPA — how India balances dissent and security" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [expanded, setExpanded] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [jurisdiction, setJurisdiction] = useState("all");
  const [shuffled, setShuffled] = useState(ALL_TOPICS);

  const allQueries = ALL_TOPICS.map(t => t.q);

  // Shuffle every 10 seconds
  useEffect(() => {
    if (searched) return;
    const timer = setInterval(() => {
      setShuffled(prev => [...prev].sort(() => Math.random() - 0.5));
    }, 10000);
    return () => clearInterval(timer);
  }, [searched]);

  useEffect(() => {
    if (query.length < 2 || searched) { setSuggestions([]); return; }
    setSuggestions(allQueries.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 5));
  }, [query, searched]);

  const doSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true); setSearched(true); setSuggestions([]);
    try {
      const saved = JSON.parse(localStorage.getItem("lexiverse_searches") || "[]");
      localStorage.setItem("lexiverse_searches", JSON.stringify([q, ...saved.filter((s: string) => s !== q)].slice(0, 10)));
      const data = await semanticSearch(q, jurisdiction === "all" ? "" : jurisdiction);
      setResults(data.results || []);
    } catch { setResults([]); }
    setLoading(false);
  };

  const card: React.CSSProperties = { background: "white", border: "1px solid #eee", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", cursor: "pointer", transition: "all 0.25s ease" };
  const GW = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:9000";

  return (
    <>
      <Header />
      <div style={{ background: "#fafafa", minHeight: "calc(100vh - 60px)", padding: "24px 20px 40px" }}>
        {/* Search Bar */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>Semantic Search</h1>
          <p style={{ color: "#888", fontSize: 15, marginBottom: 14 }}>Search in natural language across 115,000+ legal documents</p>
          <div style={{ position: "relative", maxWidth: 650, margin: "0 auto" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={query} onChange={e => { setQuery(e.target.value); if (searched) { setSearched(false); setResults([]); } }}
                onKeyDown={e => e.key === "Enter" && doSearch(query)}
                placeholder="e.g. How did privacy rights evolve in India?"
                style={{ flex: 1, padding: "14px 18px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 16, outline: "none" }} />
              <button onClick={() => doSearch(query)} disabled={loading}
                style={{ padding: "14px 26px", background: "#1a1a1a", color: "white", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                {loading ? "..." : "Search"}
              </button>
            </div>
            {suggestions.length > 0 && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 60, background: "white", border: "1px solid #e0e0e0", borderTop: "none", borderRadius: "0 0 8px 8px", zIndex: 50, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
                {suggestions.map((s, i) => (
                  <div key={i} onClick={() => { setQuery(s); setSuggestions([]); doSearch(s); }}
                    style={{ padding: "10px 16px", fontSize: 13, color: "#444", cursor: "pointer", borderBottom: "1px solid #f5f5f5" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#f8f8f8"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "white"; }}>
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
          {searched && <button onClick={() => { setSearched(false); setResults([]); setQuery(""); }}
            style={{ marginTop: 8, background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 12 }}>← Back to recommendations</button>}
          {/* Jurisdiction Filter */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>
            {[{ key: "all", label: "All" }, { key: "India", label: "🇮🇳 India" }, { key: "US", label: "🇺🇸 United States" }, { key: "Europe", label: "🇪🇺 Europe" }].map(j => (
              <button key={j.key} onClick={() => setJurisdiction(j.key)}
                style={{ padding: "6px 16px", borderRadius: 20, fontSize: 13, cursor: "pointer", border: jurisdiction === j.key ? "2px solid #1a1a1a" : "1px solid #e0e0e0", background: jurisdiction === j.key ? "#1a1a1a" : "white", color: jurisdiction === j.key ? "white" : "#666", fontWeight: jurisdiction === j.key ? 600 : 400, transition: "all 0.2s" }}>
                {j.label}
              </button>
            ))}
          </div>
        </div>

        {/* ALL Recommendations - fill entire page, no rotation */}
        {!searched && !loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, padding: "0 4px" }}>
            {shuffled.map((topic, i) => (
              <div key={i} onClick={() => { setQuery(topic.q); doSearch(topic.q); }}
                style={{ ...card, padding: 16, display: "flex", flexDirection: "column", justifyContent: "space-between",  }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#1a1a1a"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#eee"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 6, lineHeight: 1.4 }}>{topic.q}</div>
                <div style={{ fontSize: 11, color: "#999", lineHeight: 1.4 }}>{topic.brief}</div>
              </div>
            ))}
          </div>
        )}

        {/* Search Results */}
        {searched && !loading && (
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <p style={{ color: "#888", fontSize: 13, marginBottom: 12 }}>{results.length} results found</p>
            {results.map((r, i) => {
              const name = (r.case_name && r.case_name.length > 3) ? r.case_name : (r.snippet || "").slice(0, 80) + "...";
              return (
                <div key={i} onClick={() => { setExpanded({ ...r, loadingFull: true }); fetch(`${GW}/api/lcet/documents/${r.id}`).then(res => res.ok ? res.json() : null).then(d => { if (d) setExpanded((p: any) => ({ ...p, fullText: d.text, case_name: d.case_name || p.case_name, loadingFull: false })); else setExpanded((p: any) => ({ ...p, loadingFull: false })); }).catch(() => setExpanded((p: any) => ({ ...p, loadingFull: false }))); }}
                  style={{ ...card, padding: 18, marginBottom: 10 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#ccc"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#eee"; }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", marginBottom: 3 }}>{name}</div>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>{r.court} {r.year ? `· ${r.year}` : ""} {r.relevance_score ? `· ${(r.relevance_score * 100).toFixed(1)}% match` : ""}</div>
                  <div style={{ fontSize: 13, color: "#666", lineHeight: 1.5 }}>{(r.snippet || "").slice(0, 300)}</div>
                </div>
              );
            })}
            {results.length === 0 && <p style={{ color: "#aaa", textAlign: "center", padding: 40 }}>No results found.</p>}
          </div>
        )}

        {loading && <div style={{ textAlign: "center", padding: 60 }}><p style={{ color: "#888" }}>Searching across 115,000+ documents...</p><p style={{ color: "#aaa", fontSize: 12 }}>First search loads the AI model — may take 15-30 seconds. After that, searches are instant.</p></div>}
      </div>

      {/* Full Document Modal */}
      {expanded && (
        <div onClick={() => setExpanded(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 12, maxWidth: 800, width: "100%", maxHeight: "90vh", overflow: "auto", padding: 32, position: "relative" }}>
            <button onClick={() => setExpanded(null)} style={{ position: "sticky", top: 0, float: "right", background: "#f0f0f0", border: "none", width: 32, height: 32, borderRadius: "50%", fontSize: 16, cursor: "pointer", color: "#666" }}>✕</button>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a1a", marginBottom: 6, paddingRight: 40 }}>
              {(expanded.case_name && expanded.case_name.length > 3) ? expanded.case_name : "Case Document"}
            </h2>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>{expanded.court} {expanded.year ? `· ${expanded.year}` : ""}</div>
            <div style={{ fontSize: 14, color: "#444", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
              {expanded.loadingFull ? "Loading full document..." : (expanded.fullText || expanded.text || expanded.snippet || "Full text not available.")}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
