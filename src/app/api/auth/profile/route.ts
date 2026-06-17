import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const ProfilePatchSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional().nullable(),
});

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const body = await req.json();
  const parsed = ProfilePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.phone !== undefined && { phone: parsed.data.phone || null }),
    },
    select: { id: true, name: true, email: true, role: true, phone: true },
  });
  return NextResponse.json({ user: updated });
}
