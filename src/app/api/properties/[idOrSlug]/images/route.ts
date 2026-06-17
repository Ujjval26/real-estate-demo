import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * /api/properties/[idOrSlug]/images
 *
 * POST   — add one or more images to a property.
 *          Body shape: { images: [{ url: "https://...", sortOrder?: 0 }, ...] }
 *
 * PATCH  — reorder images. Body: { items: [{ id, sortOrder }] }
 *
 * DELETE — bulk delete. Body: { ids: [...] }
 *
 * If CLOUDINARY_* env vars are set, the client should upload to Cloudinary
 * first (via signed upload) and then POST the returned URLs here.
 * Otherwise, the client can simply POST public image URLs (e.g. Unsplash) —
 * we store the URL as-is in Turso.
 */

async function findPropertyId(idOrSlug: string): Promise<string | null> {
  const isCuid = /^c[a-z0-9]{20,30}$/i.test(idOrSlug);
  const property = isCuid
    ? await db.property.findUnique({ where: { id: idOrSlug }, select: { id: true, agentId: true } })
    : await db.property.findUnique({ where: { slug: idOrSlug }, select: { id: true, agentId: true } });
  return property?.id ?? null;
}

async function assertOwnsProperty(propertyId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Authentication required." }, { status: 401 }), user: null };
  }
  const property = await db.property.findUnique({ where: { id: propertyId }, select: { agentId: true } });
  if (!property) {
    return { error: NextResponse.json({ error: "Property not found." }, { status: 404 }), user: null };
  }
  if (property.agentId !== user.id && user.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden." }, { status: 403 }), user: null };
  }
  return { error: null, user };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> },
) {
  const { idOrSlug } = await params;
  const propertyId = await findPropertyId(idOrSlug);
  if (!propertyId) {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }
  const { error } = await assertOwnsProperty(propertyId);
  if (error) return error;

  try {
    const body = await req.json();
    const images: Array<{ url: string; sortOrder?: number }> = body.images;
    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "Provide an array of { url, sortOrder? } objects." },
        { status: 400 },
      );
    }

    const created = await db.propertyImage.createMany({
      data: images.map((img, i) => ({
        propertyId,
        imageUrl: img.url,
        sortOrder: typeof img.sortOrder === "number" ? img.sortOrder : i,
      })),
    });

    return NextResponse.json({ count: created.count }, { status: 201 });
  } catch (err) {
    console.error("[images POST] error", err);
    return NextResponse.json({ error: "Could not add images." }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> },
) {
  const { idOrSlug } = await params;
  const propertyId = await findPropertyId(idOrSlug);
  if (!propertyId) {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }
  const { error } = await assertOwnsProperty(propertyId);
  if (error) return error;

  try {
    const body = await req.json();
    const items: Array<{ id: string; sortOrder: number }> = body.items;
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Bad request." }, { status: 400 });
    }

    await db.$transaction(
      items.map((item) =>
        db.propertyImage.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[images PATCH] error", err);
    return NextResponse.json({ error: "Could not reorder images." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> },
) {
  const { idOrSlug } = await params;
  const propertyId = await findPropertyId(idOrSlug);
  if (!propertyId) {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }
  const { error } = await assertOwnsProperty(propertyId);
  if (error) return error;

  try {
    const body = await req.json();
    const ids: string[] = body.ids;
    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: "Bad request." }, { status: 400 });
    }

    await db.propertyImage.deleteMany({
      where: { id: { in: ids }, propertyId },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[images DELETE] error", err);
    return NextResponse.json({ error: "Could not delete images." }, { status: 500 });
  }
}
