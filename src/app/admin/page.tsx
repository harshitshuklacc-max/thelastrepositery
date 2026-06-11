import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface NavBlockProps {
  title: string;
  desc: string;
  href: string;
  label: string;
}

function AdminNavBlock({ title, desc, href, label }: NavBlockProps) {
  return (
    <div className="glass-card p-6 luxury-border rounded bg-white/[0.01] flex flex-col justify-between h-full">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-white/60 text-sm leading-relaxed mb-6">{desc}</p>
      </div>
      <Link href={href}>
        <Button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10">
          {label}
        </Button>
      </Link>
    </div>
  );
}

export default async function AdminMainDashboard() {
  return (
    <div className="container mx-auto px-4 py-12 text-white">
      {/* Top Banner Row */}
      <div className="mb-12">
        <h1 className="font-display text-4xl font-bold tracking-tight">Shoe Mafia Command Center</h1>
        <p className="text-white/60 mt-1">Select an administrative panel node below to manage stock manifests, logs, and billing ledger sheets.</p>
      </div>

      {/* Admin Modules Navigation Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AdminNavBlock 
          title="Performance Analytics" 
          desc="Monitor gross revenues, product checkout performance tallies, and store engagement telemetry." 
          href="/admin/analytics" 
          label="Open Analytics" 
        />
        <AdminNavBlock 
          title="Barcode Tracking" 
          desc="Manage stock-keeping SKUs, track warehouse inventory nodes, and print product barcode labels." 
          href="/admin/barcodes" 
          label="Manage Barcodes" 
        />
        <AdminNavBlock 
          title="Data Stream Import" 
          desc="Bulk upload catalog updates, product sheets, and stock lists via structural CSV manifest parsing." 
          href="/admin/import" 
          label="Launch Importer" 
        />
        <AdminNavBlock 
          title="Invoice Ledger" 
          desc="Track client payouts, review processing transaction historical data, and manage billing entries." 
          href="/admin/invoices" 
          label="View Invoices" 
        />
        <AdminNavBlock 
          title="Order Fulfilment Queue" 
          desc="Monitor processing sneaker shipments, coordinate delivery dispatches, and manage logistics statuses." 
          href="/admin/orders" 
          label="Track Shipments" 
        />
        <AdminNavBlock 
          title="Product Settings" 
          desc="Configure core pricing drops, manage store layout settings, and update live catalog metrics." 
          href="/admin/products" 
          label="Edit Catalog" 
        />
      </div>
    </div>
  );
}
