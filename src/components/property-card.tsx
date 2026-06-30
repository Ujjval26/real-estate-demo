"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Bed, Bath, MapPin, Home, Maximize, GitCompareArrows, Loader2 } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { formatPropertyPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const COMPARE_KEY = "estateably:compare";
const COMPARE_MAX = 4;

interface PropertyCardProps {
  property: {
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
    images: { imageUrl: string }[];
  };
  favourited?: boolean;
  compact?: boolean;
}

export function PropertyCard({ property, favourited: initialFav, compact }: PropertyCardProps) {
  const [fav, setFav] = useState(!!initialFav);
  const [pending, start] = useTransition();
  const [inCompare, setInCompare] = useState(false);

  useEffect(() => {
    const refresh = () => {
      try {
        const raw = localStorage.getItem(COMPARE_KEY);
        const list: Array<{ id: string }> = raw ? JSON.parse(raw) : [];
        setInCompare(list.some((i) => i.id === property.id));
      } catch {
        setInCompare(false);
      }
    };
    refresh();
    window.addEventListener("estateably:compare-changed", refresh);
    return () => window.removeEventListener("estateably:compare-changed", refresh);
  }, [property.id]);

  function toggleFav(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    start(async () => {
      try {
        const res = await fetch("/api/favourites", {
          method: fav ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyId: property.id }),
        });
        if (!res.ok) {
          const data = await res.json();
          if (res.status === 401) {
            toast.error("Please log in to save properties.");
            return;
          }
          toast.error(data.error || "Could not update favourite.");
          return;
        }
        setFav(!fav);
        toast.success(fav ? "Removed from saved" : "Added to saved");
      } catch {
        toast.error("Network error.");
      }
    });
  }

  function toggleCompare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const raw = localStorage.getItem(COMPARE_KEY);
      const list: Array<{ id: string; slug: string; title: string; price: number; listingType: string; cover?: string }> =
        raw ? JSON.parse(raw) : [];
      if (list.some((i) => i.id === property.id)) {
        const next = list.filter((i) => i.id !== property.id);
        localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
        setInCompare(false);
        toast.success("Removed from compare");
      } else {
        if (list.length >= COMPARE_MAX) {
          toast.error(`You can compare up to ${COMPARE_MAX} properties.`);
          return;
        }
        const next = [...list, {
          id: property.id, slug: property.slug, title: property.title,
          price: property.price, listingType: property.listingType,
          cover: property.images?.[0]?.imageUrl,
        }];
        localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
        setInCompare(true);
        toast.success("Added to compare");
      }
      window.dispatchEvent(new Event("estateably:compare-changed"));
    } catch {
      toast.error("Could not update compare list.");
    }
  }

  const cover = property.images?.[0]?.imageUrl;

  return (
    <Link
      href={`/property/${property.slug}`}
      className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {cover ? (
          <Image
            src={cover}
            alt={property.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Home className="h-10 w-10 text-slate-300" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          {property.status !== "active" && (
            <Badge variant="secondary" className="bg-white/95 capitalize">
              {property.status}
            </Badge>
          )}
        </div>
        <div className="absolute right-3 top-3 flex gap-1.5">
          <button
            onClick={toggleCompare}
            aria-label={inCompare ? "Remove from compare" : "Add to compare"}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition-colors",
              inCompare
                ? "bg-primary text-primary-foreground"
                : "bg-white/95 text-slate-700 hover:bg-white hover:text-primary",
            )}
          >
            <GitCompareArrows className="h-4 w-4" />
          </button>
          <button
            onClick={toggleFav}
            disabled={pending}
            aria-label={fav ? "Remove from saved" : "Save property"}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-sm hover:bg-white hover:text-rose-600 disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={cn("h-4 w-4", fav && "fill-rose-500 text-rose-500")} />}
          </button>
        </div>
      </div>
      <div className={cn("p-4", compact && "p-3")}>
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-lg font-bold text-slate-900">
            {property.price > 0 ? formatPropertyPrice(property.price, property.listingType as "sale" | "rent") : "Price on application"}
          </p>
          <Badge variant="outline" className="capitalize">
            {property.propertyType}
          </Badge>
        </div>
        <p className="mt-1 line-clamp-1 text-sm font-medium text-slate-800">
          {property.title}
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="h-3 w-3" />
          {property.city}{property.postcode && property.postcode !== "-1" ? `, ${property.postcode}` : ""}
        </p>
        <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3 text-xs text-slate-600">
          <span className="flex items-center gap-1">
            <Bed className="h-3.5 w-3.5" /> {property.bedrooms} bed
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-3.5 w-3.5" /> {property.bathrooms} bath
          </span>
          <span className="flex items-center gap-1">
            <Maximize className="h-3.5 w-3.5" /> {property.propertyType}
          </span>
        </div>
      </div>
    </Link>
  );
}
