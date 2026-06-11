import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";
import { getHomepageData } from "@/services/homepage";

export const dynamic = "force-dynamic";

interface ProductProps {
  id: string;
  name: string;
  slug: string;
  sellingPrice?: number | string;
  mrp?: number | string;
  discount?: number | string;
  images?: { url: string } | null;
  brand?: { name: string } | null;
  isNewArrival?: boolean;
  isTrending?: boolean;
}

type SearchParams = { [key: string]: string | string[] | undefined };

type Props = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<SearchParams>;
};

export default async function ShopPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const filterQuery = resolvedSearchParams.filter as string | undefined;
  const categoryQuery = resolvedSearchParams.category as string | undefined;
  const brandQuery = resolvedSearchParams.brand as string | undefined;

  const data = await getHomepageData();
  
  // Aggregate all unique catalog items cleanly 
  let allProducts: ProductProps[] = [
    ...(data.featuredProducts || []),
    ...(data.newArrivals || []),
    ...(data.trendingProducts || []),
    ...(data.bestSellers || []),
  ];

  // De-duplicate items by their database IDs
  allProducts = allProducts.filter(
    (product, index, self) => self.findIndex((p) => p.id === product.id) === index
  );

  // Apply URL category/brand filter metrics
  if (filterQuery === "featured") allProducts = data.featuredProducts || [];
  else if (filterQuery === "new") allProducts = data.newArrivals || [];
  else if (filterQuery === "trending") allProducts = data.trendingProducts || [];
  else if (filterQuery === "bestseller") allProducts = data.bestSellers || [];

  if (categoryQuery) {
    allProducts = allProducts.filter((p) => p.slug.toLowerCase().includes(categoryQuery.toLowerCase()));
  }
  if (brandQuery) {
    allProducts = allProducts.filter((p) => p.brand?.name.toLowerCase() === brandQuery.toLowerCase());
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-2">
          The Shoe Collection
        </h1>
        <p className="text-white/60">
          Showing {allProducts.length} premium design releases
        </p>
      </div>

      {allProducts.length === 0 ? (
        <div className="text-center py-24 glass-card luxury-border rounded">
          <p className="text-white/50 text-lg mb-4">No sneakers matching your criteria were found.</p>
          <Link href="/shop">
            <Button className="bg-red-500 hover:bg-red-600 text-white">Reset Filters</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {allProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              slug={product.slug}
              sellingPrice={product.sellingPrice ? Number(product.sellingPrice) : 0}
              mrp={product.mrp ? Number(product.mrp) : 0}
              discount={product.discount ? Number(product.discount) : 0}
              image={product.images?.url || ""}
              brand={product.brand?.name}
              isNew={product.isNewArrival}
              isTrending={product.isTrending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
