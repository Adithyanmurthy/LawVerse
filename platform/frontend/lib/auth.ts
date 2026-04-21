// Authentication utilities
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("userEmail");
}

export function getUserEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userEmail");
}

export function setUserEmail(email: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("userEmail", email);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
