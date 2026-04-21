"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getToken, removeToken } from "@/lib/auth";
import { getCurrentUser } from "@/lib/api";

interface UserInfo {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  plan: string;
  analyses_used: number;
  analyses_limit: number;
  analyses_remaining: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserInfo | null;
  userEmail: string | null;
  userPlan: string | null;
  loading: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  userEmail: null,
  userPlan: null,
  loading: true,
  logout: () => {},
  refreshUser: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  // Start as false — we check token synchronously first
  const [loading, setLoading] = useState(() => {
    // On server there's no localStorage — default to true
    if (typeof window === "undefined") return true;
    // If no token at all, no need to fetch — not loading
    return !!getToken();
  });
  const router = useRouter();

  const fetchUser = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await getCurrentUser();
      setUser(data);
    } catch {
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []); // only on mount

  const logout = () => {
    removeToken();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!user,
      user,
      userEmail: user?.email ?? null,
      userPlan: user?.plan ?? null,
      loading,
      logout,
      refreshUser: fetchUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
