"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCreatePropertyMutation } from "@/state/api";
import {
  AMENITIES,
  mapUiAmenitiesToServerPayload,
} from "@/lib/propertyConstants";

const PROPERTY_TYPES = [
  "APARTMENT",
  "VILLA",
  "TOWNHOUSE",
  "COTTAGE",
  "ROOMS",
  "TINYHOUSE",
] as const;

export default function NewPropertyPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [createProperty] = useCreatePropertyMutation();

  const denied = useMemo(() => !loading && (!user || user.role !== "OWNER"), [loading, user]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    pricePerMonth: "",
    address: "",
    city: "",
    state: "",
    bedrooms: "1",
    bathrooms: "1",
    squareFeet: "800",
    propertyType: "APARTMENT",
  });
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (denied) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="card rounded-[var(--radius-lg,16px)] p-8 text-center">
          <div className="text-xl font-semibold">Access denied</div>
          <Link href="/" className="mt-4 inline-flex text-sm underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-2 text-2xl font-semibold text-[var(--text-primary)]">
        Add a listing
      </h1>
      <p className="mb-8 text-sm font-normal text-[var(--text-secondary)]">
        RealtyFlow for hosts
      </p>

      <form
        className="card rounded-[var(--radius-lg,16px)] p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setSubmitting(true);

          try {
            const { amenities, isParkingIncluded } =
              mapUiAmenitiesToServerPayload(selectedAmenities);
            const payload = {
              name: form.name,
              description: form.description,
              pricePerMonth: Number(form.pricePerMonth),
              securityDeposit: 1000,
              applicationFee: 75,
              photoUrls: ["https://placehold.co/1200x800"],
              amenities,
              isParkingIncluded,
              highlights: [],
              beds: Number(form.bedrooms),
              baths: Number(form.bathrooms),
              squareFeet: Number(form.squareFeet),
              propertyType: form.propertyType,
              location: {
                address: form.address,
                city: form.city,
                state: form.state,
                country: "USA",
                postalCode: "00000",
              },
            };

            const created = await createProperty(payload).unwrap();
            const id = created?.id ?? created?.data?.id;
            if (id) router.push(`/properties/${id}`);
            else router.push("/search");
          } catch (err: any) {
            setError(err?.message ?? "Failed to create property.");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium">Title</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="w-full rounded-[var(--radius-sm,8px)] border border-[var(--gray-100,#EBEBEB)] px-3 py-2.5 text-sm"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              required
              rows={4}
              className="w-full rounded-[var(--radius-sm,8px)] border border-[var(--gray-100,#EBEBEB)] px-3 py-2.5 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nightly rate</label>
            <input
              value={form.pricePerMonth}
              onChange={(e) =>
                setForm((f) => ({ ...f, pricePerMonth: e.target.value }))
              }
              type="number"
              required
              className="w-full rounded-[var(--radius-sm,8px)] border border-[var(--gray-100,#EBEBEB)] px-3 py-2.5 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Property type</label>
            <select
              value={form.propertyType}
              onChange={(e) =>
                setForm((f) => ({ ...f, propertyType: e.target.value }))
              }
              className="w-full rounded-[var(--radius-sm,8px)] border border-[var(--gray-100,#EBEBEB)] px-3 py-2.5 text-sm"
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Bedrooms</label>
            <input
              value={form.bedrooms}
              onChange={(e) =>
                setForm((f) => ({ ...f, bedrooms: e.target.value }))
              }
              type="number"
              required
              className="w-full rounded-[var(--radius-sm,8px)] border border-[var(--gray-100,#EBEBEB)] px-3 py-2.5 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Bathrooms</label>
            <input
              value={form.bathrooms}
              onChange={(e) =>
                setForm((f) => ({ ...f, bathrooms: e.target.value }))
              }
              type="number"
              step="0.5"
              required
              className="w-full rounded-[var(--radius-sm,8px)] border border-[var(--gray-100,#EBEBEB)] px-3 py-2.5 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Square feet</label>
            <input
              value={form.squareFeet}
              onChange={(e) =>
                setForm((f) => ({ ...f, squareFeet: e.target.value }))
              }
              type="number"
              required
              className="w-full rounded-[var(--radius-sm,8px)] border border-[var(--gray-100,#EBEBEB)] px-3 py-2.5 text-sm"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium">Address</label>
            <input
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
              required
              className="w-full rounded-[var(--radius-sm,8px)] border border-[var(--gray-100,#EBEBEB)] px-3 py-2.5 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">City</label>
            <input
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              required
              className="w-full rounded-[var(--radius-sm,8px)] border border-[var(--gray-100,#EBEBEB)] px-3 py-2.5 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">State</label>
            <input
              value={form.state}
              onChange={(e) =>
                setForm((f) => ({ ...f, state: e.target.value }))
              }
              required
              className="w-full rounded-[var(--radius-sm,8px)] border border-[var(--gray-100,#EBEBEB)] px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        <div className="mt-6">
          <div className="text-sm font-medium">Amenities</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {AMENITIES.map(({ label, value }) => {
              const on = selectedAmenities.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setSelectedAmenities((prev) =>
                      on ? prev.filter((x) => x !== value) : [...prev, value]
                    )
                  }
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    on
                      ? "border-[var(--primary,#FF385C)] bg-[var(--primary,#FF385C)] text-white"
                      : "border-[var(--gray-100,#EBEBEB)] bg-white text-[var(--gray-700,#3D3D3D)] hover:bg-[var(--gray-50,#f7f7f7)]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-[var(--radius-sm,8px)] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Creating..." : "Create property"}
        </button>
      </form>
    </div>
  );
}

