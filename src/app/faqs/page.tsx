import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Is Estateably free to use?",
    a: "Yes — searching properties, saving favourites, and contacting agents is completely free for buyers and renters. Agents and landlords can also list properties for free during our demo period.",
  },
  {
    q: "How do I save a property?",
    a: "Click the heart icon on any property card or property details page. Saved properties appear in your dashboard under 'Saved properties'. You'll need to be logged in to save.",
  },
  {
    q: "How do email alerts work?",
    a: "Run any search on the /search page, then click 'Save search' and tick 'Email me when new properties match'. When a new listing matches your criteria, we'll send you an email.",
  },
  {
    q: "Can I compare properties side by side?",
    a: "Yes — click the compare icon (two arrows) on any property card to add it to your compare list. You can compare up to 4 properties at once on the /compare page.",
  },
  {
    q: "How accurate are the mortgage and stamp duty calculators?",
    a: "The calculators provide illustrative estimates only based on current England & Northern Ireland rates. Your actual payments will depend on your lender, credit score, product fees, and personal circumstances. Always consult a qualified mortgage advisor.",
  },
  {
    q: "I'm an agent — how do I list a property?",
    a: "Sign up for an agent account, then visit your agent dashboard at /agent. Click 'Add listing' and complete the multi-step form. You can save a draft and come back later, or publish straight away.",
  },
  {
    q: "How do I contact an agent about a property?",
    a: "On any property details page, use the 'Contact agent' form on the right sidebar. You can also request a viewing using the form further down the page.",
  },
  {
    q: "Is this a real estate service?",
    a: "No — Estateably is a demonstration project. All property listings are sample data, agents are fictional, and no real transactions take place. Please don't enter real financial information.",
  },
  {
    q: "What areas of the UK does Estateably cover?",
    a: "Our sample data includes properties across England, Scotland, Wales and Northern Ireland. The platform is designed to work UK-wide.",
  },
  {
    q: "How do I leave a review for an agent?",
    a: "Visit any property details page — the agent's reviews section appears in the right sidebar. Log in, choose a star rating, and optionally add a comment. You can leave one review per agent.",
  },
];

export default async function FaqsPage() {
  const user = await getCurrentUser();
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader user={user ? { name: user.name, role: user.role } : null} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Frequently asked questions</h1>
        <p className="mt-2 text-sm text-slate-600">
          Everything you need to know about using Estateably.
        </p>

        <div className="mt-8">
          <Accordion type="single" collapsible className="rounded-xl border border-slate-200 bg-white px-4">
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b border-slate-100 last:border-0">
                <AccordionTrigger className="text-left text-sm font-medium text-slate-900 hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-slate-600">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
