import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const session = await getUserSession();

  if (!session) {
    redirect("/account");
  }

  const customer = await prisma.customer.findUnique({
    where: { userId: session.sub },
    include: {
      wishlists: {
        include: {
          product: {
            include: { brand: true, images: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const wishlistItems = customer?.wishlists ?? [];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
          My <span className="text-red-500">Wishlist</span>
        </h1>
        <Link href="/account">
          <Button variant="ghost" className="text-white/60">
            Back to Account
          </Button>
        </Link>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="glass-card p-12 text-center luxury-border">
          <p className="text-white/60 mb-4">Your wishlist is empty.</p>
          <Link href="/shop">
            <Button variant="luxury">Browse Shop</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {wishlistItems.map(({ product }) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                sellingPrice={
                  typeof product.sellingPrice.toNumber === "function"
                    ? product.sellingPrice.toNumber()
                    : Number(product.sellingPrice)
                }
                mrp={
                  typeof product.mrp.toNumber === "function"
                    ? product.mrp.toNumber()
                    : Number(product.mrp)
                }
                discount={
                  typeof product.discount.toNumber === "function"
                    ? product.discount.toNumber()
                    : Number(product.discount)
                }
                image={product.images[0]?.url ?? ""}
                brand={product.brand?.name}
              />
            ))}
        </div>
      )}
    </div>
  );
}
