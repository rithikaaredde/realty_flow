"use client";

import BookingWidget from "@/components/BookingWidget";
import FavoriteButton from "@/components/FavoriteButton";
import { formatPricePerNightLine } from "@/lib/listingPrice";

export default function StickyActionPanel({
  propertyId,
  pricePerMonth,
  summary,
}: {
  propertyId: number;
  pricePerMonth: number;
  summary: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--gray-100)] bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)] transition hover:shadow-[var(--shadow-md)]">
      <div className="text-3xl font-semibold text-[var(--text-primary)]">
        {formatPricePerNightLine(pricePerMonth)}
      </div>
      <p className="mt-3 text-sm font-normal text-[var(--text-secondary)]">
        {summary}
      </p>

      <div className="mt-6 space-y-4">
        <BookingWidget
          propertyId={propertyId}
          pricePerMonth={pricePerMonth}
          hidePrice
        />
        <FavoriteButton propertyId={propertyId} variant="panel" />
      </div>
    </div>
  );
}
