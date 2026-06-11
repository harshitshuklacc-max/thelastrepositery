import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface InvoiceRowProps {
  id: string;
  customer: string;
  date: string;
  amount: string;
  status: "PAID" | "PENDING" | "OVERDUE";
}

function InvoiceRow({ id, customer, date, amount, status }: InvoiceRowProps) {
  const statusColors = {
    PAID: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    OVERDUE: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  return (
    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs text-white/40">{id}</span>
        <span className="font-semibold text-white">{customer}</span>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
        <span className="text-white/50 text-xs">{date}</span>
        <span className={`px-2.5 py-1 rounded text-xs border ${statusColors[status]}`}>
          {status}
        </span>
        <span className="font-semibold text-white min-w-[80px] text-right">{amount}</span>
      </div>
    </div>
  );
}

export default async function AdminInvoicesPage() {
  return (
    <div className="container mx-auto px-4 py-12 text-white">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Invoices</h1>
          <p className="text-white/60 mt-1">Track payouts, transactional histories, and business billing logs.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/import">
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
              Import Panel
            </Button>
          </Link>
          <Button className="bg-red-500 hover:bg-red-600 text-white">
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Invoice Ledger Container */}
      <div className="glass-card luxury-border rounded bg-white/[0.01]">
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <h2 className="text-lg font-bold">Billing Ledger</h2>
          <span className="text-xs text-white/40 uppercase font-mono tracking-wider">Secure Connection</span>
        </div>
        <div className="divide-y divide-white/5">
          <InvoiceRow 
            id="INV-2026-001" 
            customer="Rahul Sharma" 
            date="10 June 2026" 
            amount="₹18,500" 
            status="PAID" 
          />
          <InvoiceRow 
            id="INV-2026-002" 
            customer="Amit Verma" 
            date="11 June 2026" 
            amount="₹64,000" 
            status="PAID" 
          />
          <InvoiceRow 
            id="INV-2026-003" 
            customer="Pooja Patel" 
            date="12 June 2026" 
            amount="₹9,200" 
            status="PENDING" 
          />
        </div>
      </div>
    </div>
  );
}
