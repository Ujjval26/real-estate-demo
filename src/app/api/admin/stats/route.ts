import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * /api/admin/stats
 * Returns basic site analytics (admin only).
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const [
    totalUsers, totalAgents, totalBuyers, totalProperties,
    activeProperties, soldProperties, letProperties, draftProperties, pendingProperties,
    totalFavourites, totalMessages, totalViewingRequests, totalReviews,
    pendingViewingRequests,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: "agent" } }),
    db.user.count({ where: { role: "buyer" } }),
    db.property.count(),
    db.property.count({ where: { status: "active" } }),
    db.property.count({ where: { status: "sold" } }),
    db.property.count({ where: { status: "let" } }),
    db.property.count({ where: { status: "draft" } }),
    db.property.count({ where: { status: "pending" } }),
    db.favourite.count(),
    db.message.count(),
    db.viewingRequest.count(),
    db.review.count(),
    db.viewingRequest.count({ where: { status: "pending" } }),
  ]);

  // Top 10 cities by property count
  const topCities = await db.property.groupBy({
    by: ["city"],
    _count: { city: true },
    orderBy: { _count: { city: "desc" } },
    take: 10,
  });

  // Aggregate view + enquiry counts
  const viewsAgg = await db.property.aggregate({
    _sum: { viewCount: true, enquiryCount: true },
  });

  // Top 5 most-viewed properties
  const topProperties = await db.property.findMany({
    orderBy: { viewCount: "desc" },
    take: 5,
    select: {
      id: true, title: true, slug: true, viewCount: true, enquiryCount: true,
      city: true, status: true,
      agent: { select: { name: true } },
    },
  });

  // Newest 5 users (signups)
  const newUsers = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return NextResponse.json({
    counts: {
      totalUsers, totalAgents, totalBuyers,
      totalProperties, activeProperties, soldProperties, letProperties, draftProperties, pendingProperties,
      totalFavourites, totalMessages, totalViewingRequests, totalReviews,
      pendingViewingRequests,
    },
    aggregate: {
      totalViews: viewsAgg._sum.viewCount ?? 0,
      totalEnquiries: viewsAgg._sum.enquiryCount ?? 0,
    },
    topProperties,
    newUsers,
    topCities: topCities.map((c) => ({ city: c.city, count: c._count.city })),
  });
}
