"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    <div className="rounded-2xl bg-white p-4 shadow-xl">
      <div className="flex shrink-0 overflow-hidden rounded-md border border-slate-200">
        <button
          onClick={() => setListingType("sale")}
          className={cn(
            "px-6 py-2 text-sm font-medium transition-colors",
            listingType === "sale" ? "bg-primary text-primary-foreground" : "bg-white text-slate-700 hover:bg-slate-50",
          )}
        >
          Buy
        </button>
        <button
          onClick={() => setListingType("rent")}
          className={cn(
            "px-6 py-2 text-sm font-medium transition-colors",
            listingType === "rent" ? "bg-primary text-primary-foreground" : "bg-white text-slate-700 hover:bg-slate-50",
          )}
        >
          Rent
        </button>
      </div>
      <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Enter a city, postcode, or area…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9 h-12 text-base"
          />
        </div>
        <Button type="submit" size="lg" className="h-12">
          Search
        </Button>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>Popular:</span>
        {["London", "Manchester", "Bristol", "Leeds"].map((c) => (
          <button
            key={c}
            onClick={() => {
              setQ(c);
              router.push(`/search?listingType=${listingType}&q=${c}`);
            }}
            className="rounded-full border border-slate-200 px-2 py-0.5 hover:border-primary hover:text-primary"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
