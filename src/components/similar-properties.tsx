import Link from "next/link";
import { db } from "@/lib/db";
import { PropertyCard } from "@/components/property-card";

interface SimilarPropertiesProps {
  property: {
    id: string;
    city: string;
    listingType: string;
    propertyType: string;
    price: number;
    bedrooms: number;
  };
}

export async function SimilarProperties({ property }: SimilarPropertiesProps) {
  const similar = await db.property.findMany({
    where: {
      id: { not: property.id },
      status: "active",
      listingType: property.listingType,
      OR: [
        { city: { contains: property.city } },
        { propertyType: property.propertyType },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  if (similar.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Similar properties
        </h2>
        <Link
          href={`/search?city=${encodeURIComponent(property.city)}&listingType=${property.listingType}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          See all in {property.city}
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {similar.map((p) => (
          <PropertyCard
            key={p.id}
            property={{
              id: p.id,
              slug: p.slug,
              title: p.title,
              price: p.price,
              listingType: p.listingType,
              propertyType: p.propertyType,
              bedrooms: p.bedrooms,
              bathrooms: p.bathrooms,
              city: p.city,
              postcode: p.postcode,
              status: p.status,
              images: p.images.map((img) => ({ imageUrl: img.imageUrl })),
            }}
          />
        ))}
      </div>
    </section>
  );
}
