import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

function csvEscape(value: unknown): string {
  const str = value == null ? "" : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsvRow(values: unknown[]): string {
  return values.map(csvEscape).join(",");
}

export async function GET(_req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const properties = await db.property.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      agent: { select: { name: true } },
    },
  });

  const date = new Date().toISOString().split("T")[0];
  const headers = ["Title", "Slug", "Price", "Listing Type", "Property Type", "Status", "Bedrooms", "Bathrooms", "Address", "City", "Postcode", "Region", "Agent", "Created At"];
  const rows = properties.map((p) =>
    toCsvRow([
      p.title,
      p.slug,
      p.price,
      p.listingType,
      p.propertyType,
      p.status,
      p.bedrooms,
      p.bathrooms,
      p.address,
      p.city,
      p.postcode,
      p.region,
      p.agent?.name ?? "",
      p.createdAt.toISOString(),
    ]),
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="properties-export-${date}.csv"`,
    },
  });
}
