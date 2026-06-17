import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/saved-searches
 *   Returns the current user's saved searches.
 *
 * POST /api/saved-searches
 *   Body: { name?, searchCriteria, emailAlertsEnabled? }
 *
 * DELETE /api/saved-searches
 *   Body: { id }
 *
 * PATCH /api/saved-searches
 *   Body: { id, emailAlertsEnabled }
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const searches = await db.savedSearch.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ searches });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { name, searchCriteria, emailAlertsEnabled = false } = body;
    if (!searchCriteria || typeof searchCriteria !== "object") {
      return NextResponse.json({ error: "searchCriteria required." }, { status: 400 });
    }
    const search = await db.savedSearch.create({
      data: {
        userId: user.id,
        name: name || null,
        searchCriteria: JSON.stringify(searchCriteria),
        emailAlertsEnabled: Boolean(emailAlertsEnabled),
      },
    });
    return NextResponse.json({ search }, { status: 201 });
  } catch (err) {
    console.error("[saved-searches POST] error", err);
    return NextResponse.json({ error: "Could not save search." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { id, emailAlertsEnabled } = body;
    if (!id) {
      return NextResponse.json({ error: "id required." }, { status: 400 });
    }
    const existing = await db.savedSearch.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    const updated = await db.savedSearch.update({
      where: { id },
      data: { emailAlertsEnabled: Boolean(emailAlertsEnabled) },
    });
    return NextResponse.json({ search: updated });
  } catch (err) {
    console.error("[saved-searches PATCH] error", err);
    return NextResponse.json({ error: "Could not update search." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: "id required." }, { status: 400 });
    }
    const existing = await db.savedSearch.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    await db.savedSearch.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[saved-searches DELETE] error", err);
    return NextResponse.json({ error: "Could not delete search." }, { status: 500 });
  }
}
