"use client";

import Link from "next/link";
import { Heart, Bed, Bath, MapPin, Home, Maximize } from "lucide-react";
import { useState, useTransition } from "react";
import { formatPropertyPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  /** Whether the current user has favourited this property. */
  favourited?: boolean;
  /** Compact variant for dashboards. */
  compact?: boolean;
}

export function PropertyCard({ property, favourited: initialFav, compact }: PropertyCardProps) {
  const [fav, setFav] = useState(!!initialFav);
  const [pending, start] = useTransition();

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

  const cover = property.images?.[0]?.imageUrl;

  return (
    <Link
      href={`/property/${property.slug}`}
      className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {cover ? (
           
          <img
            src={cover}
            alt={property.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
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
        <button
          onClick={toggleFav}
          disabled={pending}
          aria-label={fav ? "Remove from saved" : "Save property"}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-sm hover:bg-white hover:text-rose-600 disabled:opacity-50"
        >
          <Heart className={cn("h-4 w-4", fav && "fill-rose-500 text-rose-500")} />
        </button>
      </div>
      <div className={cn("p-4", compact && "p-3")}>
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-lg font-bold text-slate-900">
            {formatPropertyPrice(property.price, property.listingType as "sale" | "rent")}
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
          {property.city}, {property.postcode}
        </p>
        <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3 text-xs text-slate-600">
          <span className="flex items-center gap-1">
            <Bed className="h-3.5 w-3.5" /> {property.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-3.5 w-3.5" /> {property.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            <Maximize className="h-3.5 w-3.5" /> {property.propertyType}
          </span>
        </div>
      </div>
    </Link>
  );
}
