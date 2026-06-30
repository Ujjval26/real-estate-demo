"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { SearchAutocomplete } from "@/components/search-autocomplete";

export function HomeHeroSearch() {
  const router = useRouter();
  const [listingType, setListingType] = useState<"sale" | "rent">("sale");
  const [q, setQ] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("listingType", listingType);
    if (q.trim()) params.set("q", q.trim());
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex shrink-0 overflow-hidden rounded-md border border-slate-200">
        <button
          type="button"
          onClick={() => setListingType("sale")}
          className={cn(
            "px-4 py-2.5 text-sm font-semibold transition-colors",
            listingType === "sale" ? "bg-primary text-primary-foreground" : "bg-white text-slate-700 hover:bg-slate-50",
          )}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setListingType("rent")}
          className={cn(
            "px-4 py-2.5 text-sm font-semibold transition-colors",
            listingType === "rent" ? "bg-primary text-primary-foreground" : "bg-white text-slate-700 hover:bg-slate-50",
          )}
        >
          Rent
        </button>
      </div>
      <div className="relative min-w-0 flex-1">
        <SearchAutocomplete
          placeholder="Search by city, postcode, or keyword…"
          value={q}
          onChange={setQ}
        />
      </div>
    </form>
  );
}
