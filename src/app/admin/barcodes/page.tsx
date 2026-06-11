import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface BarcodeItemProps {
  sku: string;
  name: string;
  barcode: string;
  stock: number;
}

function BarcodeRow({ sku, name, barcode, stock }: BarcodeItemProps) {
  return (
    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
      <div>
        <div className="font-semibold text-white">{name}</div>
        <div className="text-xs text-white/40 mt-0.5">SKU: {sku}</div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="font-mono bg-white/5 px-3 py-1.5 rounded text-red-400 border border-white/5 tracking-wider">
            {barcode}
          </div>
        </div>
        <div className="text-right min-w-[70px]">
          <span className="text-white/60">Stock:</span>{" "}
          <span className="font-semibold text-white">{stock}</span>
        </div>
      </div>
    </div>
  );
}

export default async function AdminBarcodesPage() {
  return (
    <div className="container mx-auto px-4 py-12 text-white">
      {/* Top Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Barcode Management</h1>
          <p className="text-white/60 mt-1">Generate, track, and scan warehouse stock-keeping inventory metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/analytics">
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
              Analytics
            </Button>
          </Link>
          <Button className="bg-red-500 hover:bg-red-600 text-white">
            Print Labels
          </Button>
        </div>
      </div>

      {/* Inventory Barcode List Container */}
      <div className="glass-card luxury-border rounded bg-white/[0.01]">
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <h2 className="text-lg font-bold">Active SKUs & Barcodes</h2>
          <span className="text-xs text-white/40 uppercase font-mono tracking-wider">System Online</span>
        </div>
        <div className="divide-y divide-white/5">
          <BarcodeRow 
            sku="SM-AJ1-RED-10" 
            name="Air Jordan 1 Retro High OG 'Chicago'" 
            barcode="*SM9823410*" 
            stock={42} 
          />
          <BarcodeRow 
            sku="SM-YEEZY-350-9" 
            name="Yeezy Boost 350 V2 'Zebra'" 
            barcode="*SM1092384*" 
            stock={28} 
          />
          <BarcodeRow 
            sku="SM-NK-DUNKS-11" 
            name="Nike Dunk Low 'Panda'" 
            barcode="*SM4738291*" 
            stock={115} 
          />
          <BarcodeRow 
            sku="SM-TS-AJ1-LOW-10" 
            name="Air Jordan 1 Low x Travis Scott 'Reverse Mocha'" 
            barcode="*SM8392014*" 
            stock={14} 
          />
        </div>
      </div>
    </div>
  );
}
