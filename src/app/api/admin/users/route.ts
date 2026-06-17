import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * /api/admin/users
 *
 * GET    — list all users (admin only)
 * PATCH  — update user role (admin only)
 * DELETE — delete user (admin only)
 */
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Authentication required." }, { status: 401 }), user: null };
  if (user.role !== "admin") return { error: NextResponse.json({ error: "Admin access required." }, { status: 403 }), user: null };
  return { error: null, user };
}

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") || 50)));
  const q = url.searchParams.get("q")?.trim();
  const role = url.searchParams.get("role");

   
  const where: any = {};
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { email: { contains: q } },
    ];
  }
  if (role) where.role = role;

  const [total, users] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true, name: true, email: true, role: true, phone: true,
        emailVerified: true, createdAt: true,
        _count: {
          select: {
            properties: true,
            favourites: true,
            messagesSent: true,
            reviewsGiven: true,
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    users,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  });
}

export async function PATCH(req: NextRequest) {
  const { error, user: admin } = await requireAdmin();
  if (error || !admin) return error;

  const body = await req.json();
  const { id, role } = body;
  if (!id || !["buyer", "agent", "admin"].includes(role)) {
    return NextResponse.json({ error: "id and valid role required." }, { status: 400 });
  }
  if (id === admin.id && role !== "admin") {
    return NextResponse.json({ error: "Cannot demote yourself." }, { status: 400 });
  }
  const updated = await db.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });
  return NextResponse.json({ user: updated });
}

export async function DELETE(req: NextRequest) {
  const { error, user: admin } = await requireAdmin();
  if (error || !admin) return error;

  const body = await req.json();
  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: "id required." }, { status: 400 });
  }
  if (id === admin.id) {
    return NextResponse.json({ error: "Cannot delete yourself." }, { status: 400 });
  }
  await db.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
