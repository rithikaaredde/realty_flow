"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useGetFavoritesQuery } from "@/state/api";

export default function GuestSavedPage() {
  const { user } = useAuth();

  const { data, isLoading, isError } = useGetFavoritesQuery(
    user?.userId ?? "",
    { skip: !user?.userId }
  );

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-3xl px-6 py-10 md:px-8">
        <h1 className="mb-8 text-3xl font-semibold text-[var(--text-primary)]">
          Saved
        </h1>

        {isLoading && (
          <p className="text-sm font-normal text-[var(--text-secondary)]">
            Loading…
          </p>
        )}
        {isError && (
          <p className="text-sm font-normal text-red-700">
            Error loading saved stays
          </p>
        )}
        {!isLoading && !isError && (!data || data.length === 0) && (
          <div className="rounded-2xl border border-dashed border-[var(--gray-100)] bg-[var(--surface)] p-10 text-center text-sm font-normal text-[var(--text-secondary)]">
            No saved stays yet.
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
