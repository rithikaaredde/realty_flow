"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Heart } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import { useAuth } from "@/context/AuthContext";
import { useGetFavoritesByUserQuery } from "@/state/api";

export default function SavedPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/favorites");
    }
  }, [loading, user, router]);

  const userId = user?.userId;
  const { data, isLoading, isError } = useGetFavoritesByUserQuery(userId!, {
    skip: !userId,
  });

  const properties = useMemo(() => {
    const raw = (data?.data ?? data ?? []) as any[];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  if (loading) {
    return (
      <div className="p-8 text-sm font-normal text-[var(--text-secondary)]">
        Loading…
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:px-8">
      <h1 className="mb-8 text-3xl font-semibold text-[var(--text-primary)]">
        Saved
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="card skeleton h-72 rounded-2xl border border-[var(--gray-100)]"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-normal text-red-800">
          We couldn&apos;t load your saved stays.
        </div>
      ) : properties.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 rounded-2xl border border-[var(--gray-100)] bg-[var(--surface)] p-12 text-center shadow-[var(--shadow-sm)]">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-[var(--page-bg)]">
            <Heart className="text-[var(--primary)]" size={28} />
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            No saved properties yet
          </h2>
          <p className="max-w-md text-sm font-normal text-[var(--text-secondary)]">
            Tap the heart on any listing to keep it here for your next trip.
          </p>
          <Link href="/search" className="btn-primary mt-2">
            Browse stays
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {properties.map((p: any) => (
            <div key={p.id}>
              <PropertyCard property={{ ...p, isFavorited: true }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
