import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const property = await db.property.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(property);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  // Determine which images to keep vs create vs delete
  const incomingIds: string[] = (body.images || []).filter((i: { id?: string }) => i.id).map((i: { id: string }) => i.id);
  const existing = await db.propertyImage.findMany({ where: { propertyId: id }, select: { id: true } });
  const toDelete = existing.filter((e) => !incomingIds.includes(e.id)).map((e) => e.id);

  const property = await db.property.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
      price: parseInt(body.price),
      listingType: body.listingType,
      propertyType: body.propertyType,
      bedrooms: parseInt(body.bedrooms),
      bathrooms: parseInt(body.bathrooms),
      receptionRooms: parseInt(body.receptionRooms || "1"),
      address: body.address,
      postcode: body.postcode,
      city: body.city,
      status: body.status,
      features: JSON.stringify(body.features || []),
      isNewBuild: body.isNewBuild || false,
      hasGarden: body.hasGarden || false,
      hasParking: body.hasParking || false,
      images: {
        deleteMany: { id: { in: toDelete } },
        create: (body.images || [])
          .filter((i: { id?: string }) => !i.id)
          .map((img: { url: string; sortOrder: number }) => ({
            imageUrl: img.url,
            sortOrder: img.sortOrder,
          })),
      },
    },
  });

  return NextResponse.json({ property });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await db.property.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
