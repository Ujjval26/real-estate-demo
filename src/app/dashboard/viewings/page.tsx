import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export default async function ViewingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/viewings");

  const requests = await db.viewingRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      property: {
        select: { id: true, title: true, slug: true, city: true, postcode: true,
          images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      },
    },
  });

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader user={{ name: user.name, role: user.role }} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Viewing requests</h1>
        <p className="mt-1 text-sm text-slate-600">
          Track the status of your property viewing requests.
        </p>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-primary" /> All requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="rounded-md bg-slate-50 p-8 text-center">
                <Calendar className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">
                  No viewing requests yet.
                </p>
                <Button asChild className="mt-3" size="sm">
                  <Link href="/search">Browse properties</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-wrap items-center gap-3 rounded-md border border-slate-200 p-3"
                  >
                    <div className="h-16 w-20 shrink-0 overflow-hidden rounded-md bg-slate-100">
                      {r.property.images[0] ? (
                        <img src={r.property.images[0].imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/property/${r.property.slug}`}
                        className="truncate text-sm font-medium text-slate-900 hover:text-primary"
                      >
                        {r.property.title}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {r.property.city}, {r.property.postcode}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Requested for:{" "}
                        <span className="font-medium text-slate-700">
                          {new Date(r.requestedDate).toLocaleDateString("en-GB", {
                            day: "numeric", month: "long", year: "numeric",
                          })}
                        </span>
                      </p>
                      {r.notes && (
                        <p className="mt-1 text-xs italic text-slate-500">&ldquo;{r.notes}&rdquo;</p>
                      )}
                    </div>
                    <Badge
                      variant={
                        r.status === "confirmed" ? "default" :
                        r.status === "declined" || r.status === "cancelled" ? "destructive" :
                        r.status === "completed" ? "secondary" :
                        "outline"
                      }
                      className="capitalize"
                    >
                      {r.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
