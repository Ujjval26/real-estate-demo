import { redirect } from "next/navigation";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ListingForm } from "@/components/listing-form";
import { Button } from "@/components/ui/button";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/agent/${id}`);
  if (user.role !== "agent" && user.role !== "admin") redirect("/");

  const property = await db.property.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!property) notFound();
  if (property.agentId !== user.id && user.role !== "admin") {
    redirect("/agent");
  }

  const initialData = {
    id: property.id,
    listingType: property.listingType as "sale" | "rent",
    propertyType: property.propertyType,
    price: String(property.price),
    title: property.title,
    description: property.description,
    bedrooms: String(property.bedrooms),
    bathrooms: String(property.bathrooms),
    receptionRooms: String(property.receptionRooms),
    address: property.address,
    postcode: property.postcode,
    city: property.city,
    epcRating: property.epcRating ?? "",
    features: JSON.parse(property.features || "[]") as string[],
    isNewBuild: property.isNewBuild,
    hasGarden: property.hasGarden,
    hasParking: property.hasParking,
    images: property.images.map((img, i) => ({
      url: img.imageUrl,
      sortOrder: img.sortOrder ?? i,
    })),
    status: property.status as "draft" | "active",
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader user={{ name: user.name, role: user.role }} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/agent"><ArrowLeft className="mr-1 h-4 w-4" /> Back to dashboard</Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit listing</h1>
        <p className="mt-1 text-sm text-slate-600">
          Update your listing details. Changes take effect immediately.
        </p>
        <div className="mt-6">
          <ListingForm initialData={initialData} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
