"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Check,
  ImagePlus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PROPERTY_TYPES = [
  { value: "house", label: "House" },
  { value: "flat", label: "Flat / Apartment" },
  { value: "bungalow", label: "Bungalow" },
  { value: "maisonette", label: "Maisonette" },
  { value: "cottage", label: "Cottage" },
  { value: "land", label: "Land" },
  { value: "other", label: "Other" },
];

const FEATURE_OPTIONS = [
  "Garden", "Parking", "Garage", "Central heating", "Double glazing",
  "Fireplace", "Balcony", "Conservatory", "En-suite", "Walk-in wardrobe",
  "Fitted kitchen", "White goods included", "Furnished", "Pet friendly",
  "DSS welcome", "Student friendly",
];

const SAMPLE_IMAGE_URLS = [
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200",
  "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=1200",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200",
];

interface FormState {
  listingType: "sale" | "rent";
  propertyType: string;
  price: string;
  title: string;
  description: string;
  bedrooms: string;
  bathrooms: string;
  receptionRooms: string;
  address: string;
  postcode: string;
  city: string;
  epcRating: string;
  features: string[];
  isNewBuild: boolean;
  hasGarden: boolean;
  hasParking: boolean;
  images: { url: string; sortOrder: number }[];
  status: "draft" | "active";
}

const STEPS = ["Type & Price", "Details", "Location", "Features", "Photos"] as const;

