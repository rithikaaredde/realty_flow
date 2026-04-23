"use client";

import ImageWithFallback from "@/components/ImageWithFallback";
import { useState } from "react";

export default function PropertyGallery({
  name,
  photos,
}: {
  name: string;
  photos: string[];
}) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-[var(--gray-100)] shadow-[var(--shadow-sm)]">
        <div className="grid gap-2 md:grid-cols-5">
          <button
            type="button"
            className="md:col-span-3"
            onClick={() => setShowAllPhotos(true)}
          >
            <ImageWithFallback
              src={photos[0]}
              alt={name}
              width={1200}
              height={800}
              className="h-72 w-full object-cover md:h-[26rem]"
            />
          </button>
          <div className="hidden gap-2 md:col-span-2 md:grid md:grid-rows-2">
            {[photos[1], photos[2]].filter(Boolean).map((src, idx) => (
              <button
                key={String(src) + idx}
                type="button"
                onClick={() => setShowAllPhotos(true)}
                className="overflow-hidden"
              >
                <ImageWithFallback
                  src={src}
                  alt={`${name} ${idx + 2}`}
                  width={600}
                  height={400}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="absolute bottom-3 right-3 md:hidden">
          <button
            type="button"
            onClick={() => setShowAllPhotos(true)}
            className="rounded-full border border-white/50 bg-white/90 px-4 py-2 text-xs font-medium shadow-[var(--shadow-sm)] backdrop-blur"
          >
            Show all photos
          </button>
        </div>
      </div>

      {showAllPhotos ? (
        <div className="fixed inset-0 z-[60] bg-black/70 p-4">
          <div className="mx-auto max-w-5xl rounded-[var(--radius-lg,16px)] bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold">Photos</div>
              <button
                type="button"
                onClick={() => setShowAllPhotos(false)}
                className="text-sm text-[var(--gray-500,#717171)] underline"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {photos.map((src: string, idx: number) => (
                <button
                  key={src + idx}
                  type="button"
                  onClick={() => setShowAllPhotos(false)}
                  className="overflow-hidden rounded-[var(--radius-md,12px)]"
                >
                  <ImageWithFallback
                    src={src}
                    alt={`${name} ${idx + 1}`}
                    width={900}
                    height={600}
                    className="h-56 w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
