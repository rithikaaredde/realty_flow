"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useGetBookingsByUserQuery } from "@/state/api";
import {
  bookingStatusBadgeClass,
  bookingStatusLabel,
} from "@/lib/bookingStatusUi";

function StatusBadge({ status }: { status: string }) {
  const label = bookingStatusLabel(status);
  const cls = bookingStatusBadgeClass(status);
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${cls}`}
    >
      {label}
    </span>
  );
}

export default function BookingsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.push("/login?redirect=/bookings");
  }, [loading, user, router]);

  const userId = user?.userId;
  const { data, isLoading, isError } = useGetBookingsByUserQuery(userId!, {
    skip: !userId,
  });

  const bookings = useMemo(() => (data?.data ?? []) as any[], [data]);

  if (!user && loading) {
    return (
      <div className="p-8 text-sm font-normal text-[var(--text-secondary)]">
        Loading…
      </div>
    );
  }
  if (!user && !loading) return null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:px-8">
      <h1 className="mb-8 text-3xl font-semibold text-[var(--text-primary)]">
        Your bookings
      </h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="card skeleton h-28 rounded-2xl border border-[var(--gray-100)]"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-normal text-red-800">
          We couldn&apos;t load your bookings. Try again in a moment.
        </div>
      ) : bookings.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 rounded-2xl border border-[var(--gray-100)] bg-[var(--surface)] p-12 text-center shadow-[var(--shadow-sm)]">
          <div className="text-xl font-semibold text-[var(--text-primary)]">
            No bookings yet
          </div>
          <p className="max-w-md text-sm font-normal text-[var(--text-secondary)]">
            When you book a stay, it will show up here with dates and status.
          </p>
          <Link href="/search" className="btn-primary mt-2">
            Find a place
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((b: any) => {
            const start = b.additionalInfo?.startDate ?? b.startDate;
            const end = b.additionalInfo?.endDate ?? b.endDate;
            const startLabel = start
              ? format(new Date(start), "MMM d, yyyy")
              : "—";
            const endLabel = end ? format(new Date(end), "MMM d, yyyy") : "—";
            const img =
              b.property?.photoUrls?.[0] ?? "https://placehold.co/800x600";

            return (
              <div
                key={b.id}
                className="card flex flex-col gap-6 rounded-2xl border border-[var(--gray-100)] bg-[var(--surface)] p-6 transition hover:shadow-[var(--shadow-md)] md:flex-row md:items-center"
              >
                <img
                  src={img}
                  alt=""
                  className="h-32 w-full rounded-xl object-cover md:h-28 md:w-48"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-base font-semibold text-[var(--text-primary)]">
                    {b.property?.name ?? `Booking #${b.id}`}
                  </div>
                  <div className="mt-1 text-sm font-normal text-[var(--text-secondary)]">
                    {b.property?.location?.city}
                    {b.property?.location?.state
                      ? `, ${b.property.location.state}`
                      : ""}
                  </div>
                  <div className="mt-3 text-sm font-normal text-[var(--text-primary)]">
                    {startLabel} → {endLabel}
                  </div>
                </div>
                <div className="shrink-0">
                  <StatusBadge status={b.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
