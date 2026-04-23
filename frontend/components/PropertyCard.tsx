"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import FavoriteButton from "@/components/FavoriteButton";
import { formatPricePerNightLine } from "@/lib/listingPrice";

export default function PropertyCard({ property }: { property: any }) {
  const image =
    property.photoUrls?.[0] ??
    property.imageUrl ??
    "https://placehold.co/800x600";

  return (
    <div className="group relative h-full overflow-hidden rounded-2xl border border-[var(--gray-100)] bg-[var(--surface)] shadow-[var(--shadow-sm)] transition duration-300 ease-out hover:scale-[1.02] hover:shadow-[var(--shadow-md)]">
      <div className="absolute right-3 top-3 z-20">
        <FavoriteButton propertyId={property.id} variant="card" />
      </div>

      <Link href={`/properties/${property.id}`} className="block">
        <div className="relative overflow-hidden rounded-t-2xl">
          <img
            src={image}
            alt={property.name}
            className="aspect-[4/3] w-full object-cover transition duration-300 ease-out group-hover:scale-105"
          />
        </div>

        <div className="space-y-2 p-5">
          <h2 className="line-clamp-2 text-base font-semibold leading-snug text-[var(--text-primary)]">
            {property.name}
          </h2>
          <div className="flex items-center gap-1 text-sm font-normal text-[var(--text-secondary)]">
            <MapPin size={14} className="shrink-0" />
            <span className="truncate">{property.location?.city}</span>
          </div>
          <div className="text-lg font-semibold text-[var(--text-primary)]">
            {formatPricePerNightLine(property.pricePerMonth)}
          </div>
          {typeof property.averageRating === "number" ? (
            <div className="text-sm font-normal text-[var(--text-secondary)]">
              {property.averageRating.toFixed(1)} ★
              {property.numberOfReviews
                ? ` (${property.numberOfReviews})`
                : ""}
            </div>
          ) : null}
        </div>
      </Link>
    </div>
  );
}
