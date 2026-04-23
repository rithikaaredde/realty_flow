/** Display-only: API still sends `pricePerMonth`; UI labels it as per-night. */
export function formatPriceAmount(amount: number | string | undefined | null) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  return `$${n.toLocaleString()}`;
}

export function pricePerNightSuffix() {
  return "/ night";
}

export function formatPricePerNightLine(
  amount: number | string | undefined | null
) {
  const a = formatPriceAmount(amount);
  if (a === "—") return a;
  return `${a}${pricePerNightSuffix()}`;
}
