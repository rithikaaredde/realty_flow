"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { loginUser, loginWithGoogle } from "@/src/lib/auth";
import { useAuth } from "@/context/AuthContext";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  const redirectTo = useMemo(() => {
    const redirect = searchParams.get("redirect");
    return redirect && redirect.startsWith("/") ? redirect : "/";
  }, [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"TENANT" | "OWNER">("TENANT");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      localStorage.setItem("auth:preferredRole", role);
      await loginUser(email, password);

      // ⭐ wait for cognito session to settle
      await new Promise((res) => setTimeout(res, 300));

      // ⭐ refresh auth context
      await refreshUser();

      // ⭐ force rerender navigation
      router.replace(redirectTo);
    } catch (err: any) {
      setError(err?.message ?? "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[var(--gray-50,#F7F7F7)] px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="card rounded-[var(--radius-lg,16px)] p-6 shadow-[var(--shadow-md)]">
          <div className="mb-6 text-center">
            <div className="text-2xl font-semibold tracking-tight">
              RealtyFlow
            </div>
            <div className="mt-1 text-sm text-[var(--gray-500,#717171)]">
              Sign in to continue
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              localStorage.setItem("auth:preferredRole", role);
              loginWithGoogle();
            }}
            className="w-full rounded-[var(--radius-sm,8px)] border border-[var(--gray-100,#EBEBEB)] bg-white px-4 py-3 text-sm font-medium text-[var(--gray-700,#3D3D3D)] shadow-[var(--shadow-sm)] hover:bg-[var(--gray-50,#F7F7F7)]"
          >
            Sign in with Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--gray-100,#EBEBEB)]" />
            <div className="text-xs text-[var(--gray-500,#717171)]">
              or
            </div>
            <div className="h-px flex-1 bg-[var(--gray-100,#EBEBEB)]" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Login as</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "TENANT" | "OWNER")}
                className="w-full rounded-[var(--radius-sm,8px)] border border-[var(--gray-100,#EBEBEB)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--primary,#FF385C)]"
              >
                <option value="TENANT">Guest</option>
                <option value="OWNER">Host</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="w-full rounded-[var(--radius-sm,8px)] border border-[var(--gray-100,#EBEBEB)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--primary,#FF385C)]"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                className="w-full rounded-[var(--radius-sm,8px)] border border-[var(--gray-100,#EBEBEB)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--primary,#FF385C)]"
                placeholder="••••••••"
              />
            </div>

            {error ? (
              <div className="rounded-[var(--radius-sm,8px)] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Signing in..." : "Log in"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-[var(--gray-500,#717171)]">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-[var(--primary,#FF385C)] hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-64px)] bg-[var(--gray-50,#F7F7F7)] px-4 py-12">
          <div className="mx-auto w-full max-w-md">
            <div className="card rounded-[var(--radius-lg,16px)] p-6 shadow-[var(--shadow-md)]">
              <div className="skeleton h-8 w-40 rounded" />
              <div className="mt-4 skeleton h-10 w-full rounded" />
              <div className="mt-3 skeleton h-10 w-full rounded" />
            </div>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}