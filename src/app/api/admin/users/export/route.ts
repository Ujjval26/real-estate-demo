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

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { name: true, email: true, role: true, phone: true, emailVerified: true, createdAt: true },
  });

  const date = new Date().toISOString().split("T")[0];
  const headers = ["Name", "Email", "Role", "Phone", "Email Verified", "Created At"];
  const rows = users.map((u) =>
    toCsvRow([
      u.name,
      u.email,
      u.role,
      u.phone,
      u.emailVerified ? u.emailVerified.toISOString() : "",
      u.createdAt.toISOString(),
    ]),
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="users-export-${date}.csv"`,
    },
  });
}
