/**
 * UK-specific helpers: formatting money in GBP, postcodes, slugify.
 */

/** Format an integer GBP amount as £X,XXX (whole pounds). */
export function formatGBP(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a property price according to listing type:
 *  - sale  → "£350,000"
 *  - rent  → "£1,250 pcm"
 */
export function formatPropertyPrice(
  price: number,
  listingType: "sale" | "rent",
): string {
  const formatted = formatGBP(price);
  return listingType === "rent" ? `${formatted} pcm` : formatted;
}

/** Convert a string into a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Build an SEO-friendly property URL slug of the form
 * `3-bed-flat-in-manchester-m1-2ab-<shortId>`.
 */
export function buildPropertySlug(opts: {
  bedrooms: number;
  propertyType: string;
  city: string;
  postcode: string;
  shortId: string;
}): string {
  const parts = [
    `${opts.bedrooms}-bed`,
    opts.propertyType,
    "in",
    opts.city,
    opts.postcode.split(" ").join("-").toLowerCase(),
    opts.shortId,
  ];
  return slugify(parts.join(" "));
}

/**
 * Validate a UK postcode (simplified). Returns true if the format matches
 * the standard UK postcode pattern (e.g. "M1 2AB", "SW1A 1AA").
 */
export function isValidUkPostcode(postcode: string): boolean {
  return /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(postcode.trim());
}

/** Normalise a postcode to canonical form (uppercase, single space). */
export function normalisePostcode(postcode: string): string {
  const cleaned = postcode.trim().toUpperCase().replace(/\s+/g, " ");
  return cleaned;
}

/** Convert miles to kilometres (Leaflet maps use km for radius display). */
export function milesToKm(miles: number): number {
  return miles * 1.60934;
}

/** Convert kilometres to miles. */
export function kmToMiles(km: number): number {
  return km / 1.60934;
}

/** Haversine distance in miles between two lat/lng coordinates. */
export function haversineMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
