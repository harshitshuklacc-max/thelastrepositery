import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
}

function AnalyticsStatCard({ title, value, change, isPositive }: StatCardProps) {
  return (
    <div className="glass-card p-6 luxury-border rounded bg-white/[0.01]">
      <p className="text-white/50 text-sm font-medium uppercase tracking-wider">{title}</p>
      <h3 className="text-3xl font-bold text-white mt-2 mb-1">{value}</h3>
      <p className={`text-xs font-semibold ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
        {change} since last month
      </p>
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-12 text-white">
      {/* Top Banner Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-white/60 mt-1">Real-time performance metrics and sneaker checkout telemetry.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/shop">
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
              View Store
            </Button>
          </Link>
          <Button className="bg-red-500 hover:bg-red-600 text-white">
            Export Report
          </Button>
        </div>
      </div>

      {/* Grid Allocation Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <AnalyticsStatCard 
          title="Gross Revenue" 
          value="₹14,25,800" 
          change="+12.4%" 
          isPositive={true} 
        />
        <AnalyticsStatCard 
          title="Sneakers Dispatched" 
          value="342 Pairs" 
          change="+8.1%" 
          isPositive={true} 
        />
        <AnalyticsStatCard 
          title="Conversion Efficiency" 
          value="3.18%" 
          change="-0.4%" 
          isPositive={false} 
        />
        <AnalyticsStatCard 
          title="Active Shopping Carts" 
          value="89 Sessions" 
          change="+23.5%" 
          isPositive={true} 
        />
      </div>

      {/* Mock Data Feed Display Area */}
      <div className="glass-card p-8 luxury-border rounded bg-white/[0.01]">
        <h2 className="text-xl font-bold mb-4">Latest Store Activities</h2>
        <div className="border border-white/5 rounded divide-y divide-white/5 text-sm text-white/70">
          <div className="p-4 flex justify-between items-center">
            <span>Order #1024 — Premium Retro High OG Check out</span>
            <span className="font-semibold text-emerald-400">₹18,500</span>
          </div>
          <div className="p-4 flex justify-between items-center">
            <span>Order #1023 — Low Travis Scott Fragment Entry</span>
            <span className="font-semibold text-emerald-400">₹64,000</span>
          </div>
          <div className="p-4 flex justify-between items-center">
            <span>Order #1022 — Essentials Foam Runner Release Drop</span>
            <span className="font-semibold text-emerald-400">₹9,200</span>
          </div>
        </div>
      </div>
    </div>
  );
}
