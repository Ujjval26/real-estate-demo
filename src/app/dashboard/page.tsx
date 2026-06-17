import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PropertyCard } from "@/components/property-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Search, Calendar, MessageSquare, User, ChevronRight } from "lucide-react";
import { formatPropertyPrice } from "@/lib/format";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  const [favourites, savedSearches, viewingRequests, messages] = await Promise.all([
    db.favourite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        property: {
          include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
        },
      },
    }),
    db.savedSearch.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.viewingRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        property: {
          select: { id: true, title: true, slug: true, city: true, postcode: true },
        },
      },
    }),
    db.message.findMany({
      where: { receiverId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        sender: { select: { id: true, name: true } },
        property: { select: { id: true, title: true, slug: true } },
      },
    }),
  ]);

  const unreadCount = messages.filter((m) => !m.readStatus).length;

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: User, active: true },
    { href: "/dashboard/searches", label: "Saved searches", icon: Search, count: savedSearches.length },
    { href: "/dashboard/viewings", label: "Viewing requests", icon: Calendar, count: viewingRequests.length },
    { href: "/dashboard/messages", label: "Messages", icon: MessageSquare, count: unreadCount > 0 ? unreadCount : undefined },
    { href: "/dashboard/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader user={{ name: user.name, role: user.role }} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <aside>
            <nav className="sticky top-20 space-y-1 rounded-xl border border-slate-200 bg-white p-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-primary text-primary-foreground"
                      : "text-slate-700 hover:bg-slate-50 hover:text-primary"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" /> {item.label}
                  </span>
                  {item.count !== undefined && (
                    <Badge variant={item.active ? "secondary" : "outline"} className="text-xs">
                      {item.count}
                    </Badge>
                  )}
                </Link>
              ))}
              {(user.role === "agent" || user.role === "admin") && (
                <Link
                  href="/agent"
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-primary"
                >
                  <span className="flex items-center gap-2">
                    <Heart className="h-4 w-4" /> Agent dashboard
                  </span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              )}
            </nav>
          </aside>

          {/* Main */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Welcome, {user.name.split(" ")[0]}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Here&apos;s an overview of your property activity.
              </p>
            </div>

            {/* Saved properties */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Heart className="h-4 w-4 text-primary" /> Saved properties
                </CardTitle>
                <span className="text-xs text-slate-500">{favourites.length} saved</span>
              </CardHeader>
              <CardContent>
                {favourites.length === 0 ? (
                  <div className="rounded-md bg-slate-50 p-8 text-center">
                    <Heart className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-sm text-slate-500">
                      You haven&apos;t saved any properties yet.
                    </p>
                    <Button asChild className="mt-4" size="sm">
                      <Link href="/search">Browse properties</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {favourites.map((f) => (
                      <PropertyCard
                        key={f.id}
                        property={{
                          id: f.property.id,
                          slug: f.property.slug,
                          title: f.property.title,
                          price: f.property.price,
                          listingType: f.property.listingType,
                          propertyType: f.property.propertyType,
                          bedrooms: f.property.bedrooms,
                          bathrooms: f.property.bathrooms,
                          city: f.property.city,
                          postcode: f.property.postcode,
                          status: f.property.status,
                          images: f.property.images.map((img) => ({ imageUrl: img.imageUrl })),
                        }}
                        favourited
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Saved searches + viewings side-by-side */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Search className="h-4 w-4 text-primary" /> Saved searches
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {savedSearches.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No saved searches.{" "}
                      <Link href="/search" className="text-primary hover:underline">Search properties →</Link>
                    </p>
                  ) : (
                    savedSearches.map((s) => {
                      const criteria = JSON.parse(s.searchCriteria || "{}");
                      return (
                        <Link
                          key={s.id}
                          href={`/search?${new URLSearchParams(criteria).toString()}`}
                          className="block rounded-md border border-slate-200 p-3 hover:border-primary"
                        >
                          <p className="text-sm font-medium text-slate-900">
                            {s.name || criteria.q || criteria.city || "Search"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {criteria.listingType === "rent" ? "To rent" : "For sale"}
                            {criteria.minPrice ? ` · £${criteria.minPrice}+` : ""}
                            {criteria.minBedrooms ? ` · ${criteria.minBedrooms}+ beds` : ""}
                          </p>
                          {s.emailAlertsEnabled && (
                            <Badge variant="outline" className="mt-1 text-[10px]">Email alerts on</Badge>
                          )}
                        </Link>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4 text-primary" /> Recent viewing requests
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {viewingRequests.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No viewing requests yet.
                    </p>
                  ) : (
                    viewingRequests.map((v) => (
                      <Link
                        key={v.id}
                        href={`/property/${v.property.slug}`}
                        className="block rounded-md border border-slate-200 p-3 hover:border-primary"
                      >
                        <p className="text-sm font-medium text-slate-900 line-clamp-1">
                          {v.property.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(v.requestedDate).toLocaleDateString("en-GB", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </p>
                        <Badge variant="outline" className="mt-1 capitalize text-[10px]">
                          {v.status}
                        </Badge>
                      </Link>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-4 w-4 text-primary" /> Recent messages
                  {unreadCount > 0 && (
                    <Badge className="ml-1">{unreadCount} unread</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {messages.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No messages yet. Contact an agent from any property page.
                  </p>
                ) : (
                  messages.map((m) => (
                    <Link
                      key={m.id}
                      href="/dashboard/messages"
                      className={`block rounded-md border p-3 hover:border-primary ${!m.readStatus ? "border-primary/40 bg-accent/30" : "border-slate-200"}`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-900">
                          {m.sender.name}
                          {m.property && (
                            <span className="ml-1 text-xs font-normal text-slate-500">
                              · {m.property.title}
                            </span>
                          )}
                        </p>
                        <span className="text-xs text-slate-400">
                          {new Date(m.createdAt).toLocaleDateString("en-GB")}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-600">
                        {m.messageText}
                      </p>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
