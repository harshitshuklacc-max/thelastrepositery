"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Heart, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  grandTotal: number;
  createdAt: string;
}

interface AccountDashboardProps {
  email: string;
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  orders: OrderSummary[];
}

export function AccountDashboard({
  email,
  firstName,
  lastName,
  phone,
  orders,
}: AccountDashboardProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/customer/logout", { method: "POST" });
    router.refresh();
  }

  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  return (
    <div className="space-y-6">
      <Card className="glass-card border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white font-display text-2xl">
              Hello, {firstName}
            </CardTitle>
            <p className="text-white/60 text-sm mt-1">{email}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white/60">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-white/70">
          <p><span className="text-white/40">Name:</span> {fullName}</p>
          {phone && <p><span className="text-white/40">Phone:</span> {phone}</p>}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/account/wishlist">
          <Card className="glass-card border-white/10 hover:border-red-500/30 transition-colors cursor-pointer h-full">
            <CardContent className="flex items-center gap-4 p-6">
              <Heart className="h-8 w-8 text-red-500" />
              <div>
                <p className="font-semibold text-white">My Wishlist</p>
                <p className="text-sm text-white/60">View saved products</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/shop">
          <Card className="glass-card border-white/10 hover:border-red-500/30 transition-colors cursor-pointer h-full">
            <CardContent className="flex items-center gap-4 p-6">
              <Package className="h-8 w-8 text-red-500" />
              <div>
                <p className="font-semibold text-white">Continue Shopping</p>
                <p className="text-sm text-white/60">Browse our collection</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-white/60 text-sm">You have no orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-white">{order.orderNumber}</p>
                    <p className="text-xs text-white/50">
                      {new Date(order.createdAt).toLocaleDateString()} · {order.status}
                    </p>
                  </div>
                  <p className="font-semibold text-red-400">
                    ₹{order.grandTotal.toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
