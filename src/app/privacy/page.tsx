import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default async function PrivacyPage() {
  const user = await getCurrentUser();
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader user={user ? { name: user.name, role: user.role } : null} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Privacy policy</h1>
        <p className="mt-2 text-sm text-slate-600">Last updated: June 2026</p>

        <div className="prose prose-slate mt-8 max-w-none text-slate-700">
          <h2 className="text-xl font-bold text-slate-900">1. Who we are</h2>
          <p className="mt-2 text-base leading-relaxed">
            Estateably (&ldquo;we&rdquo;, &ldquo;us&rdquo;) operates the
            Estateably website (the &ldquo;Service&rdquo;). This policy explains
            what personal data we collect, why we collect it, and the choices you
            have over your data. We are committed to complying with the UK
            General Data Protection Regulation (UK GDPR) and the Data Protection
            Act 2018.
          </p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">2. Data we collect</h2>
          <p className="mt-2 text-base leading-relaxed">We collect the following categories of personal data:</p>
          <ul className="mt-2 space-y-1 text-base leading-relaxed">
            <li><strong>Account data</strong> — your name, email address, phone number, and account role (buyer / agent / admin).</li>
            <li><strong>Authentication data</strong> — a hashed password (bcrypt) and a signed JWT session token stored in an httpOnly cookie.</li>
            <li><strong>Listing data</strong> — if you are an agent or landlord, the property details and images you submit.</li>
            <li><strong>Activity data</strong> — properties you save, searches you save, messages you send, and viewing requests you make.</li>
            <li><strong>Usage data</strong> — anonymised analytics about how you use the Service (pages viewed, features used).</li>
          </ul>

          <h2 className="mt-8 text-xl font-bold text-slate-900">3. Why we use your data</h2>
          <p className="mt-2 text-base leading-relaxed">We use your personal data to:</p>
          <ul className="mt-2 space-y-1 text-base leading-relaxed">
            <li>Operate your account and authenticate your sessions.</li>
            <li>Display your saved properties, searches, and messages in your dashboard.</li>
            <li>Send you email alerts when new properties match your saved searches (only if you opt in).</li>
            <li>Allow agents to manage their listings and respond to enquiries.</li>
            <li>Moderate content and prevent abuse of the Service.</li>
            <li>Improve the Service through anonymised analytics.</li>
          </ul>

          <h2 className="mt-8 text-xl font-bold text-slate-900">4. Legal basis</h2>
          <p className="mt-2 text-base leading-relaxed">
            We process your personal data on the legal bases of (a) performance
            of a contract (operating your account and providing the Service you
            signed up for), (b) our legitimate interests in operating and
            improving the Service, and (c) your consent where you opt in to
            features such as email alerts.
          </p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">5. Data sharing</h2>
          <p className="mt-2 text-base leading-relaxed">
            We do not sell your personal data. We share data only with the
            following categories of recipients: cloud infrastructure providers
            (database hosting, image hosting, email delivery) who process data
            on our behalf under written agreements; other users of the Service
            (e.g. your messages and viewing requests are visible to the relevant
            agent); and competent authorities where we are legally required to
            disclose data.
          </p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">6. Data retention</h2>
          <p className="mt-2 text-base leading-relaxed">
            We retain your personal data for as long as your account is active.
            If you delete your account, we will remove or anonymise your
            personal data within 30 days, except where we are required to retain
            it for legal reasons.
          </p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">7. Your rights</h2>
          <p className="mt-2 text-base leading-relaxed">Under UK GDPR you have the right to:</p>
          <ul className="mt-2 space-y-1 text-base leading-relaxed">
            <li>Access the personal data we hold about you.</li>
            <li>Correct inaccurate or incomplete data.</li>
            <li>Request deletion of your personal data.</li>
            <li>Object to or restrict certain processing.</li>
            <li>Receive a copy of your data in a portable format.</li>
            <li>Withdraw consent at any time (where processing is based on consent).</li>
          </ul>
          <p className="mt-2 text-base leading-relaxed">
            To exercise any of these rights, email privacy@estateably.example.
          </p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">8. Security</h2>
          <p className="mt-2 text-base leading-relaxed">
            We take security seriously. Passwords are hashed with bcrypt, session
            tokens are stored in httpOnly cookies, and database access is
            restricted. However, no method of transmission over the internet is
            100% secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">9. Changes to this policy</h2>
          <p className="mt-2 text-base leading-relaxed">
            We may update this policy from time to time. The &ldquo;last
            updated&rdquo; date at the top reflects the most recent revision.
            Material changes will be communicated via email or in-app notice.
          </p>

          <h2 className="mt-8 text-xl font-bold text-slate-900">10. Contact</h2>
          <p className="mt-2 text-base leading-relaxed">
            Questions about this policy? Email privacy@estateably.example.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
