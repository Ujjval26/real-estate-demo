import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default async function AboutPage() {
  const user = await getCurrentUser();
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader user={user ? { name: user.name, role: user.role } : null} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">About Estateably</h1>
        <p className="mt-2 text-sm text-slate-600">Built for the modern UK property market.</p>

        <div className="prose prose-slate mt-6 max-w-none text-slate-700">
          <p className="text-base leading-relaxed">
            Estateably is a clean, modern UK property portal inspired by Rightmove
            and Zoopla — but simpler. We connect buyers, renters, sellers,
            landlords and agents in one easy-to-use platform. Whether you&apos;re
            searching for your first home, listing a buy-to-let portfolio, or
            just exploring the market, we want to make the process as transparent
            and stress-free as possible.
          </p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">Our mission</h2>
          <p className="mt-2 text-base leading-relaxed">
            We believe finding a home should be the exciting part — not the
            paperwork. Our mission is to remove friction from every step of the
            property journey: from the first search, through viewings and
            negotiations, all the way to getting the keys. That means clean
            search filters, honest pricing in GBP, helpful calculators, and
            direct contact with the people who actually know the property.
          </p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">What we offer</h2>
          <ul className="mt-2 space-y-2 text-base leading-relaxed">
            <li><strong>Search &amp; filter</strong> thousands of UK properties by price, type, bedrooms, location, and more — with a live map view.</li>
            <li><strong>Save &amp; compare</strong> up to four properties side by side so you can weigh up the pros and cons.</li>
            <li><strong>Email alerts</strong> the moment a new property matches your saved search criteria.</li>
            <li><strong>Mortgage &amp; stamp duty calculators</strong> built into every property page — see the real cost of buying.</li>
            <li><strong>Direct messaging</strong> with agents and one-tap viewing requests.</li>
            <li><strong>Agent reviews</strong> from real buyers and renters, so you know who you&apos;re dealing with.</li>
          </ul>

          <h2 className="mt-8 text-xl font-bold text-slate-900">Who we serve</h2>
          <p className="mt-2 text-base leading-relaxed">
            Estateably is built for everyone in the UK property ecosystem. Buyers
            and renters can search, save, and contact agents for free. Agents and
            landlords get a powerful dashboard to manage listings, view enquiries,
            and track performance. Our admin team curates listings to keep the
            platform trustworthy and up to date.
          </p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">A note on this demo</h2>
          <p className="mt-2 text-base leading-relaxed">
            This site is a demonstration project. Property listings are sample
            data, agent details are fictional, and no real transactions take
            place. Please don&apos;t enter real financial information into the
            calculators.             If you&apos;d like to learn how the platform was built,
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
      </main>
      <SiteFooter />
    </div>
  );
}
