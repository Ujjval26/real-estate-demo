"use client";

import { useEffect, useRef, useState } from "react";
import { formatPropertyPrice } from "@/lib/format";

interface Property {
  id: string;
  slug: string;
  title: string;
  price: number;
  listingType: string;
  city: string;
  postcode: string;
  latitude: number | null;
  longitude: number | null;
}

interface PropertyMapProps {
  properties: Property[];
  height?: string;
  center?: [number, number];
  zoom?: number;
}

/**
 * Leaflet map component.
 *
 * Leaflet references `window` at import-time, so we dynamically import it
 * inside useEffect (client-side only) and only render the map container
 * after the import resolves. This avoids SSR/hydration issues.
 */
export function PropertyMap({ properties, height = "500px", center, zoom }: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const [loaded, setLoaded] = useState(false);

  // Load Leaflet once on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Import CSS first
      await import("leaflet/dist/leaflet.css");
      const L = (await import("leaflet")).default;

      // Fix default marker icon paths for bundlers
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (cancelled || !containerRef.current) return;

      const initialCenter: [number, number] = center ?? [51.5074, -0.1278];
      const map = L.map(containerRef.current).setView(initialCenter, zoom ?? 11);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      setLoaded(true);
    })();

    return () => {
      cancelled = true;
      // @ts-expect-error - L.Map type not imported here
      if (mapRef.current && typeof mapRef.current.remove === "function") {
        // @ts-expect-error - L.Map type not imported here
        mapRef.current.remove();
      }
      mapRef.current = null;
    };
  }, [center, zoom]);

  // Update markers whenever properties change.
  useEffect(() => {
    if (!loaded) return;
    (async () => {
      const L = (await import("leaflet")).default;
      // @ts-expect-error - L.Map type not imported here
      const map = mapRef.current;
      if (!map) return;

      // Clear existing markers
      map.eachLayer((layer: unknown) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      const geocoded = properties.filter(
        (p) =>
          typeof p.latitude === "number" &&
          typeof p.longitude === "number" &&
          !Number.isNaN(p.latitude) &&
          !Number.isNaN(p.longitude),
      );

      const bounds: L.LatLngExpression[] = [];

      for (const p of geocoded) {
        const latlng: L.LatLngExpression = [p.latitude as number, p.longitude as number];
        bounds.push(latlng);
        const marker = L.marker(latlng).addTo(map);
        marker.bindPopup(
          `<div style="min-width: 180px;">
            <a href="/property/${p.slug}" style="font-weight: 600; color: #0f766e; text-decoration: none;">
              ${formatPropertyPrice(p.price, p.listingType as "sale" | "rent")}
            </a>
            <div style="font-size: 12px; color: #475569; margin-top: 4px;">
              ${p.title}
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
              ${p.city}, ${p.postcode}
            </div>
          </div>`,
        );
      }

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    })();
  }, [properties, loaded]);

  return <div ref={containerRef} style={{ height, width: "100%" }} />;
}
