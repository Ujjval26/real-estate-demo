import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default async function TermsPage() {
  const user = await getCurrentUser();
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader user={user ? { name: user.name, role: user.role } : null} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Terms &amp; conditions</h1>
        <p className="mt-2 text-sm text-slate-600">Last updated: June 2026</p>

        <div className="prose prose-slate mt-8 max-w-none text-slate-700">
          <h2 className="text-xl font-bold text-slate-900">1. Introduction</h2>
          <p className="mt-2 text-base leading-relaxed">
            These terms govern your use of the Estateably website (the
            &ldquo;Service&rdquo;). By accessing or using the Service, you agree
            to be bound by these terms. If you do not agree, please do not use
            the Service. Estateably is a demonstration project and is not a
            regulated estate agency.
          </p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">2. Your account</h2>
          <p className="mt-2 text-base leading-relaxed">
            You must provide accurate and complete information when creating an
            account. You are responsible for safeguarding your password and for
            any activity conducted under your account. You must be at least 18
            years old to use the Service. We reserve the right to suspend or
            terminate accounts that violate these terms.
          </p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">3. Use of the Service</h2>
          <p className="mt-2 text-base leading-relaxed">
            You agree to use the Service only for lawful purposes. You must not
            post false, misleading, or fraudulent property listings; harass other
            users; attempt to gain unauthorised access to any part of the
            Service; or use automated tools to scrape content without our written
            permission. Agents and landlords are responsible for the accuracy of
            their listings.
          </p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">4. Property listings</h2>
          <p className="mt-2 text-base leading-relaxed">
            Estateably hosts listings submitted by agents and landlords. We do
            not verify the accuracy of listings and make no representation as to
            the availability, condition, or legality of any property. You should
            always conduct your own due diligence before making any property
            decision. We may remove listings that violate our policies.
          </p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">5. Calculators and tools</h2>
          <p className="mt-2 text-base leading-relaxed">
            The mortgage repayment calculator, stamp duty calculator, and any
            other tools on the Service are provided for illustrative purposes
            only. They do not constitute financial advice. You should consult a
            qualified mortgage advisor and conveyancer before making any
            financial decision related to property.
          </p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">6. Intellectual property</h2>
          <p className="mt-2 text-base leading-relaxed">
            The Service&apos;s design, code, and original content are the
            property of Estateably. Property images and listing text remain the
            property of the listing agent or landlord. You may not reproduce,
            distribute, or commercially exploit any part of the Service without
            our written permission.
          </p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">7. Limitation of liability</h2>
          <p className="mt-2 text-base leading-relaxed">
            The Service is provided &ldquo;as is&rdquo; without warranties of
            any kind. To the fullest extent permitted by law, Estateably shall
            not be liable for any indirect, incidental, or consequential damages
            arising from your use of the Service, including but not limited to
            any property transaction entered into as a result of using the
            Service.
          </p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">8. Changes to these terms</h2>
          <p className="mt-2 text-base leading-relaxed">
            We may update these terms from time to time. The &ldquo;last
            updated&rdquo; date at the top of this page reflects the most recent
            revision. Continued use of the Service after changes take effect
            constitutes acceptance of the new terms.
          </p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">9. Contact</h2>
          <p className="mt-2 text-base leading-relaxed">
            Questions about these terms? Email us at hello@estateably.example
            and we&apos;ll get back to you within one business day.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
