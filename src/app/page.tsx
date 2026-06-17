import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PropertyCard } from "@/components/property-card";
import { HomeHeroSearch } from "@/components/home-hero-search";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Heart, Mail, Home as HomeIcon, MapPin, TrendingUp } from "lucide-react";

export default async function Home() {
  const user = await getCurrentUser();

  // Fetch featured properties + popular cities in parallel
  const [featured, allCities] = await Promise.all([
    db.property.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
    db.property.findMany({
      where: { status: "active" },
      select: { city: true },
      distinct: ["city"],
      take: 12,
    }),
  ]);

  const popularCities = allCities.map((p) => p.city).slice(0, 8);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader user={user ? { name: user.name, role: user.role } : null} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-slate-900 to-slate-700 text-white">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }} />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Find your next place to call home
            </h1>
            <p className="mt-4 text-base text-slate-300 sm:text-lg">
              Search thousands of properties for sale and to rent across the UK.
            </p>
          </div>
          <div className="mx-auto mt-8 max-w-3xl">
            <HomeHeroSearch />
          </div>
        </div>
      </section>

      {/* Popular locations */}
      {popularCities.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 py-10">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Popular locations</h2>
          <p className="mt-1 text-sm text-slate-600">Browse properties in these UK cities</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {popularCities.map((city) => (
              <Link
                key={city}
                href={`/search?city=${encodeURIComponent(city)}`}
                className="group rounded-xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <MapPin className="h-5 w-5 text-primary" />
                <p className="mt-2 text-sm font-semibold text-slate-900">{city}</p>
                <p className="text-xs text-slate-500 group-hover:text-primary">View properties →</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured listings */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Featured properties</h2>
            <p className="mt-1 text-sm text-slate-600">Fresh listings across the UK</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/search">See all properties</Link>
          </Button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <PropertyCard
              key={p.id}
              property={{
                id: p.id,
                slug: p.slug,
                title: p.title,
                price: p.price,
                listingType: p.listingType,
                propertyType: p.propertyType,
                bedrooms: p.bedrooms,
                bathrooms: p.bathrooms,
                city: p.city,
                postcode: p.postcode,
                status: p.status,
                images: p.images.map((img) => ({ imageUrl: img.imageUrl })),
              }}
            />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">How it works</h2>
          <p className="mt-2 text-center text-sm text-slate-600">Three simple steps to find your next home</p>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="mt-3 text-base font-semibold text-slate-900">1. Search</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Filter thousands of UK properties by price, type, bedrooms and location.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="mt-3 text-base font-semibold text-slate-900">2. Save</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Favourite properties, set up email alerts for new matches, and compare side-by-side.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="mt-3 text-base font-semibold text-slate-900">3. Contact</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Message the agent directly, request a viewing, and move in.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">What our users say</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { quote: "Found my flat in Manchester within a week. The saved search alerts were a game changer.", name: "Sarah M.", role: "Renter, Manchester" },
            { quote: "Listed my BTL property and had 4 enquiries in two days. The dashboard makes everything easy.", name: "David K.", role: "Landlord, Birmingham" },
            { quote: "The map view is so much better than other sites — I could see exactly what was near the tube.", name: "Priya R.", role: "Buyer, London" },
          ].map((t, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="mt-3 text-sm text-slate-700">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-3 text-xs font-semibold text-slate-900">{t.name}</p>
                <p className="text-xs text-slate-500">{t.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA — list a property */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-12">
        <div className="rounded-2xl bg-gradient-to-r from-primary to-teal-600 p-8 text-white sm:p-12">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">List your property in minutes</h2>
              <p className="mt-1 text-sm text-white/90">
                Agents and landlords — reach thousands of buyers and renters today.
              </p>
            </div>
            <Button asChild size="lg" variant="secondary">
              <Link href="/signup">
                <HomeIcon className="mr-1 h-4 w-4" /> List a property
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
