"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, X, List, Map as MapIcon, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PropertyCard } from "@/components/property-card";
import { PropertyMap } from "@/components/property-map";
import { SaveSearchButton } from "@/components/save-search-button";
import { SearchAutocomplete } from "@/components/search-autocomplete";
import { formatGBP } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface Property {
  id: string;
  slug: string;
  title: string;
  price: number;
  listingType: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  city: string;
  postcode: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  images: { imageUrl: string }[];
}

const PROPERTY_TYPES = [
  { value: "house", label: "House" },
  { value: "flat", label: "Flat" },
  { value: "bungalow", label: "Bungalow" },
  { value: "maisonette", label: "Maisonette" },
  { value: "cottage", label: "Cottage" },
  { value: "land", label: "Land" },
];

const POPULAR_CITIES = [
  "London", "Manchester", "Birmingham", "Leeds", "Bristol",
  "Liverpool", "Edinburgh", "Glasgow", "Cardiff", "Sheffield",
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "price_asc", label: "Price (low to high)" },
  { value: "price_desc", label: "Price (high to low)" },
];

export function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial state from URL
  const [listingType, setListingType] = useState<"sale" | "rent">(
    (searchParams.get("listingType") as "sale" | "rent") || "sale",
  );
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [postcode, setPostcode] = useState(searchParams.get("postcode") || "");
  const [propertyType, setPropertyType] = useState(searchParams.get("propertyType") || "any");
  const [minBedrooms, setMinBedrooms] = useState(Number(searchParams.get("minBedrooms")) || 0);
  const [minPrice, setMinPrice] = useState(Number(searchParams.get("minPrice")) || 0);
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get("maxPrice")) || 0);
  const [hasGarden, setHasGarden] = useState(searchParams.get("hasGarden") === "1");
  const [hasParking, setHasParking] = useState(searchParams.get("hasParking") === "1");
  const [isNewBuild, setIsNewBuild] = useState(searchParams.get("isNewBuild") === "1");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [view, setView] = useState<"list" | "map">(searchParams.get("view") === "map" ? "map" : "list");

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Build query string from filters
  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    p.set("listingType", listingType);
    if (q.trim()) p.set("q", q.trim());
    if (city.trim()) p.set("city", city.trim());
    if (postcode.trim()) p.set("postcode", postcode.trim());
    if (propertyType !== "any") p.set("propertyType", propertyType);
    if (minBedrooms > 0) p.set("minBedrooms", String(minBedrooms));
    if (minPrice > 0) p.set("minPrice", String(minPrice));
    if (maxPrice > 0) p.set("maxPrice", String(maxPrice));
    if (hasGarden) p.set("hasGarden", "1");
    if (hasParking) p.set("hasParking", "1");
    if (isNewBuild) p.set("isNewBuild", "1");
    p.set("sort", sort);
    p.set("page", String(pagination.page));
    p.set("pageSize", "24");
    return p.toString();
  }, [listingType, q, city, postcode, propertyType, minBedrooms, minPrice, maxPrice, hasGarden, hasParking, isNewBuild, sort, pagination.page]);

  // Fetch results whenever filters change (debounced)
  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/properties?${queryString}`);
        const data = await res.json();
        setProperties(data.properties || []);
        setPagination((prev) => ({
          page: prev.page,
          totalPages: data.pagination?.totalPages || 1,
          total: data.pagination?.total || 0,
        }));
      } catch {
        setProperties([]);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [queryString]);

  // Update URL when filters change (without page refresh)
  useEffect(() => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(queryString);
    url.search = params.toString();
    window.history.replaceState(null, "", url.toString());
  }, [queryString]);

  function resetPageAnd<T>(setter: (v: T) => void, value: T) {
    setter(value);
    setPagination((p) => ({ ...p, page: 1 }));
  }

  const priceMax = listingType === "rent" ? 5000 : 2000000;
  const priceStep = listingType === "rent" ? 50 : 10000;

  const FiltersContent = (
    <div className="space-y-5">
      {/* Buy / Rent toggle */}
      <div>
        <Label className="text-xs">Listing type</Label>
        <RadioGroup
          value={listingType}
          onValueChange={(v) => resetPageAnd(setListingType, v as "sale" | "rent")}
          className="mt-2 grid grid-cols-2 gap-2"
        >
          <label className={cn("flex cursor-pointer items-center justify-center rounded-md border-2 p-2 text-sm font-medium", listingType === "sale" ? "border-primary bg-accent" : "border-slate-200")}>
            <RadioGroupItem value="sale" id="ft-sale" className="sr-only" />
            For sale
          </label>
          <label className={cn("flex cursor-pointer items-center justify-center rounded-md border-2 p-2 text-sm font-medium", listingType === "rent" ? "border-primary bg-accent" : "border-slate-200")}>
            <RadioGroupItem value="rent" id="ft-rent" className="sr-only" />
            To rent
          </label>
        </RadioGroup>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label className="text-xs">Location</Label>
        <SearchAutocomplete
          placeholder="City, postcode, or area"
          value={city}
          onChange={(v) => resetPageAnd(setCity, v)}
        />
        <div className="flex flex-wrap gap-1">
          {POPULAR_CITIES.slice(0, 6).map((c) => (
            <button
              key={c}
              onClick={() => resetPageAnd(setCity, c)}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[11px] hover:border-primary hover:text-primary",
                city === c ? "border-primary bg-accent text-primary" : "border-slate-200 text-slate-600",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Property type */}
      <div>
        <Label className="text-xs">Property type</Label>
        <Select value={propertyType} onValueChange={(v) => resetPageAnd(setPropertyType, v)}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any type</SelectItem>
            {PROPERTY_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price range */}
      <div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Price range</Label>
          <span className="text-xs text-slate-500">
            {minPrice > 0 || maxPrice > 0
              ? `${minPrice > 0 ? formatGBP(minPrice) : "£0"} – ${maxPrice > 0 ? formatGBP(maxPrice) : "Any"}`
              : "Any"}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min £"
            value={minPrice || ""}
            onChange={(e) => resetPageAnd(setMinPrice, Number(e.target.value) || 0)}
          />
          <Input
            type="number"
            placeholder="Max £"
            value={maxPrice || ""}
            onChange={(e) => resetPageAnd(setMaxPrice, Number(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <Label className="text-xs">Minimum bedrooms</Label>
        <div className="mt-2 flex flex-wrap gap-1">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => resetPageAnd(setMinBedrooms, n)}
              className={cn(
                "rounded-md border px-3 py-1 text-sm font-medium",
                minBedrooms === n ? "border-primary bg-primary text-primary-foreground" : "border-slate-200 hover:border-slate-300",
              )}
            >
              {n === 0 ? "Any" : `${n}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="space-y-2">
        <Label className="text-xs">Must have</Label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={hasGarden} onCheckedChange={(v) => resetPageAnd(setHasGarden, v === true)} />
          Garden
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={hasParking} onCheckedChange={(v) => resetPageAnd(setHasParking, v === true)} />
          Parking
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={isNewBuild} onCheckedChange={(v) => resetPageAnd(setIsNewBuild, v === true)} />
          New build
        </label>
      </div>

      {(q || city || postcode || propertyType !== "any" || minBedrooms > 0 || minPrice > 0 || maxPrice > 0 || hasGarden || hasParking || isNewBuild) && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => {
            setQ(""); setCity(""); setPostcode(""); setPropertyType("any");
            setMinBedrooms(0); setMinPrice(0); setMaxPrice(0);
            setHasGarden(false); setHasParking(false); setIsNewBuild(false);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
        >
          <X className="mr-1 h-3.5 w-3.5" /> Clear filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Search bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex shrink-0 overflow-hidden rounded-md border border-slate-200">
          <button
            onClick={() => resetPageAnd(setListingType, "sale")}
            className={cn("px-3 py-1.5 text-sm font-medium", listingType === "sale" ? "bg-primary text-primary-foreground" : "bg-white text-slate-700")}
          >
            Buy
          </button>
          <button
            onClick={() => resetPageAnd(setListingType, "rent")}
            className={cn("px-3 py-1.5 text-sm font-medium", listingType === "rent" ? "bg-primary text-primary-foreground" : "bg-white text-slate-700")}
          >
            Rent
          </button>
        </div>
        <div className="relative flex-1">
          <SearchAutocomplete
            placeholder="Search by city, postcode, or keyword…"
            value={q}
            onChange={(v) => resetPageAnd(setQ, v)}
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden">
              <SlidersHorizontal className="mr-1 h-4 w-4" /> Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] overflow-y-auto">
            <div className="mt-6">
              <h2 className="mb-4 text-sm font-semibold">Filters</h2>
              {FiltersContent}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Layout: sidebar + results */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">Filters</h2>
            {FiltersContent}
          </div>
        </aside>

        {/* Results */}
        <div>
          {/* Toolbar */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
            <p className="text-sm text-slate-600">
              {loading ? "Searching…" : `${pagination.total} propert${pagination.total === 1 ? "y" : "ies"} found`}
            </p>
            <div className="flex items-center gap-2">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="h-8 w-[170px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex overflow-hidden rounded-md border border-slate-200">
                <button
                  onClick={() => setView("list")}
                  className={cn("flex h-8 w-9 items-center justify-center", view === "list" ? "bg-primary text-primary-foreground" : "bg-white text-slate-600 hover:bg-slate-50")}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView("map")}
                  className={cn("flex h-8 w-9 items-center justify-center", view === "map" ? "bg-primary text-primary-foreground" : "bg-white text-slate-600 hover:bg-slate-50")}
                  aria-label="Map view"
                >
                  <MapIcon className="h-4 w-4" />
                </button>
              </div>
              <SaveSearchButton />
            </div>
          </div>

          {/* Results content */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
              <MapPin className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-900">No properties found</p>
              <p className="mt-1 text-xs text-slate-500">Try widening your search or clearing filters.</p>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/search">Clear all filters</Link>
              </Button>
            </div>
          ) : view === "map" ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_400px]">
              <div className="h-[70vh] overflow-hidden rounded-xl border border-slate-200">
                <PropertyMap properties={properties} />
              </div>
              <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
                {properties.map((p) => (
                  <PropertyCard
                    key={p.id}
                    property={p}
                    compact
                  />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {properties.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
              {pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-slate-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
