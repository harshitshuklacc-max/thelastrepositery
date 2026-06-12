import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  ScanLine,
  Upload,
  FileText,
  Store,
  Users,
  PackagePlus,
} from "lucide-react";
import { LogoutButton } from "@/components/admin/logout-button";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/restock", label: "Scan & Restock", icon: PackagePlus },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/pos", label: "POS", icon: Store },
  { href: "/admin/import", label: "BUSY Import", icon: Upload },
  { href: "/admin/barcodes", label: "Barcodes", icon: ScanLine },
  { href: "/admin/invoices", label: "Invoices", icon: FileText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <aside className="w-64 border-r border-white/10 glass fixed h-full">
        <div className="p-6 border-b border-white/10">
          <Link href="/admin" className="font-display text-xl font-bold">
            SHOE<span className="text-red-500">MAFIA</span>
          </Link>
          <p className="text-xs text-white/40 mt-1">Admin Panel</p>
        </div>
        <nav className="p-4 space-y-1">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <LogoutButton />
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white w-full transition-colors mt-1"
          >
            <Store className="h-4 w-4" />
            View Store
          </Link>
        </div>
      </aside>
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
