"use client";

import type { LucideIcon } from "lucide-react";
import { AirVent, Building2, Car, ChefHat, Wifi } from "lucide-react";

const ROWS: {
  match: (amenities: string[], isParkingIncluded: boolean) => boolean;
  label: string;
  Icon: LucideIcon;
}[] = [
  {
    match: (amenities) => amenities.includes("HighSpeedInternet"),
    label: "Wifi",
    Icon: Wifi,
  },
  {
    match: (_a, isParking) => isParking,
    label: "Parking",
    Icon: Car,
  },
  {
    match: (amenities) => amenities.includes("AirConditioning"),
    label: "AC",
    Icon: AirVent,
  },
  {
    match: (amenities) => amenities.includes("Intercom"),
    label: "Lift",
    Icon: Building2,
  },
  {
    match: (amenities) => amenities.includes("Dishwasher"),
    label: "Kitchen",
    Icon: ChefHat,
  },
];

export default function AmenitiesGrid({
  amenities,
  isParkingIncluded,
}: {
  amenities: string[];
  isParkingIncluded?: boolean;
}) {
  const list = amenities ?? [];
  const parking = !!isParkingIncluded;
  const visible = ROWS.filter((r) => r.match(list, parking));

  if (!visible.length) {
    return (
      <p className="text-sm text-[var(--gray-500,#717171)]">
        No amenities match the standard set for this listing.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      {visible.map(({ label, Icon }) => (
        <div
          key={label}
          className="flex flex-col items-center gap-2 rounded-[var(--radius-md,12px)] border border-[var(--gray-100,#EBEBEB)] bg-[var(--gray-50,#f7f7f7)] px-3 py-4 text-center"
        >
          <Icon className="h-6 w-6 text-[var(--gray-700,#3D3D3D)]" strokeWidth={1.75} />
          <span className="text-xs font-medium text-[var(--gray-700,#3D3D3D)]">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
