"use client";

import { useState } from "react";
import { useCreateApplicationMutation } from "@/state/api";
import { useAuth } from "@/context/AuthContext";

export default function ApplicationModal({ propertyId }: { propertyId: number }) {
  const { user } = useAuth();
  const [createApplication] = useCreateApplicationMutation();
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    if (!user) {
      alert("Please log in first");
      return;
    }

    try {
      setLoading(true);

      await createApplication({
        propertyId,
        tenantId: user.userId,
        personalInfo: {
          name: user.name ?? user.email ?? user.userId,
        },
        financialInfo: {},
      }).unwrap();

      alert("Booking request sent!");
    } catch {
      alert("Could not complete booking. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleBook()}
      disabled={loading}
      className="btn-primary w-full py-3 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? "Booking…" : "Book now"}
    </button>
  );
}
