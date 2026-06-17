import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { buildPropertySlug } from "@/lib/format";
import type { ListingType, PropertyType, PropertyStatus } from "@/types";

/**
 * GET /api/properties
 * Public — list active properties with optional filters.
 *
 * Query params:
 *   listingType   sale | rent
 *   q             full-text-ish (title / city / postcode)
 *   city          exact city match
 *   postcode      case-insensitive partial match
 *   propertyType  house | flat | ...
 *   minPrice      integer GBP
 *   maxPrice      integer GBP
 *   minBedrooms   integer
 *   maxBedrooms   integer
 *   minBathrooms  integer
 *   hasGarden     1 | 0
 *   hasParking    1 | 0
 *   isNewBuild    1 | 0
 *   status        defaults to "active" (admin can override)
 *   sort          price_asc | price_desc | newest | oldest
 *   page          1-indexed
 *   pageSize      default 12, max 60
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const params = url.searchParams;

  const listingType = params.get("listingType") as ListingType | null;
  const q = params.get("q")?.trim() || undefined;
  const city = params.get("city")?.trim() || undefined;
  const postcode = params.get("postcode")?.trim() || undefined;
  const propertyType = params.get("propertyType") as PropertyType | null;
  const minPrice = params.get("minPrice") ? Number(params.get("minPrice")) : undefined;
  const maxPrice = params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined;
  const minBedrooms = params.get("minBedrooms") ? Number(params.get("minBedrooms")) : undefined;
  const maxBedrooms = params.get("maxBedrooms") ? Number(params.get("maxBedrooms")) : undefined;
  const minBathrooms = params.get("minBathrooms") ? Number(params.get("minBathrooms")) : undefined;
  const hasGarden = params.get("hasGarden") === "1" ? true : undefined;
  const hasParking = params.get("hasParking") === "1" ? true : undefined;
  const isNewBuild = params.get("isNewBuild") === "1" ? true : undefined;
  const sort = params.get("sort") || "newest";
  const page = Math.max(1, Number(params.get("page") || 1));
  const pageSize = Math.min(60, Math.max(1, Number(params.get("pageSize") || 12)));

  // Default: only active listings shown publicly.
  // Admins/agents can override by passing ?status=...
  const user = await getCurrentUser();
  const canSeeAll =
    user && (user.role === "admin" || user.role === "agent") && params.has("status");
  const status = canSeeAll
    ? (params.get("status") as PropertyStatus)
    : ("active" as PropertyStatus);

  // Build the Prisma where clause
   
  const where: any = { status };
  if (listingType) where.listingType = listingType;
  if (city) where.city = { contains: city };
  if (postcode) where.postcode = { contains: postcode };
  if (propertyType) where.propertyType = propertyType;
  if (typeof minPrice === "number") where.price = { ...where.price, gte: minPrice };
  if (typeof maxPrice === "number") where.price = { ...where.price, lte: maxPrice };
  if (typeof minBedrooms === "number") where.bedrooms = { ...where.bedrooms, gte: minBedrooms };
  if (typeof maxBedrooms === "number") where.bedrooms = { ...where.bedrooms, lte: maxBedrooms };
  if (typeof minBathrooms === "number") where.bathrooms = { ...where.bathrooms, gte: minBathrooms };
  if (hasGarden !== undefined) where.hasGarden = hasGarden;
  if (hasParking !== undefined) where.hasParking = hasParking;
  if (isNewBuild !== undefined) where.isNewBuild = isNewBuild;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { city: { contains: q } },
      { postcode: { contains: q } },
      { address: { contains: q } },
    ];
  }

  // Sort
   
  const orderBy: any = (() => {
    switch (sort) {
      case "price_asc": return { price: "asc" };
      case "price_desc": return { price: "desc" };
      case "oldest": return { createdAt: "asc" };
      case "newest":
      default: return { createdAt: "desc" };
    }
  })();

  const [total, properties] = await Promise.all([
    db.property.count({ where }),
    db.property.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        agent: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    }),
  ]);

  return NextResponse.json({
    properties,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  });
}

/**
 * POST /api/properties
 * Authenticated, agent or admin only.
 * Creates a new property listing (defaults to status=draft, agent can publish later).
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (user.role !== "agent" && user.role !== "admin") {
    return NextResponse.json(
      { error: "Only agents and admins can create listings." },
      { status: 403 },
    );
  }

  try {
    const body = await req.json();
    const {
      title,
      description,
      price,
      listingType = "sale",
      propertyType = "house",
      bedrooms = 1,
      bathrooms = 1,
      receptionRooms = 1,
      address,
      postcode,
      city,
      latitude,
      longitude,
      epcRating,
      features = [],
      floorPlanUrl,
      status = "draft",
      isNewBuild = false,
      hasGarden = false,
      hasParking = false,
    } = body;

    // Basic validation
    if (!title || !description || !address || !postcode || !city) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 },
      );
    }
    if (typeof price !== "number" || price < 0) {
      return NextResponse.json(
        { error: "Price must be a positive number (GBP pence-stripped)." },
        { status: 400 },
      );
    }

    // Generate a unique slug
    const shortId = Math.random().toString(36).slice(2, 8);
    const slug = buildPropertySlug({
      bedrooms: Number(bedrooms),
      propertyType: String(propertyType),
      city: String(city),
      postcode: String(postcode),
      shortId,
    });

    const property = await db.property.create({
      data: {
        agentId: user.id,
        title,
        slug,
        description,
        price: Math.round(price),
        listingType,
        propertyType,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        receptionRooms: Number(receptionRooms),
        address,
        postcode,
        city,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        epcRating: epcRating || null,
        features: JSON.stringify(features),
        floorPlanUrl: floorPlanUrl || null,
        status,
        isNewBuild: Boolean(isNewBuild),
        hasGarden: Boolean(hasGarden),
        hasParking: Boolean(hasParking),
      },
    });

    return NextResponse.json({ property }, { status: 201 });
  } catch (err) {
    console.error("[properties POST] error", err);
    return NextResponse.json(
      { error: "Could not create property." },
      { status: 500 },
    );
  }
}
