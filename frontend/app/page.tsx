"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-8 py-24 text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-[var(--text-primary)] md:text-5xl">
        Find your next stay on RealtyFlow
      </h1>

      <p className="mt-6 max-w-xl text-lg font-normal leading-relaxed text-[var(--text-secondary)]">
        Unique homes, flexible dates, and a booking flow that feels as simple
        as checking in.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          className="btn-primary px-8 py-3"
          onClick={() => router.push("/search")}
        >
          Explore stays
        </button>

        <Button
          variant="outline"
          className="btn-secondary rounded-xl border-[var(--gray-100)] px-8 py-3 font-semibold"
          onClick={() => {
            if (loading) return;
            if (!user) {
              router.push("/auth");
              return;
            }
            if (user.role !== "OWNER") {
              alert("Host access required");
              return;
            }
            router.push("/admin/create-property");
          }}
        >
          Become a host
        </Button>
      </div>
    </div>
  );
}
