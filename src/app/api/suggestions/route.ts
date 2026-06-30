import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() || "";
  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const [cities, postcodes] = await Promise.all([
    db.property.findMany({
      where: {
        status: "active",
        city: { contains: q },
      },
      select: { city: true },
      distinct: ["city"],
      take: 6,
    }),
    db.property.findMany({
      where: {
        status: "active",
        postcode: { contains: q },
      },
      select: { postcode: true, city: true },
      distinct: ["postcode"],
      take: 4,
    }),
  ]);

  const suggestions = [
    ...cities.map((c) => ({ label: c.city, type: "city" as const, value: c.city })),
    ...postcodes.map((p) => ({ label: `${p.postcode} (${p.city})`, type: "postcode" as const, value: p.postcode })),
  ];

  return NextResponse.json({ suggestions });
}
