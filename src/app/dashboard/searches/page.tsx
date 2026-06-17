import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SavedSearchRow } from "./saved-search-row";
import { Search } from "lucide-react";

export default async function SavedSearchesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/searches");

  const searches = await db.savedSearch.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader user={{ name: user.name, role: user.role }} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Saved searches</h1>
        <p className="mt-1 text-sm text-slate-600">
          Save your favourite search criteria and get email alerts when new properties match.
        </p>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="h-4 w-4 text-primary" /> Your saved searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            {searches.length === 0 ? (
              <div className="rounded-md bg-slate-50 p-8 text-center">
                <Search className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">
                  You haven&apos;t saved any searches yet.
                </p>
                <Link
                  href="/search"
                  className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
                >
                  Search properties →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {searches.map((s) => {
                  const criteria = JSON.parse(s.searchCriteria || "{}");
                  const qs = new URLSearchParams(criteria).toString();
                  return (
                    <SavedSearchRow
                      key={s.id}
                      id={s.id}
                      name={s.name || criteria.q || criteria.city || "Untitled search"}
                      href={`/search?${qs}`}
                      criteria={criteria}
                      emailAlertsEnabled={s.emailAlertsEnabled}
                      createdAt={s.createdAt.toISOString()}
                    />
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
