import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/home/hero-section";
import { AdminPortalSection } from "@/components/home/admin-portal-section";
import { ProductCard } from "@/components/products/product-card";
import { getHomepageData } from "@/services/homepage";

export const dynamic = "force-dynamic";

interface ProductProps {
  id: string;
  name: string;
  slug: string;
  sellingPrice: any;
  mrp: any;
  discount: any;
  images?: any;
  brand?: any;
  isNewArrival?: boolean;
  isTrending?: boolean;
}

interface ReviewProps {
  id: string;
  comment?: string | null;
  customer?: {
    firstName?: string;
  } | null;
}

function ProductSection({
  title,
  subtitle,
  products,
  filter,
}: {
  title: string;
  subtitle: string;
  products: ProductProps[];
  filter?: string;
}) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
              {title}
            </h2>
            <p className="text-white/60">{subtitle}</p>
          </div>
          {filter && (
            <Link href={`/shop?filter=${filter}`}>
              <Button variant="ghost" className="gap-1 text-red-400 hover:text-red-300">
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => {
            const imgUrl = product.images && typeof product.images === "object" && !Array.isArray(product.images)
              ? (product.images.url || "")
              : (Array.isArray(product.images) && product.images.length > 0 ? product.images[0]?.url : "");

            return (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                sellingPrice={product.sellingPrice && typeof product.sellingPrice.toNumber === "function" ? product.sellingPrice.toNumber() : Number(product.sellingPrice || 0)}
                mrp={product.mrp && typeof product.mrp.toNumber === "function" ? product.mrp.toNumber() : Number(product.mrp || 0)}
                discount={product.discount && typeof product.discount.toNumber === "function" ? product.discount.toNumber() : Number(product.discount || 0)}
                image={imgUrl || ""}
                brand={product.brand?.name}
                isNew={product.isNewArrival}
                isTrending={product.isTrending}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const data = await getHomepageData();

  return (
    <>
      <HeroSection banners={data.heroBanners} />

      <ProductSection
        title="Featured Collection"
        subtitle="Handpicked premium footwear"
        products={data.featuredProducts as any[] || []}
        filter="featured"
      />

      <ProductSection
        title="New Arrivals"
        subtitle="Latest additions to our collection"
        products={data.newArrivals as any[] || []}
        filter="new"
      />

      <ProductSection
        title="Trending Now"
        subtitle="What everyone is wearing"
        products={data.trendingProducts as any[] || []}
        filter="trending"
      />

      {data.categories && data.categories.length > 0 && (
        <section className="py-16 bg-white/[0.02]">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-8 text-center">
              Shop by Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="glass-card p-6 text-center luxury-border group"
                >
                  <h3 className="font-semibold text-white group-hover:text-red-400 transition-colors">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-sm text-white/50 mt-2">{cat.description}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProductSection
        title="Best Sellers"
        subtitle="Our most loved shoes"
        products={data.bestSellers as any[] || []}
        filter="bestseller"
      />

      {data.brands && data.brands.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-8 text-center">
              Our Brands
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              {data.brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/shop?brand=${brand.slug}`}
                  className="glass-card px-8 py-4 luxury-border hover:border-red-500/50 transition-all"
                >
                  <span className="font-semibold text-white">{brand.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {data.reviews && data.reviews.length > 0 && (
        <section className="py-16 bg-white/[0.02]">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-8 text-center">
              Customer Reviews
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.reviews.map((review: any) => (
                <div key={review.id} className="glass-card p-6 luxury-border">
                  <p className="text-white/80 italic mb-4">&ldquo;{review.comment || "Great product!"}&rdquo;</p>
                  <p className="text-sm font-semibold text-red-400">
                    - {review.customer?.firstName || "Anonymous"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <AdminPortalSection />
    </>
  );
}
