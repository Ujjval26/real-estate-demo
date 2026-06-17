"use client";

import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
  user: { id: string; name: string; email: string; phone: string };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Could not update profile.");
        return;
      }
      toast.success("Profile updated");
      router.refresh();
    } catch {
      toast.error("Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLogoutLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={user.email} disabled />
          <p className="text-xs text-slate-500">Email cannot be changed.</p>
        </div>
        <div className="space-y-1">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07123 456789"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
          Save changes
        </Button>
      </form>

      <div className="border-t border-slate-100 pt-4">
        <Button variant="outline" onClick={logout} disabled={logoutLoading}>
          {logoutLoading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <LogOut className="mr-1 h-4 w-4" />}
          Log out
        </Button>
      </div>
    </div>
  );
}
