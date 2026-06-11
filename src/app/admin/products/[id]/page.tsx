import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminProductEditPage({ params }: Props) {
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  return (
    <div className="container mx-auto px-4 py-12 text-white">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Edit Product Node</h1>
          <p className="text-white/60 mt-1">Modify inventory SKU data parameters for Item ID: <span className="font-mono text-red-400 font-bold">{productId}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
              Cancel
            </Button>
          </Link>
          <Button className="bg-red-500 hover:bg-red-600 text-white">
            Save Changes
          </Button>
        </div>
      </div>

      {/* Editing Form Wireframe Layout */}
      <div className="glass-card luxury-border rounded p-8 bg-white/[0.01] max-w-2xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase font-mono text-white/40 tracking-wider">Product Name</label>
          <div className="p-3 rounded bg-white/5 border border-white/10 text-white/80 text-sm">Sneaker Model Title Core</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase font-mono text-white/40 tracking-wider">Selling Price (INR)</label>
            <div className="p-3 rounded bg-white/5 border border-white/10 text-white/80 text-sm">₹18,500</div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase font-mono text-white/40 tracking-wider">Maximum Retail Price</label>
            <div className="p-3 rounded bg-white/5 border border-white/10 text-white/80 text-sm">₹22,000</div>
          </div>
        </div>
      </div>
    </div>
  );
}
