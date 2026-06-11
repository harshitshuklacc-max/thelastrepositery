import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminNewProductPage() {
  return (
    <div className="container mx-auto px-4 py-12 text-white">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-white/60 mt-1">Insert a new sneaker drop variant record node into the database catalog.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
              Cancel
            </Button>
          </Link>
          <Button className="bg-red-500 hover:bg-red-600 text-white">
            Publish Product
          </Button>
        </div>
      </div>

      {/* Entry Form Container */}
      <div className="glass-card luxury-border rounded p-8 bg-white/[0.01] max-w-2xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase font-mono text-white/40 tracking-wider">Product Title</label>
          <input 
            type="text" 
            placeholder="e.g. Air Jordan 1 Retro High" 
            className="p-3 rounded bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-red-500/50"
            disabled
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase font-mono text-white/40 tracking-wider">Selling Price (INR)</label>
            <input 
              type="text" 
              placeholder="18500" 
              className="p-3 rounded bg-white/5 border border-white/10 text-white text-sm outline-none"
              disabled
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase font-mono text-white/40 tracking-wider">MRP (INR)</label>
            <input 
              type="text" 
              placeholder="22000" 
              className="p-3 rounded bg-white/5 border border-white/10 text-white text-sm outline-none"
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  );
}
