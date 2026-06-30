"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NewLocationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", postcode: "", region: "", type: "city" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Location created");
      router.push("/admin/locations");
    } catch {
      toast.error("Failed to create");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Location</h1>
        <p className="text-sm text-slate-500">Add a new city or area for search autocomplete.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="space-y-2">
          <Label>Name *</Label>
          <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. London" />
        </div>
        <div className="space-y-2">
          <Label>Postcode *</Label>
          <Input required value={form.postcode} onChange={(e) => setForm({ ...form, postcode: e.target.value })} placeholder="EC1A 1BB" />
        </div>
        <div className="space-y-2">
          <Label>Region</Label>
          <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="e.g. Greater London" />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
            <option value="city">City</option>
            <option value="area">Area</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
