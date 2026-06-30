import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";
import { ContactForm } from "./contact-form";

export default async function ContactPage() {
  const user = await getCurrentUser();
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader user={user ? { name: user.name, role: user.role } : null} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Contact us</h1>
        <div className="flex items-center gap-2">
          <p className="text-sm text-slate-600">
            Questions, feedback, or partnership enquiries — we&apos;d love to hear from you.
          </p>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">Demo</span>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Contact info */}
          <div className="space-y-4">
            <Card>
              <CardContent className="flex items-start gap-3 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Email</h3>
                  <p className="text-sm text-slate-600">hello@estateably.example</p>
                  <p className="mt-1 text-xs text-slate-500">We aim to reply within 1 business day.</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-start gap-3 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Phone</h3>
                  <p className="text-sm text-slate-600">020 7946 0000</p>
                  <p className="mt-1 text-xs text-slate-500">Mon–Fri, 9am–5pm GMT.</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-start gap-3 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Office</h3>
                  <p className="text-sm text-slate-600">1 Demo Street</p>
                  <p className="text-sm text-slate-600">London EC1A 1BB</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact form */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-base font-semibold text-slate-900">Send us a message</h3>
              <p className="mt-1 text-xs text-slate-500">Fill in the form and we&apos;ll get back to you.</p>
              <ContactForm defaultName={user?.name || ""} defaultEmail={user?.email || ""} />
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
