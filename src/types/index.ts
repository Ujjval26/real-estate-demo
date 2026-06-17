/**
 * Shared types for the real-estate platform.
 * These mirror the Prisma models but provide ergonomic string-literal
 * unions for the role / status / type fields.
 */

export type UserRole = "buyer" | "agent" | "admin";

export type ListingType = "sale" | "rent";

export type PropertyType =
  | "house"
  | "flat"
  | "bungalow"
  | "maisonette"
  | "cottage"
  | "land"
  | "other";

export type PropertyStatus = "draft" | "active" | "sold" | "let" | "withdrawn";

export type ViewingRequestStatus =
  | "pending"
  | "confirmed"
  | "declined"
  | "completed"
  | "cancelled";

export interface PropertyFeature {
  label: string;
}

/** Search criteria persisted in the saved_searches table (JSON). */
export interface SearchCriteria {
  listingType?: ListingType;
  q?: string;
  city?: string;
  postcode?: string;
  propertyType?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  radius?: number; // miles from postcode/city centre
  hasGarden?: boolean;
  hasParking?: boolean;
  isNewBuild?: boolean;
}

/** Public-safe user shape (no passwordHash). */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  emailVerified: boolean;
  createdAt: Date;
}
