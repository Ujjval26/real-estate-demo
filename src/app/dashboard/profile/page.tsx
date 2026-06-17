import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "./profile-form";
import { Badge } from "@/components/ui/badge";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/profile");

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader user={{ name: user.name, role: user.role }} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Profile settings</h1>
        <p className="mt-1 text-sm text-slate-600">
          Update your personal information.
        </p>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>Account details</span>
              <Badge variant="outline" className="capitalize">{user.role}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm
              user={{
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone ?? "",
              }}
            />
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
