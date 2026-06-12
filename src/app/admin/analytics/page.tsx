import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getDashboardStats, getRecentOrders, getProductsSoldCount } from "@/lib/analytics";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

function AnalyticsStatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="glass-card p-6 luxury-border rounded bg-white/[0.01]">
      <p className="text-white/50 text-sm font-medium uppercase tracking-wider">{title}</p>
      <h3 className="text-3xl font-bold text-white mt-2 mb-1">{value}</h3>
      <p className="text-xs text-white/40">{subtitle}</p>
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  const [stats, recentOrders, productsSold] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(10),
    getProductsSoldCount(30),
  ]);

  return (
    <div className="container mx-auto px-4 py-12 text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-white/60 mt-1">Live metrics from your database — no demo data.</p>
        </div>
        <Link href="/shop">
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
            View Store
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <AnalyticsStatCard
          title="30-Day Revenue"
          value={formatCurrency(stats.monthRevenue)}
          subtitle="Completed payments only"
        />
        <AnalyticsStatCard
          title="Products Sold"
          value={`${productsSold} units`}
          subtitle="Last 30 days"
        />
        <AnalyticsStatCard
          title="Total Orders"
          value={String(stats.totalOrders)}
          subtitle={`${stats.todayOrders} today`}
        />
        <AnalyticsStatCard
          title="Registered Customers"
          value={String(stats.totalCustomers)}
          subtitle={`${stats.totalProducts} active products`}
        />
      </div>

      <div className="glass-card p-8 luxury-border rounded bg-white/[0.01]">
        <h2 className="text-xl font-bold mb-4">Latest Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-white/50 text-sm">No orders yet. Complete a POS sale or receive an online order.</p>
        ) : (
          <div className="border border-white/5 rounded divide-y divide-white/5 text-sm text-white/70">
            {recentOrders.map((order) => {
              const total =
                typeof order.grandTotal.toNumber === "function"
                  ? order.grandTotal.toNumber()
                  : Number(order.grandTotal);
              const customer =
                order.customer
                  ? `${order.customer.firstName}${order.customer.lastName ? ` ${order.customer.lastName}` : ""}`
                  : order.notes?.replace(/^Customer:\s*/i, "") || "Walk-in";
              const itemLabel = order.items[0]?.name || "Order items";

              return (
                <div key={order.id} className="p-4 flex justify-between items-center gap-4">
                  <div>
                    <span className="block font-mono text-xs text-white/40">{order.orderNumber}</span>
                    <span>{customer} — {itemLabel}</span>
                    <span className="block text-xs text-white/40 mt-1">
                      {formatDateTime(order.createdAt)} · {order.channel}
                    </span>
                  </div>
                  <span className="font-semibold text-emerald-400 shrink-0">{formatCurrency(total)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {stats.lowStockProducts.length > 0 && (
        <div className="glass-card p-8 luxury-border rounded bg-white/[0.01] mt-8">
          <h2 className="text-xl font-bold mb-4">Low Stock Alerts</h2>
          <div className="space-y-2 text-sm">
            {stats.lowStockProducts.map((item) => (
              <div key={item.productId} className="flex justify-between text-white/70">
                <span>{item.product.name} ({item.product.sku})</span>
                <span className="text-amber-400">{item.quantity} left</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
