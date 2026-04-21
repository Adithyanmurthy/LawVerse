import { getToken } from "./auth";

const GATEWAY = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:9000";

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${GATEWAY}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || "Request failed");
  }
  return res.json();
}

// ── Auth (via Contract backend) ───────────────────────────────────────────────
export async function register(email: string, password: string, full_name = "") {
  return request("/api/contract/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, full_name }),
  });
}

export async function login(email: string, password: string) {
  return request("/api/contract/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export async function getCurrentUser() {
  return request("/api/contract/auth/me");
}

export async function updateProfile(data: { full_name?: string }) {
  return request("/api/contract/auth/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function googleLoginUrl(): string {
  return `${GATEWAY}/api/contract/auth/google`;
}

// ── Contracts ─────────────────────────────────────────────────────────────────
export async function uploadContract(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  return request("/api/contract/contracts/upload", { method: "POST", body: fd });
}

export async function listContracts() {
  return request("/api/contract/contracts");
}

export async function deleteContract(contractId: string) {
  return request(`/api/contract/contracts/${contractId}`, { method: "DELETE" });
}

// ── Analyses ──────────────────────────────────────────────────────────────────
export async function getAnalysis(contractId: string) {
  return request(`/api/contract/analyses/${contractId}`);
}

export async function downloadReport(contractId: string): Promise<Blob> {
  const token = getToken();
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${GATEWAY}/api/contract/analyses/${contractId}/report`, { headers });
  if (!res.ok) throw new Error("Download failed");
  return res.blob();
}

export async function submitFeedback(analysisId: string, clauseId: string, isCorrect: boolean, comment = "") {
  const params = new URLSearchParams({ clause_id: clauseId, is_correct: String(isCorrect), comment });
  return request(`/api/contract/analyses/${analysisId}/feedback?${params}`, { method: "POST" });
}

// ── Billing (Unified) ─────────────────────────────────────────────────────────
export async function getPlans() {
  return request("/api/billing/plans");
}

export async function createRazorpayOrder(plan: string, billing = "monthly") {
  return request("/api/billing/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan, billing }),
  });
}

export async function verifyRazorpayPayment(order_id: string, payment_id: string, signature: string, plan: string) {
  return request("/api/billing/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ razorpay_order_id: order_id, razorpay_payment_id: payment_id, razorpay_signature: signature, plan }),
  });
}

// ── LCET: Search ──────────────────────────────────────────────────────────────
export async function semanticSearch(query: string, jurisdiction: string = "") {
  const params = new URLSearchParams({ q: query });
  if (jurisdiction) params.set("jurisdiction", jurisdiction);
  return request(`/api/lcet/search?${params.toString()}`);
}

// ── LCET: Concepts & Timeline ─────────────────────────────────────────────────
export async function listConcepts() {
  return request("/api/lcet/concepts");
}

export async function getConcept(name: string) {
  return request(`/api/lcet/concepts/${encodeURIComponent(name)}`);
}

export async function getEvolutionTimeline(name: string) {
  return request(`/api/lcet/concepts/${encodeURIComponent(name)}/evolution`);
}

// ── LCET: Analysis (SMI, NER, Drift) ──────────────────────────────────────────
export async function calculateSMI(concept: string, period1: string, period2: string) {
  // Convert decade strings like "2000s" to year ranges
  const p1 = parseInt(period1);
  const p2 = parseInt(period2);
  return request("/api/lcet/analysis/smi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ concept, period_1_start: p1, period_1_end: p1 + 9, period_2_start: p2, period_2_end: p2 + 9 }),
  });
}

export async function extractEntities(text: string) {
  return request("/api/lcet/analysis/ner", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
}

// ── LCET: Case Library ────────────────────────────────────────────────────────
export async function listCases(params: { court?: string; year?: number; q?: string; page?: number; limit?: number } = {}) {
  const sp = new URLSearchParams();
  if (params.court) sp.set("court", params.court);
  if (params.year) sp.set("year", String(params.year));
  if (params.q) sp.set("q", params.q);
  if (params.page) sp.set("page", String(params.page));
  if (params.limit) sp.set("limit", String(params.limit));
  return request(`/api/lcet/cases?${sp.toString()}`);
}

export async function getCaseStats() {
  return request("/api/lcet/cases/stats");
}

export async function getCase(docId: string) {
  return request(`/api/lcet/cases/${encodeURIComponent(docId)}`);
}

// ── LCET: Documents ───────────────────────────────────────────────────────────
export async function listDocuments() {
  return request("/api/lcet/documents");
}

// ── Health ────────────────────────────────────────────────────────────────────
export async function healthCheck() {
  return request("/api/health");
}
