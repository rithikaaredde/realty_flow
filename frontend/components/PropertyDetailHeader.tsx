"use client";

import { MapPin } from "lucide-react";

export default function PropertyDetailHeader({ property }: { property: any }) {
  return (
    <header className="space-y-3">
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] md:text-4xl">
        {property.name}
      </h1>
      <div className="flex flex-wrap items-center gap-2 text-sm font-normal text-[var(--text-secondary)]">
        <MapPin size={16} className="shrink-0" />
        <span>
          {property.location?.city}
          {property.location?.state ? `, ${property.location.state}` : ""}
        </span>
        {typeof property.averageRating === "number" ? (
          <span className="text-[var(--text-primary)]">
            · {property.averageRating.toFixed(1)} ★ (
            {property.numberOfReviews ?? 0})
          </span>
        ) : null}
      </div>
    </header>
  );
}
