"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EditLocationPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", postcode: "", region: "", type: "city" });

  useEffect(() => {
    fetch(`/api/admin/locations/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { router.push("/admin/locations"); return; }
        setForm({ name: d.location.name, postcode: d.location.postcode, region: d.location.region, type: d.location.type });
      })
      .catch(() => toast.error("Failed to load location"))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/locations/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Location updated");
      router.push("/admin/locations");
    } catch {
      toast.error("Failed to update");
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
        <h1 className="text-2xl font-bold text-slate-900">Edit Location</h1>
        <p className="text-sm text-slate-500">Update location details.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="space-y-2">
          <Label>Name *</Label>
          <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Postcode *</Label>
          <Input required value={form.postcode} onChange={(e) => setForm({ ...form, postcode: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Region</Label>
          <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
            <option value="city">City</option>
            <option value="area">Area</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/admin/locations")}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
