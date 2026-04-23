"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { confirmUser, loginWithGoogle, registerUser } from "@/src/lib/auth";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"TENANT" | "OWNER">("TENANT");

  const [code, setCode] = useState("");
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      localStorage.setItem("auth:preferredRole", role);
      await registerUser(email, password, name);
      setNeedsConfirmation(true);
    } catch (err: any) {
      setError(err?.message ?? "Sign up failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const onConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await confirmUser(email, code);
      router.push("/login?success=1");
    } catch (err: any) {
      setError(err?.message ?? "Confirmation failed. Please try again.");
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
              Create your account
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
            Sign up with Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--gray-100,#EBEBEB)]" />
            <div className="text-xs text-[var(--gray-500,#717171)]">
              or
            </div>
            <div className="h-px flex-1 bg-[var(--gray-100,#EBEBEB)]" />
          </div>

          {!needsConfirmation ? (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Signup as</label>
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
                <label className="text-sm font-medium">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-[var(--radius-sm,8px)] border border-[var(--gray-100,#EBEBEB)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--primary,#FF385C)]"
                  placeholder="Your name"
                />
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

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Confirm password</label>
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {submitting ? "Creating account..." : "Sign up"}
              </button>
            </form>
          ) : (
            <form onSubmit={onConfirm} className="space-y-4">
              <div className="rounded-[var(--radius-sm,8px)] border border-[var(--gray-100,#EBEBEB)] bg-[var(--gray-50,#F7F7F7)] px-3 py-2 text-sm text-[var(--gray-700,#3D3D3D)]">
                Enter the confirmation code sent to{" "}
                <span className="font-medium">{email}</span>.
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Confirmation code</label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="w-full rounded-[var(--radius-sm,8px)] border border-[var(--gray-100,#EBEBEB)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--primary,#FF385C)]"
                  placeholder="123456"
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
                {submitting ? "Confirming..." : "Confirm"}
              </button>
            </form>
          )}

          <div className="mt-5 text-center text-sm text-[var(--gray-500,#717171)]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-[var(--primary,#FF385C)] hover:underline"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

