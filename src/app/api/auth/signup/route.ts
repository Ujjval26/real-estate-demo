import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  hashPassword,
  signSessionToken,
  setSessionCookie,
} from "@/lib/auth";

const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["buyer", "agent"]).default("buyer"),
  phone: z.string().regex(/^(\+44|0)[1-9]\d{8,9}$/, "Enter a valid UK phone number").optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SignupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }
    const { name, email, password, role, phone } = parsed.data;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        phone: phone || null,
        emailVerified: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    const token = await signSessionToken({
      sub: user.id,
      email: user.email,
      role: user.role as "buyer" | "agent" | "admin",
      name: user.name,
    });
    await setSessionCookie(token);

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error("[signup] error", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
