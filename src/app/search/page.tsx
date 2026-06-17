import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SearchClient } from "@/components/search-client";
import { getCurrentUser } from "@/lib/auth";

export default async function SearchPage() {
  const user = await getCurrentUser();
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader user={user ? { name: user.name, role: user.role } : null} />
      <main className="flex-1">
        <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading search…</div>}>
          <SearchClient />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
