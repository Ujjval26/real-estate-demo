import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, hashPassword, verifyPassword, setSessionCookie, signSessionToken } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const updateData: Record<string, unknown> = {};

  if (body.name !== undefined) updateData.name = body.name;
  if (body.email !== undefined) updateData.email = body.email;

  if (body.currentPassword && body.newPassword) {
    const fullUser = await db.user.findUnique({ where: { id: user.id } });
    if (!fullUser || !(await verifyPassword(body.currentPassword, fullUser.passwordHash))) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }
    updateData.passwordHash = await hashPassword(body.newPassword);
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, phone: true },
  });

  // Re-issue JWT so the cookie reflects name/email changes
  const token = await signSessionToken({
    sub: updated.id,
    email: updated.email,
    role: updated.role as "admin" | "agent" | "buyer",
    name: updated.name,
  });
  await setSessionCookie(token);

  return NextResponse.json({ user: updated });
}
