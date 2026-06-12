import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getOrders } from "@/services/orders";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  CONFIRMED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PROCESSING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  SHIPPED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  DELIVERED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CANCELLED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  RETURNED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

export default async function AdminOrdersPage() {
  const { orders } = await getOrders({ limit: 50 });

  return (
    <div className="container mx-auto px-4 py-12 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Orders</h1>
          <p className="text-white/60 mt-1">Real orders from POS and online sales stored in your database.</p>
        </div>
        <Link href="/admin/invoices">
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
            Invoices
          </Button>
        </Link>
      </div>

      <div className="glass-card luxury-border rounded bg-white/[0.01]">
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-lg font-bold">All Orders</h2>
          <span className="text-xs text-white/40 uppercase font-mono tracking-wider">
            {orders.length} record{orders.length === 1 ? "" : "s"}
          </span>
        </div>

        {orders.length === 0 ? (
          <p className="p-8 text-white/50 text-sm text-center">No orders yet. Complete a POS sale to create one.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {orders.map((order) => {
              const customerLabel =
                order.customer
                  ? `${order.customer.firstName}${order.customer.lastName ? ` ${order.customer.lastName}` : ""}`
                  : order.notes?.replace(/^Customer:\s*/i, "") || "Walk-in Customer";
              const firstItem = order.items[0];
              const itemSummary = firstItem
                ? `${firstItem.name}${order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}`
                : "No items";
              const total =
                typeof order.grandTotal.toNumber === "function"
                  ? order.grandTotal.toNumber()
                  : Number(order.grandTotal);

              return (
                <div
                  key={order.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-xs text-white/40">{order.orderNumber}</span>
                    <span className="font-semibold text-white">{customerLabel}</span>
                    <span className="text-xs text-white/60">{itemSummary}</span>
                    <span className="text-xs text-white/40">{formatDateTime(order.createdAt)} · {order.channel}</span>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    <span className={`px-2.5 py-1 rounded text-xs border ${statusColors[order.status] || statusColors.PENDING}`}>
                      {order.status}
                    </span>
                    <span className="font-semibold text-white min-w-[80px] text-right">
                      {formatCurrency(total)}
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
