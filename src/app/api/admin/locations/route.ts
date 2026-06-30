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
  const limit = parseInt(searchParams.get("limit") || "50");
  const search = searchParams.get("search") || "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { postcode: { contains: search, mode: "insensitive" } },
    ];
  }

  const [locations, total] = await Promise.all([
    db.location.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.location.count({ where }),
  ]);

  return NextResponse.json({
    locations,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  if (!body.name || !body.postcode) {
    return NextResponse.json({ error: "Name and postcode are required" }, { status: 400 });
  }

  const location = await db.location.create({
    data: {
      name: body.name,
      postcode: body.postcode,
      region: body.region || "",
      type: body.type || "city",
    },
  });

  return NextResponse.json({ location }, { status: 201 });
}
