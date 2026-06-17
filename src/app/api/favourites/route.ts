import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * POST /api/favourites    { propertyId }
 * DELETE /api/favourites  { propertyId }  (also accepts /[propertyId] route)
 */
async function getBody(req: NextRequest): Promise<{ propertyId?: string }> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const { propertyId } = await getBody(req);
  if (!propertyId) {
    return NextResponse.json({ error: "propertyId required." }, { status: 400 });
  }
  const property = await db.property.findUnique({ where: { id: propertyId } });
  if (!property) {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }
  try {
    await db.favourite.create({
      data: { userId: user.id, propertyId },
    });
  } catch {
    // Unique constraint = already favourited; treat as success.
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const { propertyId } = await getBody(req);
  if (!propertyId) {
    return NextResponse.json({ error: "propertyId required." }, { status: 400 });
  }
  await db.favourite.deleteMany({
    where: { userId: user.id, propertyId },
  });
  return NextResponse.json({ ok: true });
}
