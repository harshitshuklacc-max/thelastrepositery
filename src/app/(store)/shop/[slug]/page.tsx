import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getHomepageData } from "@/services/homepage";

export const dynamic = "force-dynamic";

interface ProductProps {
  id: string;
  name: string;
  slug: string;
  sellingPrice?: any;
  mrp?: any;
  discount?: any;
  images?: any;
  brand?: any;
  isNewArrival?: boolean;
  isTrending?: boolean;
}

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProductDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const data = await getHomepageData();
  const allProducts: any[] = [
    ...(data.featuredProducts || []),
    ...(data.newArrivals || []),
    ...(data.trendingProducts || []),
    ...(data.bestSellers || []),
  ];

  const product = allProducts.find((p: any) => p.slug === slug);

  if (!product) {
    return notFound();
  }

  const imgUrl = product.images && typeof product.images === "object" && !Array.isArray(product.images)
    ? (product.images.url || "")
    : (Array.isArray(product.images) && product.images.length > 0 ? product.images[0]?.url : "");

  return (
    <div className="container mx-auto px-4 py-16 text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-4 luxury-border flex items-center justify-center bg-white/[0.01] relative min-h-[300px]">
          {imgUrl ? (
            <div className="relative w-full h-[400px]">
              <Image 
                src={imgUrl} 
                alt={product.name} 
                fill
                className="object-contain rounded"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-white/40">
              No Image Available
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between">
          <div>
            {product.brand?.name && (
              <span className="text-red-400 font-semibold uppercase tracking-wider text-sm">
                {product.brand.name}
              </span>
            )}
            <h1 className="font-display text-3xl md:text-5xl font-bold mt-2 mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl font-bold text-white">
                ₹{product.sellingPrice && typeof product.sellingPrice.toNumber === "function" ? product.sellingPrice.toNumber() : Number(product.sellingPrice || 0)}
              </span>
              {product.mrp && (
                <span className="text-xl text-white/40 line-through">
                  ₹{product.mrp && typeof product.mrp.toNumber === "function" ? product.mrp.toNumber() : Number(product.mrp || 0)}
                </span>
              )}
            </div>

            <p className="text-white/70 leading-relaxed mb-6">
              Premium premium craftsmanship from our exclusive sneaker drop collections. Built for durability, maximum responsiveness, and luxury comfort alignment.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Button className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-6 text-lg">
              Add To Cart
            </Button>
            <Link href="/shop" className="w-full text-center">
              <Button variant="ghost" className="w-full text-white/60 hover:text-white">
                Back to Shop
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
