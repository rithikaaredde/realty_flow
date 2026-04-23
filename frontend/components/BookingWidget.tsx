"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCreateBookingMutation } from "@/state/api";
import { formatPricePerNightLine } from "@/lib/listingPrice";

export default function BookingWidget({
  propertyId,
  pricePerMonth,
  hidePrice,
}: {
  propertyId: number;
  pricePerMonth: number;
  hidePrice?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [createBooking] = useCreateBookingMutation();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitBooking = async () => {
    if (loading) return;
    setSuccess(null);
    setError(null);

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname || "/")}`);
      return;
    }
    if (!startDate || !endDate) {
      setError("Please select check-in and check-out dates.");
      return;
    }

    setLoading(true);
    try {
      await createBooking({
        propertyId,
        tenantId: user.userId,
        startDate,
        endDate,
        personalInfo: {},
        financialInfo: {},
      }).unwrap();
      setSuccess("Booking request sent. Your host will confirm shortly.");
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={
        hidePrice ? "" : "card rounded-2xl p-6 shadow-[var(--shadow-md)]"
      }
    >
      {!hidePrice ? (
        <div className="mb-5">
          <div className="text-sm font-medium text-[var(--text-secondary)]">
            Price per night
          </div>
          <div className="mt-1 text-3xl font-semibold text-[var(--text-primary)]">
            {formatPricePerNightLine(pricePerMonth)}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
            Check-in
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-xl border border-[var(--gray-100)] bg-[var(--page-bg)] px-3 py-2.5 text-sm font-normal text-[var(--text-primary)] outline-none transition focus:border-[var(--primary)]"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
            Check-out
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-xl border border-[var(--gray-100)] bg-[var(--page-bg)] px-3 py-2.5 text-sm font-normal text-[var(--text-primary)] outline-none transition focus:border-[var(--primary)]"
          />
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-normal text-red-800">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-normal text-emerald-800">
          {success}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => void submitBooking()}
        disabled={loading}
        className="btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Booking…" : "Book now"}
      </button>

      <p className="mt-3 text-center text-xs font-normal text-[var(--text-secondary)]">
        You won&apos;t be charged until the host accepts your booking.
      </p>
    </div>
  );
}
