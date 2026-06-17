"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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

// Fix default marker icon paths for bundlers (well-known Leaflet issue)
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export function PropertyMap({ properties, height = "500px", center, zoom }: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Default centre: London
    const initialCenter: [number, number] = center ?? [51.5074, -0.1278];
    const map = L.map(containerRef.current).setView(initialCenter, zoom ?? 11);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [center, zoom]);

  // Update markers whenever properties change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Only show properties with valid coordinates
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

    // Fit bounds to markers (or keep default centre)
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [properties]);

  return <div ref={containerRef} style={{ height, width: "100%" }} />;
}
