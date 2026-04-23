"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PROPERTY_SEARCH_TYPES } from "@/lib/propertyConstants";

type FilterModalProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Filters map to existing `/properties` query params only (no new API fields).
 */
export default function FilterModal({ open, onClose }: FilterModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [beds, setBeds] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [furnishing, setFurnishing] = useState<"" | "furnished">("");
  const [isParkingIncluded, setIsParkingIncluded] = useState("");
  const [isPetsAllowed, setIsPetsAllowed] = useState("");

  useEffect(() => {
    if (!open) return;
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setBeds(searchParams.get("beds") || "");
    setPropertyType(searchParams.get("propertyType") || "");
    const am = searchParams.get("amenities") || "";
    setFurnishing(am.split(",").includes("Furnished") ? "furnished" : "");
    setIsParkingIncluded(searchParams.get("isParkingIncluded") || "");
    setIsPetsAllowed(searchParams.get("isPetsAllowed") || "");
  }, [open, searchParams]);

  const apply = () => {
    const next = new URLSearchParams(searchParams.toString());

    const setOrDelete = (key: string, value: string) => {
      if (!value) next.delete(key);
      else next.set(key, value);
    };

    setOrDelete("minPrice", minPrice);
    setOrDelete("maxPrice", maxPrice);
    setOrDelete("beds", beds);
    setOrDelete("propertyType", propertyType);
    setOrDelete("isParkingIncluded", isParkingIncluded);
    setOrDelete("isPetsAllowed", isPetsAllowed);

    const existingAmenities = (searchParams.get("amenities") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (furnishing === "furnished") {
      const merged = [...new Set([...existingAmenities, "Furnished"])];
      next.set("amenities", merged.join(","));
    } else {
      const without = existingAmenities.filter((a) => a !== "Furnished");
      if (without.length) next.set("amenities", without.join(","));
      else next.delete("amenities");
    }

    const qs = next.toString();
    const target = `/search${qs ? `?${qs}` : ""}`;
    if (pathname === "/search") router.replace(target);
    else router.push(target);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close filters"
        onClick={onClose}
      />
      <div className="relative z-[101] max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-[var(--gray-100)] bg-[var(--surface)] p-8 shadow-[var(--shadow-lg)] sm:rounded-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Filters
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-[var(--text-secondary)] underline"
          >
            Close
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <div className="mb-2 text-sm font-medium text-[var(--text-primary)]">
              Price range (per night)
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                className="w-full rounded-xl border border-[var(--gray-100)] bg-[var(--page-bg)] px-3 py-2.5 text-sm font-normal text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
                placeholder="Min / night"
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <input
                className="w-full rounded-xl border border-[var(--gray-100)] bg-[var(--page-bg)] px-3 py-2.5 text-sm font-normal text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
                placeholder="Max / night"
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium text-[var(--gray-700,#3D3D3D)]">
              Property type
            </div>
            <select
              className="w-full rounded-[var(--radius-sm,8px)] border border-[var(--gray-100,#EBEBEB)] px-3 py-2 text-sm"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
            >
              {PROPERTY_SEARCH_TYPES.map((t) => (
                <option key={t.label} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium text-[var(--gray-700,#3D3D3D)]">
              BHK
            </div>
            <select
              className="w-full rounded-[var(--radius-sm,8px)] border border-[var(--gray-100,#EBEBEB)] px-3 py-2 text-sm"
              value={beds}
              onChange={(e) => setBeds(e.target.value)}
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium text-[var(--gray-700,#3D3D3D)]">
              Furnishing
            </div>
            <select
              className="w-full rounded-[var(--radius-sm,8px)] border border-[var(--gray-100,#EBEBEB)] px-3 py-2 text-sm"
              value={furnishing}
              onChange={(e) =>
                setFurnishing(e.target.value === "furnished" ? "furnished" : "")
              }
            >
              <option value="">Any</option>
              <option value="furnished">Furnished</option>
            </select>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium text-[var(--gray-700,#3D3D3D)]">
              Parking
            </div>
            <select
              className="w-full rounded-[var(--radius-sm,8px)] border border-[var(--gray-100,#EBEBEB)] px-3 py-2 text-sm"
              value={isParkingIncluded}
              onChange={(e) => setIsParkingIncluded(e.target.value)}
            >
              <option value="">Any</option>
              <option value="true">Parking included</option>
              <option value="false">No parking</option>
            </select>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium text-[var(--gray-700,#3D3D3D)]">
              Pets
            </div>
            <select
              className="w-full rounded-[var(--radius-sm,8px)] border border-[var(--gray-100,#EBEBEB)] px-3 py-2 text-sm"
              value={isPetsAllowed}
              onChange={(e) => setIsPetsAllowed(e.target.value)}
            >
              <option value="">Any</option>
              <option value="true">Pets allowed</option>
              <option value="false">No pets</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button type="button" className="btn-primary flex-1" onClick={apply}>
            Update search
          </button>
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