export function ListingForm({ initialData }: {
  initialData?: Partial<FormState> & { id?: string };
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState("");

  const [form, setForm] = useState<FormState>({
    listingType: "sale",
    propertyType: "house",
    price: "",
    title: "",
    description: "",
    bedrooms: "2",
    bathrooms: "1",
    receptionRooms: "1",
    address: "",
    postcode: "",
    city: "",
    epcRating: "",
    features: [],
    isNewBuild: false,
    hasGarden: false,
    hasParking: false,
    images: [],
    status: "draft",
    ...initialData,
  });

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleFeature(f: string) {
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(f)
        ? prev.features.filter((x) => x !== f)
        : [...prev.features, f],
    }));
  }

  function addImageUrl() {
    const urls = imageUrls
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean);
    if (urls.length === 0) return;
    update("images", [
      ...form.images,
      ...urls.map((url, i) => ({
        url,
        sortOrder: form.images.length + i,
      })),
    ]);
    setImageUrls("");
  }

  function addSampleImage() {
    const sample = SAMPLE_IMAGE_URLS[Math.floor(Math.random() * SAMPLE_IMAGE_URLS.length)];
    update("images", [...form.images, { url: sample, sortOrder: form.images.length }]);
  }

  function removeImage(idx: number) {
    update(
      "images",
      form.images.filter((_, i) => i !== idx).map((img, i) => ({ ...img, sortOrder: i })),
    );
  }

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
  }
  function prev() {
    if (step > 0) setStep(step - 1);
  }

  async function submit(status: "draft" | "active") {
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        bedrooms: Number(form.bedrooms) || 1,
        bathrooms: Number(form.bathrooms) || 1,
        receptionRooms: Number(form.receptionRooms) || 1,
        status,
        latitude: undefined,
        longitude: undefined,
      };

      const isEdit = Boolean(initialData?.id);
      const url = isEdit
        ? `/api/properties/${initialData!.id}`
        : "/api/properties";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to save listing");
        return;
      }

      // Save images (only on create — for edit, we manage via separate UI)
      if (!isEdit && form.images.length > 0) {
        await fetch(`/api/properties/${data.property.id}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ images: form.images }),
        });
      }

      toast.success(isEdit ? "Listing updated" : "Listing created");
      router.push("/agent");
      router.refresh();
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                i < step && "bg-primary text-primary-foreground",
                i === step && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                i > step && "bg-slate-100 text-slate-500",
              )}
            >
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span className={cn(
              "whitespace-nowrap text-xs font-medium",
              i === step ? "text-slate-900" : "text-slate-500",
            )}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="h-px w-6 bg-slate-200" />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{STEPS[step]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label>Listing type</Label>
                <RadioGroup
                  value={form.listingType}
                  onValueChange={(v) => update("listingType", v as "sale" | "rent")}
                  className="grid grid-cols-2 gap-3"
                >
                  <label className={cn("flex cursor-pointer items-center gap-2 rounded-lg border-2 p-3", form.listingType === "sale" ? "border-primary bg-accent" : "border-slate-200")}>
                    <RadioGroupItem value="sale" id="lt-sale" />
                    <span className="text-sm font-medium">For sale</span>
                  </label>
                  <label className={cn("flex cursor-pointer items-center gap-2 rounded-lg border-2 p-3", form.listingType === "rent" ? "border-primary bg-accent" : "border-slate-200")}>
                    <RadioGroupItem value="rent" id="lt-rent" />
                    <span className="text-sm font-medium">To rent</span>
                  </label>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyType">Property type</Label>
                <Select value={form.propertyType} onValueChange={(v) => update("propertyType", v)}>
                  <SelectTrigger id="propertyType"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">
                  Price (£) {form.listingType === "rent" && <span className="text-slate-400">(per month)</span>}
                </Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  step={50}
                  required
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  placeholder={form.listingType === "rent" ? "1250" : "350000"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Listing title</Label>
                <Input
                  id="title"
                  required
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="e.g. Modern 2-bed apartment with city views"
                />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input id="bedrooms" type="number" min={0} value={form.bedrooms} onChange={(e) => update("bedrooms", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input id="bathrooms" type="number" min={0} value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receptionRooms">Reception rooms</Label>
                  <Input id="receptionRooms" type="number" min={0} value={form.receptionRooms} onChange={(e) => update("receptionRooms", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={6}
                  required
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Describe the property — layout, condition, location highlights, nearby transport…"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="epcRating">EPC rating</Label>
                <Select value={form.epcRating} onValueChange={(v) => update("epcRating", v)}>
                  <SelectTrigger id="epcRating"><SelectValue placeholder="Select rating" /></SelectTrigger>
                  <SelectContent>
                    {["A", "B", "C", "D", "E", "F", "G"].map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={form.isNewBuild} onCheckedChange={(v) => update("isNewBuild", v === true)} />
                  New build
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={form.hasGarden} onCheckedChange={(v) => update("hasGarden", v === true)} />
                  Garden
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={form.hasParking} onCheckedChange={(v) => update("hasParking", v === true)} />
                  Parking
                </label>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" required value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="123 High Street" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City / Town</Label>
                  <Input id="city" required value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Manchester" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input id="postcode" required value={form.postcode} onChange={(e) => update("postcode", e.target.value)} placeholder="M1 2AB" />
                </div>
              </div>
              <p className="rounded-md bg-slate-50 p-3 text-xs text-slate-500">
                Tip: latitude / longitude are auto-geocoded on save in
                production. For this demo, the map will centre on the city centre.
              </p>
            </>
          )}

          {step === 3 && (
            <>
              <Label>Features</Label>
              <p className="text-sm text-slate-500">Select all that apply.</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {FEATURE_OPTIONS.map((f) => (
                  <label key={f} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form.features.includes(f)}
                      onCheckedChange={() => toggleFeature(f)}
                    />
                    <span>{f}</span>
                  </label>
                ))}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <Label>Photos</Label>
              <p className="text-sm text-slate-500">
                In production, drag-and-drop uploads to Cloudinary. For this demo
                you can paste public image URLs (one per line, or comma-separated),
                or use the “Add sample photo” button.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={imageUrls}
                  onChange={(e) => setImageUrls(e.target.value)}
                  placeholder="https://images.unsplash.com/…, https://…"
                />
                <Button type="button" variant="outline" onClick={addImageUrl}>Add URL(s)</Button>
                <Button type="button" variant="ghost" onClick={addSampleImage}>
                  <ImagePlus className="mr-1 h-4 w-4" /> Sample
                </Button>
              </div>
              {form.images.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
                  No photos added yet. The first photo becomes the listing’s cover image.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-md border border-slate-200">
                      { }
                      <img src={img.url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                        aria-label="Remove photo"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Footer nav */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={prev} disabled={step === 0}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => submit("draft")}
          >
            {loading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            Save as draft
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next}>
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={() => submit("active")} disabled={loading}>
              {loading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Publish listing
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
