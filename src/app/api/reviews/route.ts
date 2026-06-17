import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * /api/reviews
 *
 * GET  ?agentId=<id>
 *   Returns all reviews for the given agent (public).
 *
 * POST  { agentId, rating (1-5), comment? }
 *   Auth required. Each user can leave one review per agent (unique constraint).
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const agentId = url.searchParams.get("agentId");
  if (!agentId) {
    return NextResponse.json({ error: "agentId required." }, { status: 400 });
  }
  const reviews = await db.review.findMany({
    where: { agentId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return NextResponse.json({ reviews, avgRating, count: reviews.length });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { agentId, rating, comment } = body;
    if (!agentId || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "agentId and rating (1-5) required." },
        { status: 400 },
      );
    }
    if (agentId === user.id) {
      return NextResponse.json({ error: "Cannot review yourself." }, { status: 400 });
    }
    const agent = await db.user.findUnique({ where: { id: agentId } });
    if (!agent || (agent.role !== "agent" && agent.role !== "admin")) {
      return NextResponse.json({ error: "Agent not found." }, { status: 404 });
    }

    const review = await db.review.create({
      data: {
        agentId,
        userId: user.id,
        rating: Math.round(rating),
        comment: comment || null,
      },
    });
    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    console.error("[reviews POST] error", err);
    // Unique constraint = already reviewed
    const msg = (err as Error).message ?? "";
    if (msg.includes("Unique")) {
      return NextResponse.json(
        { error: "You have already reviewed this agent." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Could not submit review." }, { status: 500 });
  }
}
