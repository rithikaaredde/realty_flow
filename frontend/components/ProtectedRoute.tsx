"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "TENANT" | "MANAGER" | "OWNER";
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const hasRequiredRole = () => {
    if (!role) return true;
    if (!user) return false;

    const normalized =
      role === "TENANT"
        ? "TENANT"
        : role === "MANAGER"
          ? "OWNER"
          : role;

    return user.role === normalized;
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    if (!loading && user && !hasRequiredRole()) {
      router.push("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, router, pathname, role]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!user) return null;
  if (!hasRequiredRole()) return null;

  return <>{children}</>;
}