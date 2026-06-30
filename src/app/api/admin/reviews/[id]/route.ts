import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const review = await db.review.update({
    where: { id },
    data: { approved: body.approved },
    include: {
      property: { select: { title: true, slug: true } },
      agent: { select: { name: true } },
      user: { select: { name: true } },
    },
  });

  return NextResponse.json({ review: { ...review, createdAt: review.createdAt.toISOString() } });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await db.review.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
