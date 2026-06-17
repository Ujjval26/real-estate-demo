import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PropertyGallery } from "@/components/property-gallery";
import { AgentContactCard } from "@/components/agent-contact-card";
import { MortgageCalculator } from "@/components/mortgage-calculator";
import { StampDutyCalculator } from "@/components/stamp-duty-calculator";
import { RequestViewingForm } from "@/components/request-viewing-form";
import { SimilarProperties } from "@/components/similar-properties";
import { formatGBP, formatPropertyPrice } from "@/lib/format";
import { Bed, Bath, MapPin, Home, Calendar, Zap, TreePine, Car, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await db.property.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      agent: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!property || (property.status !== "active" && property.status !== "sold" && property.status !== "let")) {
    notFound();
  }

  const user = await getCurrentUser();
  const isOwner = user && (user.id === property.agentId || user.role === "admin");

  const features: string[] = JSON.parse(property.features || "[]");

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader user={user ? { name: user.name, role: user.role } : null} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1 text-xs text-slate-500">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href={`/search?listingType=${property.listingType}`} className="hover:text-primary capitalize">
            {property.listingType === "rent" ? "To rent" : "For sale"}
          </Link>
          <span>/</span>
          <Link href={`/search?city=${encodeURIComponent(property.city)}`} className="hover:text-primary">
            {property.city}
          </Link>
          <span>/</span>
          <span className="truncate text-slate-700">{property.title}</span>
        </nav>

        {/* Title + price */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {property.title}
            </h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
              <MapPin className="h-4 w-4" />
              {property.address}, {property.city}, {property.postcode}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary">
              {formatPropertyPrice(property.price, property.listingType as "sale" | "rent")}
            </p>
            {property.status === "sold" && (
              <Badge variant="secondary" className="mt-1">Sold STC</Badge>
            )}
            {property.status === "let" && (
              <Badge variant="secondary" className="mt-1">Let Agreed</Badge>
            )}
          </div>
        </div>

        {/* Key facts */}
        <div className="mt-4 flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <Bed className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Bedrooms</p>
              <p className="text-sm font-semibold text-slate-900">{property.bedrooms}</p>
            </div>
          </div>
          <Separator orientation="vertical" className="hidden h-10 sm:block" />
          <div className="flex items-center gap-2">
            <Bath className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Bathrooms</p>
              <p className="text-sm font-semibold text-slate-900">{property.bathrooms}</p>
            </div>
          </div>
          <Separator orientation="vertical" className="hidden h-10 sm:block" />
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Type</p>
              <p className="text-sm font-semibold capitalize text-slate-900">{property.propertyType}</p>
            </div>
          </div>
          {property.epcRating && (
            <>
              <Separator orientation="vertical" className="hidden h-10 sm:block" />
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">EPC rating</p>
                  <p className="text-sm font-semibold text-slate-900">{property.epcRating}</p>
                </div>
              </div>
            </>
          )}
          {property.isNewBuild && (
            <>
              <Separator orientation="vertical" className="hidden h-10 sm:block" />
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Condition</p>
                  <p className="text-sm font-semibold text-slate-900">New build</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Gallery + contact card */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PropertyGallery
              images={property.images.map((img) => ({ url: img.imageUrl }))}
            />

            {/* Description */}
            <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Description</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {property.description}
              </p>
            </section>

            {/* Features */}
            {features.length > 0 && (
              <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-slate-900">Key features</h2>
                <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Property flags */}
            <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Property specifics</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <TreePine className="h-4 w-4 text-slate-400" />
                  Garden: <span className="font-medium">{property.hasGarden ? "Yes" : "No"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-slate-400" />
                  Parking: <span className="font-medium">{property.hasParking ? "Yes" : "No"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  New build: <span className="font-medium">{property.isNewBuild ? "Yes" : "No"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-slate-400" />
                  Reception rooms: <span className="font-medium">{property.receptionRooms}</span>
                </div>
              </div>
            </section>

            {/* Calculators (only for sale) */}
            {property.listingType === "sale" && (
              <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <MortgageCalculator propertyPrice={property.price} />
                <StampDutyCalculator propertyPrice={property.price} />
              </section>
            )}

            {/* Request viewing */}
            <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Request a viewing</h2>
              <RequestViewingForm propertyId={property.id} loggedIn={!!user} />
            </section>
          </div>

          {/* Sidebar: agent contact card */}
          <aside className="space-y-4">
            <AgentContactCard
              agent={property.agent}
              propertyId={property.id}
              loggedIn={!!user}
            />
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Listed</p>
              <p className="text-sm font-medium text-slate-900">
                {new Date(property.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="mt-2 text-xs text-slate-500">{property.viewCount} views</p>
              {isOwner && (
                <p className="mt-2 text-xs text-slate-500">{property.enquiryCount} enquiries</p>
              )}
            </div>
          </aside>
        </div>

        {/* Similar properties */}
        <SimilarProperties property={property} />
      </main>
      <SiteFooter />
    </div>
  );
}
