import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (user.role === "agent" || user.role === "admin") {
    const requests = await db.viewingRequest.findMany({
      where: { property: { agentId: user.id } },
      orderBy: { createdAt: "desc" },
      include: {
        property: { select: { id: true, title: true, slug: true, city: true } },
      },
      take: 200,
    });
    return NextResponse.json({ requests });
  }

  const requests = await db.viewingRequest.findMany({
    where: { email: user.email },
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
    const { propertyId, preferredDate, preferredTime, notes } = body;
    if (!propertyId || !preferredDate) {
      return NextResponse.json(
        { error: "propertyId and preferredDate required." },
        { status: 400 },
      );
    }
    const property = await db.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return NextResponse.json({ error: "Property not found." }, { status: 404 });
    }

    const request = await db.viewingRequest.create({
      data: {
        propertyId,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        preferredDate: new Date(preferredDate),
        preferredTime: preferredTime || null,
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
