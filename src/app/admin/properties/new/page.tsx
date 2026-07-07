"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/image-upload";

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<Array<{ url: string; sortOrder: number }>>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    listingType: "sale",
    propertyType: "house",
    bedrooms: "1",
    bathrooms: "1",
    receptionRooms: "1",
    address: "",
    postcode: "",
    city: "",
    status: "draft",
    features: "",
    isNewBuild: false,
    hasGarden: false,
    hasParking: false,
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, images: images.map((i) => ({ url: i.url, sortOrder: i.sortOrder })), features: form.features ? form.features.split(",").map((f: string) => f.trim()) : [] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Property created");
      router.push("/admin/properties");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Property</h1>
        <p className="text-sm text-slate-500">Create a new property listing.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
        <div className="space-y-2">
          <Label>Title *</Label>
          <Input required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Modern 2-bed flat in City Centre" />
        </div>

        <div className="space-y-2">
          <Label>Description *</Label>
          <textarea
            required
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Describe the property…"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Price (£) *</Label>
            <Input required type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="250000" />
          </div>
          <div className="space-y-2">
            <Label>Listing Type *</Label>
            <select
              value={form.listingType}
              onChange={(e) => set("listingType", e.target.value)}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="sale">For Sale</option>
              <option value="rent">To Rent</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Bedrooms *</Label>
            <Input required type="number" min="0" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Bathrooms *</Label>
            <Input required type="number" min="0" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Reception Rooms</Label>
            <Input type="number" min="0" value={form.receptionRooms} onChange={(e) => set("receptionRooms", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Property Type *</Label>
            <select
              value={form.propertyType}
              onChange={(e) => set("propertyType", e.target.value)}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="house">House</option>
              <option value="flat">Flat</option>
              <option value="bungalow">Bungalow</option>
              <option value="maisonette">Maisonette</option>
              <option value="cottage">Cottage</option>
              <option value="land">Land</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="let">Let</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Address *</Label>
            <Input required value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="123 Street Name" />
          </div>
          <div className="space-y-2">
            <Label>Postcode *</Label>
            <Input required value={form.postcode} onChange={(e) => set("postcode", e.target.value)} placeholder="EC1A 1BB" />
          </div>
          <div className="space-y-2">
            <Label>City *</Label>
            <Input required value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="London" />
          </div>
        </div>

        <ImageUpload images={images} onChange={setImages} />

        <div className="space-y-2">
          <Label>Features (comma-separated)</Label>
          <Input value={form.features} onChange={(e) => set("features", e.target.value)} placeholder="Garden, Parking, Central heating" />
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isNewBuild} onChange={(e) => set("isNewBuild", e.target.checked)} className="rounded border-slate-300" />
            New build
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.hasGarden} onChange={(e) => set("hasGarden", e.target.checked)} className="rounded border-slate-300" />
            Garden
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.hasParking} onChange={(e) => set("hasParking", e.target.checked)} className="rounded border-slate-300" />
            Parking
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Property
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
