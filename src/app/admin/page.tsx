import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, Home, Eye, MessageSquare, Heart, Calendar, Star,
  TrendingUp, ArrowRight, Building2, UserCheck,
} from "lucide-react";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/");

  const [
    totalUsers, totalAgents, totalProperties, activeProperties,
    totalFavourites, totalMessages, totalViewingRequests, totalReviews,
    pendingViewingRequests, totalViews, totalEnquiries,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: "agent" } }),
    db.property.count(),
    db.property.count({ where: { status: "active" } }),
    db.favourite.count(),
    db.message.count(),
    db.viewingRequest.count(),
    db.review.count(),
    db.viewingRequest.count({ where: { status: "pending" } }),
    db.property.aggregate({ _sum: { viewCount: true } }),
    db.property.aggregate({ _sum: { enquiryCount: true } }),
  ]);

  const topProperties = await db.property.findMany({
    orderBy: { viewCount: "desc" },
    take: 5,
    include: { agent: { select: { name: true } } },
  });

  const newUsers = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const stats = [
    { label: "Total users", value: totalUsers, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Agents", value: totalAgents, icon: UserCheck, color: "bg-green-50 text-green-600" },
    { label: "Properties", value: totalProperties, icon: Home, color: "bg-purple-50 text-purple-600" },
    { label: "Active listings", value: activeProperties, icon: Building2, color: "bg-teal-50 text-teal-600" },
    { label: "Total views", value: totalViews._sum.viewCount ?? 0, icon: Eye, color: "bg-amber-50 text-amber-600" },
    { label: "Total enquiries", value: totalEnquiries._sum.enquiryCount ?? 0, icon: MessageSquare, color: "bg-rose-50 text-rose-600" },
    { label: "Favourites", value: totalFavourites, icon: Heart, color: "bg-pink-50 text-pink-600" },
    { label: "Messages", value: totalMessages, icon: MessageSquare, color: "bg-indigo-50 text-indigo-600" },
    { label: "Viewing requests", value: totalViewingRequests, icon: Calendar, color: "bg-orange-50 text-orange-600" },
    { label: "Pending viewings", value: pendingViewingRequests, icon: Calendar, color: "bg-red-50 text-red-600" },
    { label: "Reviews", value: totalReviews, icon: Star, color: "bg-yellow-50 text-yellow-600" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader user={{ name: user.name, role: user.role }} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin panel</h1>
            <p className="mt-1 text-sm text-slate-600">
              Site-wide analytics and management.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/users"><Users className="mr-1 h-4 w-4" /> Manage users</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/listings"><Home className="mr-1 h-4 w-4" /> Manage listings</Link>
            </Button>
          </div>
        </div>

        {/* Stats grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Top properties + new users */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" /> Most viewed properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topProperties.length === 0 ? (
                <p className="text-sm text-slate-500">No properties yet.</p>
              ) : (
                <div className="space-y-3">
                  {topProperties.map((p, i) => (
                    <Link
                      key={p.id}
                      href={`/property/${p.slug}`}
                      className="flex items-center gap-3 rounded-md border border-slate-100 p-2 hover:border-primary"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{p.title}</p>
                        <p className="text-xs text-slate-500">{p.city} · by {p.agent.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">{p.viewCount}</p>
                        <p className="text-[10px] text-slate-400">views</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-primary" /> Recent signups
              </CardTitle>
            </CardHeader>
            <CardContent>
              {newUsers.length === 0 ? (
                <p className="text-sm text-slate-500">No users yet.</p>
              ) : (
                <div className="space-y-3">
                  {newUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between rounded-md border border-slate-100 p-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{u.name}</p>
                        <p className="truncate text-xs text-slate-500">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize text-[10px]">{u.role}</Badge>
                        <span className="text-[11px] text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString("en-GB")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button asChild variant="ghost" size="sm" className="mt-3 w-full">
                <Link href="/admin/users">View all users <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
