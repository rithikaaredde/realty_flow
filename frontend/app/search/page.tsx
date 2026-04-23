"use client";

import PropertyCard from "@/components/PropertyCard";
import { useGetPropertiesQuery } from "@/state/api";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

const MapViewDynamic = dynamic(() => import("@/components/MapView"), {
  ssr: false,
});

function SearchContent() {
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const rawParams = {
    city: searchParams.get("city"),
    vicinity: searchParams.get("vicinity"),
    name: searchParams.get("name"),
    minPrice: searchParams.get("minPrice"),
    maxPrice: searchParams.get("maxPrice"),
    beds: searchParams.get("beds"),
    baths: searchParams.get("baths"),
    propertyType: searchParams.get("propertyType"),
    amenities: searchParams.get("amenities"),
    isPetsAllowed: searchParams.get("isPetsAllowed"),
    isParkingIncluded: searchParams.get("isParkingIncluded"),
  };

  const params = Object.fromEntries(
    Object.entries(rawParams).filter(
      ([_, value]) => value !== null && value !== ""
    )
  );

  const { data, isLoading, isError } = useGetPropertiesQuery(params, {
    refetchOnMountOrArgChange: true,
  });

  const properties = data?.data ?? [];

  useEffect(() => {
    if (!selectedId) return;
    const el = document.getElementById(`property-card-${selectedId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedId]);

  const mapProps = useMemo(() => properties, [properties]);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex items-center justify-between px-6 pb-2 pt-6 md:hidden">
        <div className="text-sm font-medium text-[var(--text-primary)]">
          Stays
        </div>
        <div className="flex overflow-hidden rounded-full border border-[var(--gray-100)] bg-[var(--surface)] shadow-sm">
          <button
            type="button"
            onClick={() => setMobileView("list")}
            className={`px-4 py-2 text-sm font-semibold transition ${
              mobileView === "list"
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--text-primary)]"
            }`}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => setMobileView("map")}
            className={`px-4 py-2 text-sm font-semibold transition ${
              mobileView === "map"
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--text-primary)]"
            }`}
          >
            Map
          </button>
        </div>
      </div>

      {isLoading && (
        <p className="px-8 py-10 text-center text-sm font-normal text-[var(--text-secondary)]">
          Finding great stays…
        </p>
      )}

      {isError && (
        <p className="px-8 py-10 text-center text-sm font-normal text-red-700">
          Something went wrong. Refresh and try again.
        </p>
      )}

      {!isLoading && !isError && (
        <>
          {properties.length === 0 ? (
            <div className="mx-6 my-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--gray-100)] bg-[var(--surface)] px-8 py-16 text-center md:mx-8">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                No properties found
              </h2>
              <p className="mt-3 max-w-md text-sm font-normal text-[var(--text-secondary)]">
                Try widening your dates or clearing a few filters — great hosts
                add new listings every week.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 px-6 pb-12 pt-2 lg:grid-cols-[70%_30%] lg:gap-10 lg:px-8">
              <div
                className={`${mobileView === "map" ? "hidden" : ""} md:block`}
              >
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  {properties.map((p: any) => (
                    <div
                      id={`property-card-${p.id}`}
                      key={p.id}
                      className={
                        selectedId === p.id
                          ? "rounded-2xl ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--page-bg)]"
                          : ""
                      }
                    >
                      <PropertyCard property={p} />
                    </div>
                  ))}
                </div>
              </div>

              <div
                className={`${mobileView === "list" ? "hidden" : ""} md:block`}
              >
                <MapViewDynamic
                  properties={mapProps}
                  onPropertySelect={(id) => {
                    setSelectedId(id);
                    setMobileView("list");
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <p className="p-8 text-center text-sm font-normal text-[var(--text-secondary)]">
          Loading search…
        </p>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
