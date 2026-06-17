import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserActions } from "./user-actions";
import { ArrowLeft, Users as UsersIcon } from "lucide-react";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/users");
  if (user.role !== "admin") redirect("/");

  const { q, role } = await searchParams;

   
  const where: any = {};
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { email: { contains: q } },
    ];
  }
  if (role && ["buyer", "agent", "admin"].includes(role)) {
    where.role = role;
  }

  const users = await db.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true, name: true, email: true, role: true, phone: true,
      emailVerified: true, createdAt: true,
      _count: {
        select: {
          properties: true,
          favourites: true,
          messagesSent: true,
          reviewsGiven: true,
        },
      },
    },
  });

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader user={{ name: user.name, role: user.role }} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/admin"><ArrowLeft className="mr-1 h-4 w-4" /> Back to admin</Link>
        </Button>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
          <UsersIcon className="h-6 w-6 text-primary" /> Manage users
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {users.length} user{users.length === 1 ? "" : "s"} found.
        </p>

        {/* Filter form */}
        <form className="mt-4 flex flex-wrap gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q || ""}
            placeholder="Search by name or email…"
            className="flex-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm"
          />
          <select
            name="role"
            defaultValue={role || ""}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm"
          >
            <option value="">All roles</option>
            <option value="buyer">Buyers</option>
            <option value="agent">Agents</option>
            <option value="admin">Admins</option>
          </select>
          <Button type="submit" size="sm">Filter</Button>
        </form>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Users</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {users.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-500">No users match your filters.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="hidden px-4 py-3 md:table-cell">Phone</th>
                      <th className="hidden px-4 py-3 sm:table-cell">Listings</th>
                      <th className="hidden px-4 py-3 sm:table-cell">Joined</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                          {!u.emailVerified && (
                            <Badge variant="outline" className="mt-0.5 text-[10px]">Unverified</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={
                            u.role === "admin" ? "default" :
                            u.role === "agent" ? "secondary" :
                            "outline"
                          } className="capitalize">{u.role}</Badge>
                        </td>
                        <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{u.phone || "—"}</td>
                        <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">{u._count.properties}</td>
                        <td className="hidden px-4 py-3 text-xs text-slate-500 sm:table-cell">
                          {new Date(u.createdAt).toLocaleDateString("en-GB")}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <UserActions userId={u.id} userName={u.name} currentRole={u.role} isSelf={u.id === user.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
