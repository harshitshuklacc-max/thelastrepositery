import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getHomepageData } from "@/services/homepage";

export const dynamic = "force-dynamic";

interface ProductRowProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  stockStatus: string;
  brand: string;
}

function AdminProductRow({ id, name, slug, price, stockStatus, brand }: ProductRowProps) {
  return (
    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm bg-white/[0.005]">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white text-base">{name}</span>
          <span className="text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/40 uppercase font-mono">
            {brand}
          </span>
        </div>
        <div className="text-xs text-white/40 mt-1">Slug: /shop/{slug}</div>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
        <span className="font-mono text-white/80">₹{price}</span>
        <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {stockStatus}
        </span>
        <Link href={`/admin/products/${id}`}>
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 text-xs py-1 h-8">
            Edit
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default async function AdminProductsListPage() {
  const data = await getHomepageData();
  
  // Collect data points from service layers
  const rawProducts = [
    ...(data.featuredProducts || []),
    ...(data.newArrivals || []),
    ...(data.trendingProducts || []),
    ...(data.bestSellers || []),
  ];

  // De-duplicate array items by primary database keys
  const products = rawProducts.filter(
    (product, index, self) => self.findIndex((p) => p.id === product.id) === index
  );

  return (
    <div className="container mx-auto px-4 py-12 text-white">
      {/* Top Banner Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Products Catalog</h1>
          <p className="text-white/60 mt-1">Review live store sneaker drops, adjust item parameters, and view inventories.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/products/new">
            <Button className="bg-red-500 hover:bg-red-600 text-white">
              Add New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Items Inventory Container Table */}
      <div className="glass-card luxury-border rounded bg-white/[0.01]">
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <h2 className="text-lg font-bold">Total Catalog Items ({products.length})</h2>
          <span className="text-xs text-white/40 uppercase font-mono tracking-wider">Synchronized</span>
        </div>
        
        {products.length === 0 ? (
          <div className="p-8 text-center text-white/40 text-sm">
            No live catalog products detected in your database engine. Click Add New Product to get started.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {products.map((p) => (
              <AdminProductRow
                key={p.id}
                id={p.id}
                name={p.name}
                slug={p.slug}
                price={p.sellingPrice ? Number(p.sellingPrice) : 0}
                brand={p.brand?.name || "General"}
                stockStatus="Active"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
