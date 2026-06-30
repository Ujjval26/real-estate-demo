import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status") || "";

  const where: Record<string, unknown> = {};
  if (status === "approved") where.approved = true;
  else if (status === "pending") where.approved = false;

  const [reviews, total] = await Promise.all([
    db.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        property: { select: { title: true, slug: true } },
        agent: { select: { name: true } },
        user: { select: { name: true } },
      },
    }),
    db.review.count({ where }),
  ]);

  return NextResponse.json({
    reviews: reviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing review id" }, { status: 400 });
  }

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
