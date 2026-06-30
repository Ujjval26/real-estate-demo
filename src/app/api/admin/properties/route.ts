import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const listingType = searchParams.get("listingType") || "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
      { postcode: { contains: search, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status;
  if (listingType) where.listingType = listingType;

  const [properties, total] = await Promise.all([
    db.property.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        agent: { select: { id: true, name: true } },
      },
    }),
    db.property.count({ where }),
  ]);

  return NextResponse.json({
    properties: properties.map((p) => ({ ...p, images: undefined, thumbnail: p.images?.[0]?.imageUrl || null })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const required = ["title", "description", "price", "listingType", "propertyType", "bedrooms", "bathrooms", "address", "postcode", "city"];
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json({ error: `${field} is required` }, { status: 400 });
    }
  }

  const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") +
    "-" + Math.random().toString(36).slice(2, 8);

  const images = body.images?.length
    ? body.images.map((img: { url: string; sortOrder: number }) => ({
        imageUrl: img.url,
        sortOrder: img.sortOrder,
      }))
    : [];

  const property = await db.property.create({
    data: {
      agentId: user.id,
      title: body.title,
      slug,
      description: body.description,
      price: parseInt(body.price),
      listingType: body.listingType,
      propertyType: body.propertyType,
      pricePeriod: body.pricePeriod || null,
      bedrooms: parseInt(body.bedrooms),
      bathrooms: parseInt(body.bathrooms),
      receptionRooms: parseInt(body.receptionRooms || "1"),
      size: body.size ? parseInt(body.size) : null,
      epcRating: body.epcRating || null,
      councilTaxBand: body.councilTaxBand || null,
      tenure: body.tenure || null,
      address: body.address,
      postcode: body.postcode,
      city: body.city,
      region: body.region || null,
      status: body.status || "draft",
      featured: body.featured || false,
      features: JSON.stringify(body.features || []),
      customFeatures: body.customFeatures || null,
      isNewBuild: body.isNewBuild || false,
      hasGarden: body.hasGarden || false,
      hasParking: body.hasParking || false,
      primaryImage: images.length > 0 ? images[0].imageUrl : null,
      images: images.length > 0 ? { create: images } : undefined,
    },
  });

  if (body.status && body.status !== "draft") {
    await db.statusChange.create({
      data: {
        propertyId: property.id,
        oldStatus: "draft",
        newStatus: body.status,
        changedBy: user.id,
      },
    });
  }

  return NextResponse.json({ property }, { status: 201 });
}
