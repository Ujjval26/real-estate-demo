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

  // Fetch old property for status change detection
  const oldProperty = await db.property.findUnique({
    where: { id },
    select: { status: true },
  });

  if (!oldProperty) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Determine which images to keep vs create vs delete
  const incomingIds: string[] = (body.images || []).filter((i: { id?: string }) => i.id).map((i: { id: string }) => i.id);
  const existing = await db.propertyImage.findMany({ where: { propertyId: id }, select: { id: true } });
  const toDelete = existing.filter((e) => !incomingIds.includes(e.id)).map((e) => e.id);

  const newImages = (body.images || [])
    .filter((i: { id?: string }) => !i.id)
    .map((img: { url: string; sortOrder: number }) => ({
      imageUrl: img.url,
      sortOrder: img.sortOrder,
    }));

  const allImagesAfter = body.images || [];
  const primaryImageUrl = allImagesAfter.length > 0
    ? allImagesAfter.find((i: { id?: string }) => i.id)
      ? allImagesAfter.find((i: { id?: string }) => i.id).imageUrl || allImagesAfter[0].url
      : allImagesAfter[0].url
    : null;

  const property = await db.property.update({
    where: { id },
    data: {
      title: body.title,
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
      status: body.status,
      featured: body.featured || false,
      features: JSON.stringify(body.features || []),
      customFeatures: body.customFeatures || null,
      isNewBuild: body.isNewBuild || false,
      hasGarden: body.hasGarden || false,
      hasParking: body.hasParking || false,
      primaryImage: primaryImageUrl,
      images: {
        deleteMany: { id: { in: toDelete } },
        create: newImages,
      },
    },
  });

  if (body.status && body.status !== oldProperty.status) {
    await db.statusChange.create({
      data: {
        propertyId: id,
        oldStatus: oldProperty.status,
        newStatus: body.status,
        changedBy: user.id,
      },
    });
  }

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
