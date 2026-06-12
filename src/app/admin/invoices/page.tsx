import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getInvoices } from "@/services/invoices";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminInvoicesPage() {
  const { invoices } = await getInvoices({ limit: 50 });

  return (
    <div className="container mx-auto px-4 py-12 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Invoices</h1>
          <p className="text-white/60 mt-1">Real invoices generated from POS and online orders.</p>
        </div>
        <Link href="/admin/import">
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
            Import Panel
          </Button>
        </Link>
      </div>

      <div className="glass-card luxury-border rounded bg-white/[0.01]">
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-lg font-bold">Billing Ledger</h2>
          <span className="text-xs text-white/40 uppercase font-mono tracking-wider">
            {invoices.length} record{invoices.length === 1 ? "" : "s"}
          </span>
        </div>

        {invoices.length === 0 ? (
          <p className="p-8 text-white/50 text-sm text-center">No invoices yet. Complete a POS sale to generate one.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {invoices.map((invoice) => {
              const amount =
                typeof invoice.grandTotal.toNumber === "function"
                  ? invoice.grandTotal.toNumber()
                  : Number(invoice.grandTotal);

              return (
                <div
                  key={invoice.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-xs text-white/40">{invoice.invoiceNumber}</span>
                    <span className="font-semibold text-white">
                      {invoice.customerName || "Walk-in Customer"}
                    </span>
                    {invoice.order?.orderNumber && (
                      <span className="text-xs text-white/40">Order: {invoice.order.orderNumber}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    <span className="text-white/50 text-xs">{formatDate(invoice.invoiceDate)}</span>
                    <span className="px-2.5 py-1 rounded text-xs border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      {invoice.paymentMethod || "PAID"}
                    </span>
                    <span className="font-semibold text-white min-w-[80px] text-right">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
