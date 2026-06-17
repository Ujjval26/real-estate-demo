import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/viewing-requests
 * Returns viewing requests for the current user (as buyer).
 * Agents get viewing requests for their properties.
 *
 * POST /api/viewing-requests
 * Body: { propertyId, requestedDate (ISO), notes? }
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  // If agent: return viewing requests for their properties.
  // If buyer: return viewing requests they've sent.
  if (user.role === "agent" || user.role === "admin") {
    const requests = await db.viewingRequest.findMany({
      where: { property: { agentId: user.id } },
      orderBy: { createdAt: "desc" },
      include: {
        property: { select: { id: true, title: true, slug: true, city: true } },
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      take: 200,
    });
    return NextResponse.json({ requests });
  }

  const requests = await db.viewingRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      property: {
        select: {
          id: true, title: true, slug: true, city: true, postcode: true,
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      },
    },
    take: 200,
  });
  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { propertyId, requestedDate, notes } = body;
    if (!propertyId || !requestedDate) {
      return NextResponse.json(
        { error: "propertyId and requestedDate required." },
        { status: 400 },
      );
    }
    const property = await db.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return NextResponse.json({ error: "Property not found." }, { status: 404 });
    }

    const request = await db.viewingRequest.create({
      data: {
        userId: user.id,
        propertyId,
        requestedDate: new Date(requestedDate),
        notes: notes || null,
        status: "pending",
      },
    });
    return NextResponse.json({ request }, { status: 201 });
  } catch (err) {
    console.error("[viewing-requests POST] error", err);
    return NextResponse.json({ error: "Could not submit request." }, { status: 500 });
  }
}
