import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ListingForm } from "@/components/listing-form";
import { Button } from "@/components/ui/button";

export default async function NewListingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/agent/new");
  if (user.role !== "agent" && user.role !== "admin") redirect("/");

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader user={{ name: user.name, role: user.role }} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/agent"><ArrowLeft className="mr-1 h-4 w-4" /> Back to dashboard</Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add a new listing</h1>
        <p className="mt-1 text-sm text-slate-600">
          Fill in the details below. You can save a draft and come back later, or publish straight away.
        </p>
        <div className="mt-6">
          <ListingForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
