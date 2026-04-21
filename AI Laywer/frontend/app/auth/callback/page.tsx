"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setToken } from "@/lib/auth";
import { SpinnerIcon } from "@/components/Icons";

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = params.get("token");
    const err = params.get("error");

    if (err) {
      router.replace("/login?error=oauth_failed");
      return;
    }

    if (token) {
      // Store token synchronously then hard-navigate so AuthProvider re-initialises
      setToken(token);
      // Use window.location for a full page load so AuthProvider picks up the token
      window.location.href = "/dashboard";
    } else {
      router.replace("/login?error=oauth_failed");
    }
  }, [params, router]);

  if (error) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff" }}>
        <p style={{ color: "#cc0000" }}>{error}</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ color: "#1a1a1a", marginBottom: 16, display: "flex", justifyContent: "center" }}>
          <SpinnerIcon size={36} />
        </div>
        <p style={{ color: "#888888", fontSize: 15 }}>Signing you in...</p>
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff" }}>
        <SpinnerIcon size={36} />
      </main>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
