"use client";

import "leaflet/dist/leaflet.css";

import dynamic from "next/dynamic";
import L from "leaflet";
import { useMemo, useState } from "react";
import { formatPricePerNightLine } from "@/lib/listingPrice";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), {
  ssr: false,
});
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), {
  ssr: false,
});

type PropertyLike = {
  id: number;
  name: string;
  pricePerMonth: number;
  photoUrls?: string[];
  latitude?: number | null;
  longitude?: number | null;
  location?: { city?: string | null; state?: string | null } | null;
};

export default function PropertyMap({
  properties,
  onPropertySelect,
  compact,
}: {
  properties: PropertyLike[];
  onPropertySelect: (id: number) => void;
  /** Shorter map for embedded property detail layouts */
  compact?: boolean;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fallbackCoords = useMemo(() => {
    // Deterministic "good enough" coordinates when seed data has no lat/lng.
    // Keeps markers visible and stable without requiring a geocoding service.
    const baseLat = 39.8283; // US center
    const baseLng = -98.5795;
    const map = new Map<number, { lat: number; lng: number }>();
    for (const p of properties) {
      const seed = Number.isFinite(p.id) ? p.id : 0;
      const jitterLat = ((seed * 9301 + 49297) % 233280) / 233280 - 0.5;
      const jitterLng = ((seed * 2333 + 1111) % 233280) / 233280 - 0.5;
      map.set(p.id, { lat: baseLat + jitterLat * 8, lng: baseLng + jitterLng * 12 });
    }
    return map;
  }, [properties]);

  const coords = useMemo(
    () =>
      properties
        .map((p) => ({
          id: p.id,
          lat:
            typeof p.latitude === "number"
              ? p.latitude
              : fallbackCoords.get(p.id)?.lat,
          lng:
            typeof p.longitude === "number"
              ? p.longitude
              : fallbackCoords.get(p.id)?.lng,
        }))
        .filter((c) => typeof c.lat === "number" && typeof c.lng === "number"),
    [properties, fallbackCoords]
  );

  const center = useMemo((): [number, number] => {
    if (!coords.length) return [39.8283, -98.5795]; // US center
    const avgLat = coords.reduce((s, c) => s + (c.lat as number), 0) / coords.length;
    const avgLng = coords.reduce((s, c) => s + (c.lng as number), 0) / coords.length;
    return [avgLat, avgLng];
  }, [coords]);

  const icons = useMemo(() => {
    const map = new Map<number, L.DivIcon>();
    for (const p of properties) {
      map.set(
        p.id,
        L.divIcon({
          className: "",
          html: `<div style="
            background:white;
            border:1px solid rgba(0,0,0,0.08);
            border-radius:999px;
            padding:6px 10px;
            box-shadow:0 4px 16px rgba(0,0,0,0.12);
            font-weight:600;
            font-size:12px;
            color:#3D3D3D;
            white-space:nowrap;
          ">${formatPricePerNightLine(p.pricePerMonth).replace(/</g, "&lt;")}</div>`,
          iconSize: [1, 1],
          iconAnchor: [0, 0],
        })
      );
    }
    return map;
  }, [properties]);

  const selected = selectedId
    ? properties.find((p) => p.id === selectedId) ?? null
    : null;

  return (
    <div
      className={`w-full overflow-hidden rounded-[var(--radius-lg,16px)] border border-[var(--gray-100,#EBEBEB)] shadow-[var(--shadow-sm)] ${
        compact
          ? "h-72 md:h-72"
          : "h-[70vh] md:h-[calc(100vh-8rem)]"
      }`}
    >
      <MapContainer center={center} zoom={coords.length ? 10 : 4} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {coords.map((c) => (
          <Marker
            key={c.id}
            position={[c.lat as number, c.lng as number]}
            icon={icons.get(c.id)}
            eventHandlers={{
              click: () => {
                setSelectedId(c.id);
                onPropertySelect(c.id);
              },
            }}
          >
            {selected?.id === c.id ? (
              <Popup>
                <div className="w-56">
                  <img
                    src={selected.photoUrls?.[0] ?? "https://placehold.co/400x300"}
                    className="h-28 w-full rounded-lg object-cover"
                  />
                  <div className="mt-2 text-sm font-semibold">{selected.name}</div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    {formatPricePerNightLine(selected.pricePerMonth)}
                  </div>
                </div>
              </Popup>
            ) : null}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

