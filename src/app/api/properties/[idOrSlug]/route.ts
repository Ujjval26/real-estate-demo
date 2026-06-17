import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * /api/properties/[idOrSlug]
 *
 * Resolves a property either by id (cuid) or by slug (SEO-friendly URL).
 * Auto-detects: cuid IDs always start with "c" and are 24 chars long;
 * everything else is treated as a slug.
 *
 * GET    — fetch by id or slug (public; increments viewCount)
 * PATCH  — update (owner agent or admin only)
 * DELETE — soft delete (sets status=withdrawn)
 */

function isCuid(s: string): boolean {
  return /^c[a-z0-9]{20,30}$/i.test(s);
}

async function findProperty(idOrSlug: string) {
  return isCuid(idOrSlug)
    ? db.property.findUnique({
        where: { id: idOrSlug },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          agent: { select: { id: true, name: true, email: true, phone: true } },
        },
      })
    : db.property.findUnique({
        where: { slug: idOrSlug },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          agent: { select: { id: true, name: true, email: true, phone: true } },
        },
      });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> },
) {
  const { idOrSlug } = await params;
  const property = await findProperty(idOrSlug);

  if (!property) {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }

  const user = await getCurrentUser();
  const isOwner = user && (user.id === property.agentId || user.role === "admin");
  if (property.status !== "active" && !isOwner) {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }

  // Fire-and-forget view count increment
  db.property
    .update({ where: { id: property.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  return NextResponse.json({ property });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> },
) {
  const { idOrSlug } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const property = await findProperty(idOrSlug);
  if (!property) {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }
  if (property.agentId !== user.id && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const body = await req.json();
     
    const update: any = {};
    const allowed = [
      "title", "description", "price", "listingType", "propertyType",
      "bedrooms", "bathrooms", "receptionRooms", "address", "postcode",
      "city", "latitude", "longitude", "epcRating", "floorPlanUrl",
      "status", "isNewBuild", "hasGarden", "hasParking",
    ];
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }
    if (typeof update.price === "number") update.price = Math.round(update.price);
    if (Array.isArray(body.features)) {
      update.features = JSON.stringify(body.features);
    }

    const updated = await db.property.update({
      where: { id: property.id },
      data: update,
    });
    return NextResponse.json({ property: updated });
  } catch (err) {
    console.error("[properties PATCH] error", err);
    return NextResponse.json({ error: "Could not update property." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> },
) {
  const { idOrSlug } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const property = await findProperty(idOrSlug);
  if (!property) {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }
  if (property.agentId !== user.id && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  await db.property.update({
    where: { id: property.id },
    data: { status: "withdrawn" },
  });

  return NextResponse.json({ ok: true });
}
