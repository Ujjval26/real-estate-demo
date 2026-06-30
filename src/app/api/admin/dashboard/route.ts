import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [totalProperties, totalUsers, totalInquiries, pendingApprovals, recentProperties, recentInquiries] = await Promise.all([
    db.property.count(),
    db.user.count(),
    db.inquiry.count(),
    db.property.count({ where: { status: "draft" } }),
    db.property.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, price: true, status: true, createdAt: true },
    }),
    db.inquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, subject: true, status: true, createdAt: true },
    }),
  ]);

  return NextResponse.json({
    totalProperties,
    totalUsers,
    totalInquiries,
    pendingApprovals,
    recentProperties: recentProperties.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() })),
    recentInquiries: recentInquiries.map((i) => ({ ...i, createdAt: i.createdAt.toISOString() })),
  });
}
