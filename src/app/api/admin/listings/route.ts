import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Authentication required." }, { status: 401 }), user: null };
  if (user.role !== "admin") return { error: NextResponse.json({ error: "Admin access required." }, { status: 403 }), user: null };
  return { error: null, user };
}

/**
 * /api/admin/listings
 *
 * GET    — list all listings (admin can see all statuses)
 * PATCH  — update listing status (e.g. approve/withdraw/sold/let)
 * DELETE — hard delete a listing (admin only)
 */
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") || 50)));
  const status = url.searchParams.get("status");
  const q = url.searchParams.get("q")?.trim();

   
  const where: any = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { city: { contains: q } },
      { postcode: { contains: q } },
    ];
  }

  const [total, listings] = await Promise.all([
    db.property.count({ where }),
    db.property.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        agent: { select: { id: true, name: true, email: true } },
        _count: { select: { messages: true, viewingRequests: true, favouritedBy: true } },
      },
    }),
  ]);

  return NextResponse.json({
    listings,
    pagination: {
      page, pageSize, total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  });
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { id, status } = body;
  if (!id || !["draft", "active", "sold", "let", "withdrawn"].includes(status)) {
    return NextResponse.json({ error: "id and valid status required." }, { status: 400 });
  }
  const updated = await db.property.update({
    where: { id },
    data: { status },
  });
  return NextResponse.json({ property: updated });
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: "id required." }, { status: 400 });
  }
  // Hard delete (cascades to images, favourites, messages, etc.)
  await db.property.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
