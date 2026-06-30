import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const viewing = await db.viewingRequest.findUnique({
    where: { id },
    include: {
      property: {
        select: { id: true, title: true, slug: true, city: true, address: true },
      },
    },
  });

  if (!viewing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...viewing,
    preferredDate: viewing.preferredDate.toISOString(),
    createdAt: viewing.createdAt.toISOString(),
    updatedAt: viewing.updatedAt.toISOString(),
    confirmedAt: viewing.confirmedAt?.toISOString() ?? null,
    completedAt: viewing.completedAt?.toISOString() ?? null,
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, feedback } = body;

  const data: Record<string, unknown> = {};

  if (status) data.status = status;
  if (feedback !== undefined) data.feedback = feedback;

  if (status === "confirmed") {
    const existing = await db.viewingRequest.findUnique({
      where: { id },
      select: { confirmedAt: true },
    });
    if (existing && !existing.confirmedAt) {
      data.confirmedAt = new Date();
      data.confirmedBy = user.name;
    }
  }

  if (status === "completed") {
    const existing = await db.viewingRequest.findUnique({
      where: { id },
      select: { completedAt: true },
    });
    if (existing && !existing.completedAt) {
      data.completedAt = new Date();
    }
  }

  const viewing = await db.viewingRequest.update({
    where: { id },
    data,
    include: {
      property: {
        select: { id: true, title: true, slug: true, city: true },
      },
    },
  });

  return NextResponse.json({
    ...viewing,
    preferredDate: viewing.preferredDate.toISOString(),
    createdAt: viewing.createdAt.toISOString(),
    updatedAt: viewing.updatedAt.toISOString(),
    confirmedAt: viewing.confirmedAt?.toISOString() ?? null,
    completedAt: viewing.completedAt?.toISOString() ?? null,
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await db.viewingRequest.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
