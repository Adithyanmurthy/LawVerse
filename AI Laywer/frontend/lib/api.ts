import { getToken } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || "Request failed");
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function register(email: string, password: string, full_name = "") {
  return request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, full_name }),
  });
}

export async function login(email: string, password: string) {
  return request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export async function getCurrentUser() {
  return request("/api/auth/me");
}

export async function updateProfile(data: { full_name?: string }) {
  return request("/api/auth/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function googleLoginUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  return `${base}/api/auth/google`;
}

// ── Contracts ─────────────────────────────────────────────────────────────────
export async function uploadContract(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  return request("/api/contracts/upload", { method: "POST", body: fd });
}

export async function listContracts() {
  return request("/api/contracts");
}

export async function deleteContract(contractId: string) {
  return request(`/api/contracts/${contractId}`, { method: "DELETE" });
}

// ── Analyses ──────────────────────────────────────────────────────────────────
export async function getAnalysis(contractId: string) {
  return request(`/api/analyses/${contractId}`);
}

export async function downloadReport(contractId: string): Promise<Blob> {
  const token = getToken();
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${API_BASE}/api/analyses/${contractId}/report`, { headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || "Download failed");
  }
  return res.blob();
}

export async function submitFeedback(analysisId: string, clauseId: string, isCorrect: boolean, comment = "") {
  const params = new URLSearchParams({ clause_id: clauseId, is_correct: String(isCorrect), comment });
  return request(`/api/analyses/${analysisId}/feedback?${params}`, { method: "POST" });
}

// ── Billing (Razorpay) ────────────────────────────────────────────────────────
export async function createRazorpayOrder(plan: string) {
  return request("/api/billing/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
}

export async function verifyRazorpayPayment(
  order_id: string,
  payment_id: string,
  signature: string,
) {
  return request("/api/billing/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id, payment_id, signature }),
  });
}
