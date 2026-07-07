import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitCompare, X, Bed, Bath, MapPin, Calendar, Zap, TreePine, Car, Building2, Home as HomeIcon } from "lucide-react";
import { formatPropertyPrice } from "@/lib/format";
import { RemoveFromCompareButton } from "./remove-button";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const user = await getCurrentUser();
  const { ids } = await searchParams;
  const idList = ids ? ids.split(",").filter(Boolean).slice(0, 4) : [];

  const properties = idList.length > 0
    ? await db.property.findMany({
        where: { id: { in: idList } },
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          agent: { select: { name: true } },
        },
      })
    : [];

  // Preserve the order from the URL
  const ordered = idList
    .map((id) => properties.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader user={user ? { name: user.name, role: user.role } : null} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
              <GitCompare className="h-6 w-6 text-primary" /> Compare properties
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Compare up to 4 properties side by side.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/search">Back to search</Link>
          </Button>
        </div>

        {ordered.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="p-12 text-center">
              <GitCompare className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">
                No properties selected to compare.
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Use the &ldquo;Compare&rdquo; button on any property to add it here.
              </p>
              <Button asChild className="mt-4">
                <Link href="/search">Browse properties</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <div className="min-w-[500px] sm:min-w-[700px]">
              {/* Header row: images + remove buttons */}
              <div className="grid grid-cols-[180px_repeat(auto-fit,minmax(200px,1fr))] gap-3">
                <div></div>
                {ordered.map((p) => (
                  <div key={p.id} className="space-y-2">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                      {p.images[0] ? (
                        <img src={p.images[0].imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <HomeIcon className="h-8 w-8 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <RemoveFromCompareButton currentIds={idList} removeId={p.id} />
                  </div>
                ))}
              </div>

              {/* Title + price row */}
              <CompareRow label="" values={ordered.map((p) => (
                <div key={p.id}>
                  <Link href={`/property/${p.slug}`} className="text-sm font-semibold text-slate-900 hover:text-primary line-clamp-2">
                    {p.title}
                  </Link>
                  <p className="mt-1 text-lg font-bold text-primary">
                    {formatPropertyPrice(p.price, p.listingType as "sale" | "rent")}
                  </p>
                  <Badge variant="outline" className="mt-1 capitalize">{p.propertyType}</Badge>
                </div>
              ))} />

              <CompareRow label="Location" values={ordered.map((p) => (
                <div key={p.id} className="text-sm text-slate-700">
                  <p className="flex items-start gap-1"><MapPin className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" /> {p.address}</p>
                  <p className="text-xs text-slate-500">{p.city}, {p.postcode}</p>
                </div>
              ))} />

              <CompareRow label="Bedrooms" icon={Bed} values={ordered.map((p) => (
                <span key={p.id} className="text-sm font-medium text-slate-900">{p.bedrooms}</span>
              ))} />

              <CompareRow label="Bathrooms" icon={Bath} values={ordered.map((p) => (
                <span key={p.id} className="text-sm font-medium text-slate-900">{p.bathrooms}</span>
              ))} />

              <CompareRow label="Reception rooms" icon={Building2} values={ordered.map((p) => (
                <span key={p.id} className="text-sm font-medium text-slate-900">{p.receptionRooms}</span>
              ))} />

              <CompareRow label="Garden" icon={TreePine} values={ordered.map((p) => (
                <span key={p.id} className={`text-sm font-medium ${p.hasGarden ? "text-green-600" : "text-slate-400"}`}>
                  {p.hasGarden ? "Yes" : "No"}
                </span>
              ))} />

              <CompareRow label="Parking" icon={Car} values={ordered.map((p) => (
                <span key={p.id} className={`text-sm font-medium ${p.hasParking ? "text-green-600" : "text-slate-400"}`}>
                  {p.hasParking ? "Yes" : "No"}
                </span>
              ))} />

              <CompareRow label="New build" icon={Calendar} values={ordered.map((p) => (
                <span key={p.id} className={`text-sm font-medium ${p.isNewBuild ? "text-green-600" : "text-slate-400"}`}>
                  {p.isNewBuild ? "Yes" : "No"}
                </span>
              ))} />

              <CompareRow label="EPC rating" icon={Zap} values={ordered.map((p) => (
                <span key={p.id} className="text-sm font-medium text-slate-900">{p.epcRating || "—"}</span>
              ))} />

              <CompareRow label="Agent" values={ordered.map((p) => (
                <span key={p.id} className="text-sm text-slate-700">{p.agent.name}</span>
              ))} />

              <CompareRow label="Listed" values={ordered.map((p) => (
                <span key={p.id} className="text-xs text-slate-500">
                  {new Date(p.createdAt).toLocaleDateString("en-GB")}
                </span>
              ))} />

              <CompareRow label="Views" values={ordered.map((p) => (
                <span key={p.id} className="text-xs text-slate-500">{p.viewCount}</span>
              ))} />
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function CompareRow({
  label,
  values,
  icon: Icon,
}: {
  label: string;
  values: React.ReactNode[];
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="grid grid-cols-[180px_repeat(auto-fit,minmax(200px,1fr))] gap-3 border-t border-slate-100 py-3">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </div>
      {values.map((v, i) => (
        <div key={i}>{v}</div>
      ))}
    </div>
  );
}
