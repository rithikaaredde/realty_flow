/**
 * Create-property UI codes (user-selected). Mapped to Prisma `Amenity` values + `isParkingIncluded` on submit.
 */
export const AMENITIES = [
  { label: "Wifi", value: "WIFI" },
  { label: "Parking", value: "PARKING" },
  { label: "AC", value: "AC" },
  { label: "Lift", value: "LIFT" },
  { label: "Kitchen", value: "KITCHEN" },
] as const;

export type UiAmenityCode = (typeof AMENITIES)[number]["value"];

/** Maps UI selections to server-safe `amenities` enum strings and parking flag (Prisma-compatible). */
export function mapUiAmenitiesToServerPayload(selected: string[]): {
  amenities: string[];
  isParkingIncluded: boolean;
} {
  const out = new Set<string>();
  let isParkingIncluded = false;
  for (const code of selected) {
    switch (code) {
      case "WIFI":
        out.add("HighSpeedInternet");
        break;
      case "AC":
        out.add("AirConditioning");
        break;
      case "KITCHEN":
        out.add("Dishwasher");
        break;
      case "LIFT":
        out.add("Intercom");
        break;
      case "PARKING":
        isParkingIncluded = true;
        break;
      default:
        break;
    }
  }
  return { amenities: [...out], isParkingIncluded };
}

export const PROPERTY_SEARCH_TYPES: { label: string; value: string }[] = [
  { label: "Any type", value: "" },
  { label: "Apartment", value: "APARTMENT" },
  { label: "Villa", value: "VILLA" },
  { label: "Townhouse", value: "TOWNHOUSE" },
  { label: "Cottage", value: "COTTAGE" },
  { label: "Rooms", value: "ROOMS" },
  { label: "Tiny house", value: "TINYHOUSE" },
];

export const BUDGET_PRESETS: { label: string; minPrice: string; maxPrice: string }[] =
  [
    { label: "Any nightly budget", minPrice: "", maxPrice: "" },
    { label: "Under $1,000 / night", minPrice: "", maxPrice: "1000" },
    { label: "$1,000 – $2,000 / night", minPrice: "1000", maxPrice: "2000" },
    { label: "$2,000 – $3,500 / night", minPrice: "2000", maxPrice: "3500" },
    { label: "$3,500+ / night", minPrice: "3500", maxPrice: "" },
  ];
