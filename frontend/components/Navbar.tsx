"use client";

import Link from "next/link";
import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import FilterModal from "@/components/FilterModal";
import { BUDGET_PRESETS, PROPERTY_SEARCH_TYPES } from "@/lib/propertyConstants";

function NavbarSearchRow() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [city, setCity] = useState("");
  const [budgetKey, setBudgetKey] = useState("0");
  const [propertyType, setPropertyType] = useState("");

  useEffect(() => {
    setCity(searchParams.get("city") || "");
    setPropertyType(searchParams.get("propertyType") || "");
    const min = searchParams.get("minPrice") || "";
    const max = searchParams.get("maxPrice") || "";
    const idx = BUDGET_PRESETS.findIndex(
      (p) => p.minPrice === min && p.maxPrice === max
    );
    setBudgetKey(idx >= 0 ? String(idx) : "0");
  }, [searchParams]);

  const pushSearchUrl = useCallback(
    (patch: Partial<{
      city: string;
      minPrice: string;
      maxPrice: string;
      propertyType: string;
    }>) => {
      const next = new URLSearchParams(
        pathname === "/search" ? searchParams.toString() : ""
      );
      const setOrDelete = (key: string, value: string | undefined) => {
        if (value === undefined) return;
        if (!value) next.delete(key);
        else next.set(key, value);
      };
      setOrDelete("city", patch.city);
      setOrDelete("minPrice", patch.minPrice);
      setOrDelete("maxPrice", patch.maxPrice);
      setOrDelete("propertyType", patch.propertyType);
      const qs = next.toString();
      const target = `/search${qs ? `?${qs}` : ""}`;
      if (pathname === "/search") router.replace(target);
      else router.push(target);
    },
    [pathname, router, searchParams]
  );

  const applyBudget = (idxStr: string) => {
    setBudgetKey(idxStr);
    const idx = Number(idxStr);
    const preset = BUDGET_PRESETS[idx];
    if (!preset) return;
    pushSearchUrl({
      city,
      propertyType,
      minPrice: preset.minPrice,
      maxPrice: preset.maxPrice,
    });
  };

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-2 rounded-2xl border border-[var(--gray-100)] bg-[var(--surface)] px-3 py-2 shadow-[var(--shadow-sm)] md:mx-auto md:max-w-2xl md:flex-row md:items-center md:justify-center md:gap-2 md:px-4">
      <input
        type="text"
        placeholder="Where to?"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            pushSearchUrl({ city, propertyType });
          }
        }}
        className="w-full min-w-0 border-0 bg-transparent py-2 text-sm font-normal text-[var(--text-primary)] outline-none ring-0 placeholder:text-[var(--text-secondary)] md:max-w-[200px]"
      />
      <span className="hidden h-6 w-px bg-[var(--gray-100)] md:inline-block" />
      <select
        value={budgetKey}
        onChange={(e) => applyBudget(e.target.value)}
        className="w-full cursor-pointer border-0 bg-transparent py-2 text-sm font-medium text-[var(--text-primary)] outline-none md:max-w-[160px]"
      >
        {BUDGET_PRESETS.map((p, i) => (
          <option key={p.label} value={String(i)}>
            {p.label}
          </option>
        ))}
      </select>
      <span className="hidden h-6 w-px bg-[var(--gray-100)] md:inline-block" />
      <select
        value={propertyType}
        onChange={(e) => {
          const v = e.target.value;
          setPropertyType(v);
          const preset = BUDGET_PRESETS[Number(budgetKey)] ?? BUDGET_PRESETS[0];
          pushSearchUrl({
            city,
            minPrice: preset.minPrice,
            maxPrice: preset.maxPrice,
            propertyType: v,
          });
        }}
        className="w-full cursor-pointer border-0 bg-transparent py-2 text-sm font-medium text-[var(--text-primary)] outline-none md:max-w-[160px]"
      >
        {PROPERTY_SEARCH_TYPES.map((t) => (
          <option key={t.label} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-[var(--gray-100)] bg-[var(--surface)] shadow-[var(--nav-shadow)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:gap-6">
          <Link
            href="/"
            className="shrink-0 text-xl font-semibold tracking-tight text-[var(--primary)]"
          >
            RealtyFlow
          </Link>

          <div className="flex min-w-0 flex-1 justify-center">
            <Suspense
              fallback={
                <div className="flex min-h-[48px] w-full max-w-2xl items-center justify-center rounded-2xl border border-[var(--gray-100)] bg-[var(--surface)] text-sm text-[var(--text-secondary)]">
                  Loading…
                </div>
              }
            >
              <NavbarSearchRow />
            </Suspense>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-3 md:w-auto">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="btn-secondary whitespace-nowrap"
            >
              Filters
            </button>

            <div className="relative" ref={ref}>
              {!user ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/signup"
                    className="text-sm font-medium text-[var(--text-primary)]"
                  >
                    Sign up
                  </Link>
                  <Link
                    href="/login"
                    className="btn-primary px-5 py-2.5 text-sm"
                  >
                    Log in
                  </Link>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--gray-100)] bg-[var(--gray-50)] text-sm font-semibold text-[var(--text-primary)] shadow-sm transition hover:shadow-md"
                    aria-label="Account menu"
                  >
                    {user.email?.[0]?.toUpperCase() || "U"}
                  </button>

                  {open ? (
                    <div className="absolute right-0 z-[60] mt-3 w-52 overflow-hidden rounded-xl border border-[var(--gray-100)] bg-[var(--surface)] shadow-[var(--shadow-lg)]">
                      <Link
                        href="/favorites"
                        className="block px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--page-bg)]"
                        onClick={() => setOpen(false)}
                      >
                        Saved
                      </Link>
                      <Link
                        href="/bookings"
                        className="block px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--page-bg)]"
                        onClick={() => setOpen(false)}
                      >
                        Bookings
                      </Link>
                      {user.role === "OWNER" ? (
                        <Link
                          href="/admin/create-property"
                          className="block px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--page-bg)]"
                          onClick={() => setOpen(false)}
                        >
                          List your space
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => void logout()}
                        className="w-full px-4 py-3 text-left text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--page-bg)]"
                      >
                        Logout
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <Suspense fallback={null}>
        <FilterModal
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
        />
      </Suspense>
    </>
  );
}
