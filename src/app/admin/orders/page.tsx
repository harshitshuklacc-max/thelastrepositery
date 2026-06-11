import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface OrderItemProps {
  id: string;
  customer: string;
  item: string;
  total: string;
  status: "DELIVERED" | "PROCESSING" | "DISPATCHED";
}

function OrderRow({ id, customer, item, total, status }: OrderItemProps) {
  const statusColors = {
    DELIVERED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    PROCESSING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    DISPATCHED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  return (
    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs text-white/40">{id}</span>
        <span className="font-semibold text-white">{customer}</span>
        <span className="text-xs text-white/60">{item}</span>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
        <span className={`px-2.5 py-1 rounded text-xs border ${statusColors[status]}`}>
          {status}
        </span>
        <span className="font-semibold text-white min-w-[80px] text-right">{total}</span>
      </div>
    </div>
  );
}

export default async function AdminOrdersPage() {
  return (
    <div className="container mx-auto px-4 py-12 text-white">
      {/* Top Banner Control Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Order Fulfilment</h1>
          <p className="text-white/60 mt-1">Manage processing workflows, shipping logs, and sneaker dispatches.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/invoices">
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
              Invoices
            </Button>
          </Link>
          <Button className="bg-red-500 hover:bg-red-600 text-white">
            Filter Pending
          </Button>
        </div>
      </div>

      {/* Main Order Queue Log */}
      <div className="glass-card luxury-border rounded bg-white/[0.01]">
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <h2 className="text-lg font-bold">Active Fulfilment Queue</h2>
          <span className="text-xs text-white/40 uppercase font-mono tracking-wider">Live Processing</span>
        </div>
        <div className="divide-y divide-white/5">
          <OrderRow 
            id="#OD-47291" 
            customer="Rohan Malhotra" 
            item="Air Jordan 1 Retro High OG 'Chicago' (Size 10)" 
            total="₹18,500" 
            status="DELIVERED" 
          />
          <OrderRow 
            id="#OD-47292" 
            customer="Siddharth Singh" 
            item="Yeezy Boost 350 V2 'Zebra' (Size 9)" 
            total="₹26,500" 
            status="DISPATCHED" 
          />
          <OrderRow 
            id="#OD-47293" 
            customer="Karan Johar" 
            item="Nike Dunk Low 'Panda' (Size 11)" 
            total="₹9,200" 
            status="PROCESSING" 
          />
        </div>
      </div>
    </div>
  );
}
