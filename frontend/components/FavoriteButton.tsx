"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  useAddFavoriteMutation,
  useGetFavoritesByUserQuery,
  useRemoveFavoriteMutation,
} from "@/state/api";

export default function FavoriteButton({
  propertyId,
  variant = "panel",
}: {
  propertyId: number;
  variant?: "panel" | "card";
}) {
  const { user } = useAuth();
  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();

  const userId = user?.userId;
  const { data } = useGetFavoritesByUserQuery(userId!, { skip: !userId });

  const favorites = useMemo(() => {
    const raw = (data?.data ?? data ?? []) as any[];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(favorites.some((p: any) => p?.id === propertyId));
  }, [favorites, propertyId]);

  const toggle = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!user) {
      alert("Please log in to save listings.");
      return;
    }
    const next = !saved;
    setSaved(next);
    try {
      if (next) {
        await addFavorite({ userId: user.userId, propertyId }).unwrap();
      } else {
        await removeFavorite({ userId: user.userId, propertyId }).unwrap();
      }
    } catch {
      setSaved(!next);
    }
  };

  if (variant === "card") {
    return (
      <button
        type="button"
        onClick={(e) => void toggle(e)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--gray-100)] bg-[var(--surface)]/95 shadow-md backdrop-blur transition hover:scale-105"
        aria-label={saved ? "Remove from saved" : "Save listing"}
      >
        <Heart
          size={18}
          className={
            saved
              ? "fill-[var(--primary)] text-[var(--primary)]"
              : "text-[var(--text-primary)]"
          }
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => void toggle(e)}
      className="btn-secondary flex w-full items-center justify-center gap-2 py-3 text-[var(--text-primary)]"
    >
      <Heart
        size={18}
        className={
          saved
            ? "fill-[var(--primary)] text-[var(--primary)]"
            : "text-[var(--text-primary)]"
        }
      />
      <span className="font-semibold">{saved ? "Saved" : "Save"}</span>
    </button>
  );
}
