"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import AmenitiesGrid from "@/components/AmenitiesGrid";
import AgentCard from "@/components/AgentCard";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function PropertyDetails({ property }: { property: any }) {
  const [descOpen, setDescOpen] = useState(false);

  const description = property.description || "";
  const descPreview = description.slice(0, 320);
  const showToggle = description.length > 320;

  const mapProperty = useMemo(
    () => [
      {
        id: property.id,
        name: property.name,
        pricePerMonth: property.pricePerMonth,
        photoUrls: property.photoUrls,
        latitude: property.latitude,
        longitude: property.longitude,
        location: property.location,
      },
    ],
    [property]
  );

  const posted =
    property.postedDate &&
    new Date(property.postedDate).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          About this place
        </h2>
        <p className="text-base font-normal leading-relaxed text-[var(--text-primary)]">
          {descOpen || !showToggle ? description : `${descPreview}…`}
        </p>
        {showToggle ? (
          <button
            type="button"
            onClick={() => setDescOpen(!descOpen)}
            className="text-sm font-semibold text-[var(--text-primary)] underline decoration-[var(--primary)] underline-offset-4"
          >
            {descOpen ? "Show less" : "Show more"}
          </button>
        ) : null}
      </section>

      <AgentCard manager={property.manager} propertyName={property.name} />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          What this place offers
        </h2>
        <AmenitiesGrid
          amenities={(property.amenities ?? []) as string[]}
          isParkingIncluded={property.isParkingIncluded}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Where you&apos;ll be
        </h2>
        <div className="overflow-hidden rounded-2xl border border-[var(--gray-100)]">
          <MapView
            compact
            properties={mapProperty}
            onPropertySelect={() => undefined}
          />
        </div>
      </section>

      {typeof property.averageRating === "number" &&
      (property.numberOfReviews ?? 0) > 0 ? (
        <section className="rounded-2xl border border-[var(--gray-100)] bg-[var(--surface)] p-8">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Guest reviews
          </h2>
          <p className="mt-3 text-sm font-normal text-[var(--text-secondary)]">
            {property.averageRating.toFixed(1)} overall ·{" "}
            {property.numberOfReviews} reviews
          </p>
        </section>
      ) : null}

      <section className="rounded-2xl border border-[var(--gray-100)] bg-[var(--surface)] p-8">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Good to know
        </h2>
        <dl className="mt-4 space-y-3 text-sm font-normal">
          <div className="flex justify-between gap-4">
            <dt className="font-medium text-[var(--text-secondary)]">
              Availability
            </dt>
            <dd className="text-right text-[var(--text-primary)]">
              {posted ? `Listed ${posted}` : "Ask the host for dates"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="font-medium text-[var(--text-secondary)]">
              Fees & deposit
            </dt>
            <dd className="text-right text-[var(--text-primary)]">
              Security deposit ${property.securityDeposit ?? "—"} · Service fee
              ${property.applicationFee ?? "—"}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
