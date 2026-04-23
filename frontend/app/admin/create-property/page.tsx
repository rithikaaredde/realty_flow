"use client";

import { useAuth } from "@/context/AuthContext";
import { useCreatePropertyMutation } from "@/state/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  AMENITIES,
  mapUiAmenitiesToServerPayload,
} from "@/lib/propertyConstants";

async function uploadToCloudinary(file: File) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary is not configured.");
  }
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );
  const data = await res.json();
  if (!res.ok || !data?.secure_url) {
    throw new Error(data?.error?.message ?? "Image upload failed.");
  }
  return data.secure_url as string;
}

export default function AdminCreatePropertyPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [createProperty] = useCreatePropertyMutation();

  const denied = useMemo(() => !loading && (!user || user.role !== "OWNER"), [loading, user]);

  const [form, setForm] = useState({
    name: "",
    pricePerMonth: "",
    description: "",
    city: "",
    beds: "",
    baths: "",
    squareFeet: "",
  });
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);

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
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-2xl font-semibold text-[var(--text-primary)]">
        Create a listing
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
            if (
              Number(form.beds) <= 0 ||
              Number(form.baths) <= 0 ||
              Number(form.squareFeet) <= 0
            ) {
              throw new Error("Beds, baths, and squareFeet must be greater than 0.");
            }
            const imageUrls = files.length
              ? await Promise.all(files.map((file) => uploadToCloudinary(file)))
              : ["https://placehold.co/1200x800"];
            const { amenities, isParkingIncluded } =
              mapUiAmenitiesToServerPayload(selectedAmenities);
            const payload = {
              name: form.name,
              description: form.description,
              pricePerMonth: Number(form.pricePerMonth),
              securityDeposit: 1000,
              applicationFee: 75,
              photoUrls: imageUrls,
              imageUrls,
              amenities,
              isParkingIncluded,
              highlights: [],
              beds: Number(form.beds),
              baths: Number(form.baths),
              squareFeet: Number(form.squareFeet),
              propertyType: "APARTMENT",
              location: {
                address: "TBD",
                city: form.city,
                state: "TBD",
                country: "USA",
                postalCode: "00000",
              },
            };

            const created = await createProperty(payload).unwrap();
            const id = created?.id ?? created?.data?.id;
            router.push(id ? `/properties/${id}` : "/search");
          } catch (err: any) {
            setError(err?.data?.error ?? err?.message ?? "Failed to create property.");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <div className="grid gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="w-full rounded-[var(--radius-sm,8px)] border border-[var(--gray-100,#EBEBEB)] px-3 py-2.5 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nightly rate</label>
            <input
              value={form.pricePerMonth}
              onChange={(e) => setForm((f) => ({ ...f, pricePerMonth: e.target.value }))}
              type="number"
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
            <label className="text-sm font-medium">Beds</label>
            <input
              value={form.beds}
              onChange={(e) => setForm((f) => ({ ...f, beds: e.target.value }))}
              type="number"
              required
              className="w-full rounded-[var(--radius-sm,8px)] border border-[var(--gray-100,#EBEBEB)] px-3 py-2.5 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Baths</label>
            <input
              value={form.baths}
              onChange={(e) => setForm((f) => ({ ...f, baths: e.target.value }))}
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

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              required
              className="w-full rounded-[var(--radius-sm,8px)] border border-[var(--gray-100,#EBEBEB)] px-3 py-2.5 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-sm font-medium">Amenities</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {AMENITIES.map(({ label, value }) => {
                const on = selectedAmenities.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setSelectedAmenities((prev) =>
                        on
                          ? prev.filter((x) => x !== value)
                          : [...prev, value]
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

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="w-full rounded-[var(--radius-sm,8px)] border border-[var(--gray-100,#EBEBEB)] px-3 py-2.5 text-sm"
            />
            {files.length ? (
              <div className="grid grid-cols-3 gap-2 pt-2">
                {files.map((file) => (
                  <img
                    key={`${file.name}-${file.size}`}
                    src={URL.createObjectURL(file)}
                    className="h-20 w-full rounded object-cover"
                    alt={file.name}
                  />
                ))}
              </div>
            ) : null}
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

