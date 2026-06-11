import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface CartItemProps {
  name: string;
  sku: string;
  price: string;
}

function POSCartItem({ name, sku, price }: CartItemProps) {
  return (
    <div className="p-4 flex items-center justify-between text-sm border-b border-white/5 bg-white/[0.005]">
      <div>
        <div className="font-semibold text-white">{name}</div>
        <div className="text-xs text-white/40 mt-0.5">SKU: {sku}</div>
      </div>
      <div className="font-mono font-semibold text-white">{price}</div>
    </div>
  );
}

export default async function AdminPOSPage() {
  return (
    <div className="container mx-auto px-4 py-12 text-white">
      {/* Top Banner Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Point of Sale (POS)</h1>
          <p className="text-white/60 mt-1">In-store terminal interface for executing counter drop checkouts.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
              Dashboard Node
            </Button>
          </Link>
          <Button className="bg-red-500 hover:bg-red-600 text-white">
            Scan Barcode
          </Button>
        </div>
      </div>

      {/* POS Terminal Column Matrix Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Checkout Item Queue */}
        <div className="lg:col-span-2 glass-card luxury-border rounded bg-white/[0.01] h-fit">
          <div className="px-6 py-4 border-b border-white/5">
            <h2 className="text-lg font-bold">Current Cart Manifest</h2>
          </div>
          <div>
            <POSCartItem 
              name="Air Jordan 1 Retro High OG 'Chicago' (Size 10)" 
              sku="SM-AJ1-RED-10" 
              price="₹18,500" 
            />
            <POSCartItem 
              name="Nike Dunk Low 'Panda' (Size 11)" 
              sku="SM-NK-DUNKS-11" 
              price="₹9,200" 
            />
          </div>
        </div>

        {/* Transaction Billing Summary Card */}
        <div className="glass-card luxury-border rounded p-6 bg-white/[0.01] h-fit flex flex-col gap-6">
          <h2 className="text-lg font-bold border-b border-white/5 pb-3">Order Invoice Summary</h2>
          
          <div className="flex flex-col gap-3 text-sm border-b border-white/5 pb-4">
            <div className="flex justify-between text-white/60">
              <span>Items Total (2 items)</span>
              <span>₹27,700</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>In-store Discount</span>
              <span className="text-red-400">-₹1,200</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>CGST / SGST (18%)</span>
              <span>₹4,770</span>
            </div>
          </div>

          <div className="flex justify-between items-center font-bold text-lg text-white">
            <span>Amount Payable</span>
            <span className="text-xl font-mono text-red-400">₹31,270</span>
          </div>

          <Button className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-6 text-base mt-2">
            Collect Payment & Print Receipt
          </Button>
        </div>
      </div>
    </div>
  );
}
