"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import "@/src/lib/amplifyConfig";
import { logoutUser } from "@/src/lib/auth";

type AuthUser = {
  userId: string;
  email: string;
  role: "TENANT" | "OWNER";
  name?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const retryRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadUser = async (opts?: { retryIfMissingTokens?: boolean }) => {
    try {
      const currentUser = await getCurrentUser();

      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken;
      const payload: any = idToken?.payload;

      const groups = payload?.["cognito:groups"] || [];

      const userId = payload?.sub ?? currentUser.userId;
      const email =
        payload?.email ?? currentUser.signInDetails?.loginId ?? "";
      const name = payload?.name;
      const preferredRole =
        typeof window !== "undefined"
          ? localStorage.getItem("auth:preferredRole")
          : null;

      const newUser: AuthUser = {
        userId,
        email,
        role: (
          preferredRole === "OWNER" || preferredRole === "TENANT"
            ? preferredRole
            : groups.includes("admin") || String(email).toLowerCase().includes("admin")
              ? "OWNER"
              : "TENANT"
        ) as "TENANT" | "OWNER",
        name,
      };

      // ✅ SET USER
      setUser(newUser);

      // ✅ ADD THIS (IMPORTANT FIX)
      if (typeof window !== "undefined") {
        // Keep a stable legacy shape for API fallbacks that still expect cognitoId/role.
        localStorage.setItem(
          "user",
          JSON.stringify({
            cognitoId: newUser.userId,
            userId: newUser.userId,
            role: newUser.role,
            email: newUser.email,
            name: newUser.name,
          })
        );
      }

      // ✅ Sync user to backend once per session (prevents missing DB user issues)
      if (typeof window !== "undefined") {
        const syncKey = "auth:synced";
        if (!sessionStorage.getItem(syncKey)) {
          sessionStorage.setItem(syncKey, "1");
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
          fetch(`${baseUrl}/auth/sync`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-user-id": userId,
              "x-user-role-raw": newUser.role.toLowerCase(),
              "x-user-role": newUser.role,
              ...(idToken
                ? { Authorization: `Bearer ${idToken.toString()}` }
                : {}),
            },
            body: JSON.stringify({ email: newUser.email, name: newUser.name }),
          }).catch(() => {
            sessionStorage.removeItem(syncKey);
          });
        }
      }

      retryRef.current = 0;

      if (!idToken && opts?.retryIfMissingTokens) {
        if (retryRef.current < 5) {
          retryRef.current += 1;
          if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
          retryTimerRef.current = setTimeout(() => {
            void loadUser({ retryIfMissingTokens: true });
          }, 400);
        }
      }
    } catch (err) {
      setUser(null);

      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        sessionStorage.removeItem("auth:synced");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser({ retryIfMissingTokens: true });
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  const refreshUser = async () => {
    setLoading(true);
    await loadUser({ retryIfMissingTokens: true });
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);

    // ✅ ADD THIS (IMPORTANT FIX)
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      sessionStorage.removeItem("auth:synced");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
