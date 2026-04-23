"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useGetApplicationsQuery } from "@/state/api";
import { bookingStatusLabel } from "@/lib/bookingStatusUi";

export default function GuestBookingsPage() {
  const { user } = useAuth();

  const { data, isLoading } = useGetApplicationsQuery(
    user ? { tenantId: user.userId } : {},
    { skip: !user }
  );

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-3xl px-6 py-10 md:px-8">
        <h1 className="mb-8 text-3xl font-semibold text-[var(--text-primary)]">
          My bookings
        </h1>

        {isLoading && (
          <p className="text-sm font-normal text-[var(--text-secondary)]">
            Loading…
          </p>
        )}

        {!isLoading && data?.data?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[var(--gray-100)] bg-[var(--surface)] p-10 text-center">
            <p className="text-sm font-normal text-[var(--text-secondary)]">
              No bookings yet.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {data?.data?.map((app: any) => (
            <div
              key={app.id}
              className="rounded-2xl border border-[var(--gray-100)] bg-[var(--surface)] p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {app.property?.name || `Booking #${app.id}`}
              </h2>
              <p className="mt-2 text-sm font-normal text-[var(--text-secondary)]">
                Status:{" "}
                <span className="font-semibold text-[var(--text-primary)]">
                  {bookingStatusLabel(app.status)}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
