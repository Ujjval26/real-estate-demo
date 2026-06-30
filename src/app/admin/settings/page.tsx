"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Settings {
  siteName?: string;
  supportEmail?: string;
  supportPhone?: string;
  featuredPropertyIds?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>({});

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) router.push("/admin/login");
        else setSettings(d);
      })
      .catch(() => router.push("/admin/login"))
      .finally(() => setLoading(false));
  }, [router]);

  function set<K extends keyof Settings>(key: K, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName: settings.siteName || "",
          supportEmail: settings.supportEmail || "",
          supportPhone: settings.supportPhone || "",
          featuredPropertyIds: settings.featuredPropertyIds || "",
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Manage platform settings.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="space-y-2">
          <Label>Site name</Label>
          <Input value={settings.siteName || ""} onChange={(e) => set("siteName", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Support email</Label>
          <Input type="email" value={settings.supportEmail || ""} onChange={(e) => set("supportEmail", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Support phone</Label>
          <Input value={settings.supportPhone || ""} onChange={(e) => set("supportPhone", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Featured property IDs (comma-separated)</Label>
          <Input value={settings.featuredPropertyIds || ""} onChange={(e) => set("featuredPropertyIds", e.target.value)} />
        </div>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </form>
    </div>
  );
}
