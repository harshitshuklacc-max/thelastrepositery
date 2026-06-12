import Link from "next/link";
import { PosSystem } from "@/components/admin/pos-system";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function AdminPOSPage() {
  return (
    <div className="container mx-auto px-4 py-12 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Point of Sale (POS)</h1>
          <p className="text-white/60 mt-1">
            Scan barcodes, complete sales, and print real receipts from your store inventory.
          </p>
        </div>
        <Link href="/admin">
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
            Dashboard
          </Button>
        </Link>
      </div>

      <PosSystem />
    </div>
  );
}
