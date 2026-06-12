import { ScanRestockForm } from "@/components/admin/scan-restock-form";

export const dynamic = "force-dynamic";

export default function AdminRestockPage() {
  return (
    <div className="container mx-auto px-4 py-12 text-white">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold tracking-tight">Scan & Restock</h1>
        <p className="text-white/60 mt-1">
          Scan a product barcode, set the quantity manually, and add it back to catalog stock.
        </p>
      </div>
      <ScanRestockForm />
    </div>
  );
}
