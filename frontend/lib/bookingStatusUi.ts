/**
 * UI-only labels for application/booking status (wire values unchanged).
 */
export function bookingStatusLabel(raw: string | undefined | null): string {
  const s = (raw || "").toUpperCase();
  if (s === "PENDING" || s === "APPROVED") return "Confirmed";
  if (s === "DENIED" || s === "REJECTED") return "Cancelled";
  return raw ? String(raw) : "—";
}

export function bookingStatusBadgeClass(raw: string | undefined | null): string {
  const label = bookingStatusLabel(raw);
  if (label === "Cancelled") {
    return "border border-red-200 bg-red-50 text-red-800";
  }
  if (label === "Confirmed") {
    return "border border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  return "border border-[var(--gray-100)] bg-[var(--surface-muted)] text-[var(--text-secondary)]";
}
