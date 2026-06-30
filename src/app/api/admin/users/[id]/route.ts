import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const target = await db.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, phone: true, emailVerified: true, createdAt: true },
  });

  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(target);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (id === user.id) {
    return NextResponse.json({ error: "Cannot modify your own account here. Use Profile page." }, { status: 400 });
  }

  const body = await req.json();
  const updateData: Record<string, unknown> = {};
  if (body.name) updateData.name = body.name;
  if (body.email) updateData.email = body.email;
  if (body.phone !== undefined) updateData.phone = body.phone || null;
  if (body.role) updateData.role = body.role;

  const updated = await db.user.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, phone: true },
  });

  return NextResponse.json({ user: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (id === user.id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  await db.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
