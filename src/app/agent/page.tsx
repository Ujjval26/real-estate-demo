import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Home, Eye, MessageSquare, TrendingUp } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { formatPropertyPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function AgentDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/agent");
  if (user.role !== "agent" && user.role !== "admin") redirect("/");

  const properties = await db.property.findMany({
    where: { agentId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { messages: true, viewingRequests: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
    take: 100,
  });

  const stats = {
    total: properties.length,
    active: properties.filter((p) => p.status === "active").length,
    totalViews: properties.reduce((sum, p) => sum + p.viewCount, 0),
    totalEnquiries: properties.reduce((sum, p) => sum + p.enquiryCount, 0),
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader user={{ name: user.name, role: user.role }} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Agent dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Welcome back, {user.name}. Manage your property listings below.
            </p>
          </div>
          <Button asChild>
            <Link href="/agent/new">
              <Plus className="mr-1 h-4 w-4" /> Add listing
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Home className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                <p className="text-xs text-slate-500">Total listings</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
                <p className="text-xs text-slate-500">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.totalViews}</p>
                <p className="text-xs text-slate-500">Total views</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.totalEnquiries}</p>
                <p className="text-xs text-slate-500">Enquiries</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Listings table */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Your listings</h2>
          </div>
          {properties.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-slate-500">You don&apos;t have any listings yet.</p>
              <Button asChild className="mt-4">
                <Link href="/agent/new"><Plus className="mr-1 h-4 w-4" /> Create your first listing</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {properties.map((p) => (
                <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-slate-50">
                  <div className="h-16 w-20 shrink-0 overflow-hidden rounded-md bg-slate-100">
                    {p.images[0] ? (
                       
                      <img src={p.images[0].imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Home className="h-5 w-5 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/property/${p.slug}`}
                        className="truncate text-sm font-semibold text-slate-900 hover:text-primary"
                      >
                        {p.title}
                      </Link>
                      <Badge variant={
                        p.status === "active" ? "default" :
                        p.status === "sold" || p.status === "let" ? "secondary" :
                        "outline"
                      }>
                        {p.status}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {p.city} · {p.postcode} · {formatPropertyPrice(p.price, p.listingType as "sale" | "rent")}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {p.viewCount} views · {p._count.messages + p._count.viewingRequests} enquiries
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/agent/${p.id}`}>Edit</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
