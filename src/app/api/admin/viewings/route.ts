import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const status = searchParams.get("status") || "";

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [viewings, total] = await Promise.all([
    db.viewingRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        property: {
          select: { id: true, title: true, slug: true, city: true },
        },
      },
    }),
    db.viewingRequest.count({ where }),
  ]);

  return NextResponse.json({
    viewings: viewings.map((v) => ({
      ...v,
      preferredDate: v.preferredDate.toISOString(),
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
      confirmedAt: v.confirmedAt?.toISOString() ?? null,
      completedAt: v.completedAt?.toISOString() ?? null,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
