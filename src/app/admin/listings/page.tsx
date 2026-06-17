import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListingActions } from "./listing-actions";
import { ArrowLeft, Home } from "lucide-react";
import { formatPropertyPrice } from "@/lib/format";

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/listings");
  if (user.role !== "admin") redirect("/");

  const { q, status } = await searchParams;

   
  const where: any = {};
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { city: { contains: q } },
      { postcode: { contains: q } },
    ];
  }
  if (status && ["draft", "active", "sold", "let", "withdrawn"].includes(status)) {
    where.status = status;
  }

  const listings = await db.property.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      agent: { select: { id: true, name: true, email: true } },
      _count: { select: { messages: true, viewingRequests: true, favouritedBy: true } },
    },
  });

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader user={{ name: user.name, role: user.role }} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/admin"><ArrowLeft className="mr-1 h-4 w-4" /> Back to admin</Link>
        </Button>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
          <Home className="h-6 w-6 text-primary" /> Manage listings
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {listings.length} listing{listings.length === 1 ? "" : "s"} found.
        </p>

        {/* Filter form */}
        <form className="mt-4 flex flex-wrap gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q || ""}
            placeholder="Search by title, city, or postcode…"
            className="flex-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm"
          />
          <select
            name="status"
            defaultValue={status || ""}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="sold">Sold</option>
            <option value="let">Let</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
          <Button type="submit" size="sm">Filter</Button>
        </form>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Listings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {listings.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-500">No listings match your filters.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Property</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="hidden px-4 py-3 md:table-cell">Agent</th>
                      <th className="hidden px-4 py-3 sm:table-cell">Views</th>
                      <th className="hidden px-4 py-3 sm:table-cell">Enquiries</th>
                      <th className="hidden px-4 py-3 sm:table-cell">Favourites</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {listings.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <Link
                            href={`/property/${p.slug}`}
                            className="font-medium text-slate-900 hover:text-primary"
                          >
                            {p.title}
                          </Link>
                          <p className="text-xs text-slate-500">
                            {p.city}, {p.postcode} · {formatPropertyPrice(p.price, p.listingType as "sale" | "rent")}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={
                            p.status === "active" ? "default" :
                            p.status === "sold" || p.status === "let" ? "secondary" :
                            p.status === "withdrawn" ? "destructive" :
                            "outline"
                          } className="capitalize">{p.status}</Badge>
                        </td>
                        <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{p.agent.name}</td>
                        <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">{p.viewCount}</td>
                        <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">{p._count.messages + p._count.viewingRequests}</td>
                        <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">{p._count.favouritedBy}</td>
                        <td className="px-4 py-3 text-right">
                          <ListingActions propertyId={p.id} currentStatus={p.status} title={p.title} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
