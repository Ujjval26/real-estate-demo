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
  if (status) where.status = status;

  const [inquiries, total] = await Promise.all([
    db.inquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.inquiry.count({ where }),
  ]);

  return NextResponse.json({
    inquiries: inquiries.map((i) => ({ ...i, createdAt: i.createdAt.toISOString() })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
