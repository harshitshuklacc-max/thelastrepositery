import { Shield } from "lucide-react";
import { AdminLoginDialog } from "@/components/home/admin-login-dialog";

export function AdminPortalSection() {
  return (
    <section className="py-12 bg-white/[0.02] border-t border-white/10">
      <div className="container mx-auto px-4 text-center">
        <Shield className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
          Store Admin Portal
        </h2>
        <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
          Authorized staff only. Sign in to manage products, orders, inventory, and billing.
        </p>
        <AdminLoginDialog prominent />
      </div>
    </section>
  );
}
