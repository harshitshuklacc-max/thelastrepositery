import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminImportPage() {
  return (
    <div className="container mx-auto px-4 py-12 text-white">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Bulk Catalog Import</h1>
          <p className="text-white/60 mt-1">Upload inventory tables, CSV drop lists, and database catalogs.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/barcodes">
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
              Barcodes
            </Button>
          </Link>
          <Button className="bg-red-500 hover:bg-red-600 text-white">
            Upload CSV
          </Button>
        </div>
      </div>

      {/* Upload Interface Container */}
      <div className="glass-card luxury-border rounded p-8 bg-white/[0.01] text-center max-w-2xl mx-auto border border-dashed border-white/10 py-16">
        <div className="mx-auto w-12 h-12 rounded bg-white/5 flex items-center justify-center mb-4">
          <span className="text-red-400 text-xl font-bold">+</span>
        </div>
        <h3 className="text-lg font-bold mb-1">Drag and drop your manifest here</h3>
        <p className="text-sm text-white/40 max-w-sm mx-auto mb-6">
          Supports .csv or .json files containing product SKU, mrp data structures, and inventory tallies.
        </p>
        <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white px-6">
          Browse Files
        </Button>
      </div>
    </div>
  );
}
