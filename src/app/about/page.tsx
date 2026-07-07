import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import Image from "next/image";

const FEATURES = [
  {
    title: "Search & Filter",
    description: "Thousands of UK properties by price, type, bedrooms, location, and more — with a live map view.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop",
  },
  {
    title: "Save & Compare",
    description: "Compare up to four properties side by side so you can weigh up the pros and cons.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
  },
  {
    title: "Direct Contact",
    description: "Message agents directly and request viewings with a single tap.",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop",
  },
];

const STATS = [
  { value: "10,000+", label: "Properties listed" },
  { value: "50+", label: "UK cities covered" },
  { value: "4.8/5", label: "Agent rating" },
  { value: "24/7", label: "Live support" },
];

export default async function AboutPage() {
  const user = await getCurrentUser();
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader user={user ? { name: user.name, role: user.role } : null} />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-700 text-white">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1582407947092-045ec3212580?w=1600&h=800&fit=crop')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }} />
          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                About Estateably
              </h1>
              <p className="mt-4 text-lg text-slate-300 sm:text-xl">
                Built for the modern UK property market. Simple, transparent, stress-free.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary sm:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Our Mission</h2>
              <p className="mt-4 text-base leading-relaxed text-slate-700">
                Estateably is a clean, modern UK property portal inspired by Rightmove
                and Zoopla — but simpler. We connect buyers, renters, sellers,
                landlords and agents in one easy-to-use platform. Whether you&apos;re
                searching for your first home, listing a buy-to-let portfolio, or
                just exploring the market, we want to make the process as transparent
                and stress-free as possible.
              </p>
              <p className="mt-4 text-base leading-relaxed text-slate-700">
                We believe finding a home should be the exciting part — not the
                paperwork. Our mission is to remove friction from every step of the
                property journey: from the first search, through viewings and
                negotiations, all the way to getting the keys.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="overflow-hidden rounded-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=500&fit=crop"
                  alt="Modern property"
                  width={400}
                  height={500}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-6 overflow-hidden rounded-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=500&fit=crop"
                  alt="Property exterior"
                  width={400}
                  height={500}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              What We Offer
            </h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="relative aspect-[3/2] overflow-hidden">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Who We Serve</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              {
                title: "Buyers & Renters",
                description: "Search, save, and contact agents for free. Get instant alerts when new properties match your criteria.",
                image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=250&fit=crop",
              },
              {
                title: "Agents & Landlords",
                description: "A powerful dashboard to manage listings, view enquiries, and track performance across your portfolio.",
                image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=250&fit=crop",
              },
              {
                title: "Everyone Else",
                description: "Mortgage calculators, stamp duty tools, agent reviews, and neighbourhood guides — all in one place.",
                image: "https://images.unsplash.com/photo-1582407947092-045ec3212580?w=400&h=250&fit=crop",
              },
            ].map((item) => (
              <div key={item.title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-50 py-12">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-xl font-bold text-slate-900">A note on this demo</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              This site is a demonstration project. Property listings are sample
              data, agent details are fictional, and no real transactions take
              place. If you&apos;d like to learn how the platform was built,
              check out the open-source code on{" "}
              <a
                href="https://github.com/Ujjval26/real-estate-demo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                GitHub
              </a>
              .
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
