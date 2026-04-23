"use client";

import PropertyDetails from "@/components/PropertyDetails";
import PropertyGallery from "@/components/PropertyGallery";
import StickyActionPanel from "@/components/StickyActionPanel";
import PropertyDetailHeader from "@/components/PropertyDetailHeader";
import { useGetPropertyQuery } from "@/state/api";
import { useParams, useRouter } from "next/navigation";

export default function PropertyPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: property, isLoading } = useGetPropertyQuery(Number(id));

  if (isLoading) {
    return (
      <p className="p-8 text-sm font-normal text-[var(--text-secondary)]">
        Loading…
      </p>
    );
  }
  if (!property) {
    return (
      <p className="p-8 text-sm font-normal text-[var(--text-secondary)]">
        Listing not found
      </p>
    );
  }

  const photos =
    property.photoUrls?.length > 0
      ? property.photoUrls
      : ["https://placehold.co/1200x700"];

  const summary = `${property.beds} beds · ${property.squareFeet} sq ft · ${property.location?.city ?? ""}`;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 md:px-8 md:py-10">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 text-sm font-medium text-[var(--text-secondary)] underline-offset-4 hover:text-[var(--text-primary)] hover:underline"
      >
        ← Back
      </button>

      <PropertyDetailHeader property={property} />

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-12">
        <div className="space-y-10">
          <PropertyGallery name={property.name} photos={photos} />
          <PropertyDetails property={property} />
        </div>
        <div className="lg:sticky lg:top-28">
          <StickyActionPanel
            propertyId={property.id}
            pricePerMonth={property.pricePerMonth}
            summary={summary}
          />
        </div>
      </div>
    </div>
  );
}
