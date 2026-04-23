"use client";

import { useGetManagerPropertiesQuery } from "@/state/api";
import { formatPricePerNightLine } from "@/lib/listingPrice";

export default function HostListingsPage() {
  const { data, isLoading } = useGetManagerPropertiesQuery("manager-1");
  if (isLoading) {
    return (
      <p className="p-8 text-sm font-normal text-[var(--text-secondary)]">
        Loading…
      </p>
    );
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-8 py-10">
      <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
        Your listings
      </h1>
      {(data?.data || []).map((p: any) => (
        <div
          key={p.id}
          className="rounded-2xl border border-[var(--gray-100)] bg-[var(--surface)] p-5 shadow-sm"
        >
          <p className="font-semibold text-[var(--text-primary)]">{p.name}</p>
          <p className="mt-1 text-sm font-normal text-[var(--text-secondary)]">
            {formatPricePerNightLine(p.pricePerMonth)}
          </p>
        </div>
      ))}
    </div>
  );
}
