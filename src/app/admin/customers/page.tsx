import { AdminCustomerForm } from "@/components/admin/customer-form";
import { getCustomers } from "@/services/customers";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const { customers } = await getCustomers({ limit: 100 });

  return (
    <div className="container mx-auto px-4 py-12 text-white">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold tracking-tight">Customers</h1>
        <p className="text-white/60 mt-1">
          All registered customers appear here automatically — from storefront sign-up or admin-created accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <AdminCustomerForm />
        </div>

        <div className="lg:col-span-2 glass-card luxury-border rounded bg-white/[0.01] p-6">
          <h2 className="text-lg font-bold mb-4">Registered Customers ({customers.length})</h2>
          {customers.length === 0 ? (
            <p className="text-white/50 text-sm">No customers yet. Add one using the form.</p>
          ) : (
            <div className="divide-y divide-white/5">
              {customers.map((customer) => (
                <div key={customer.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white">
                      {customer.firstName}{customer.lastName ? ` ${customer.lastName}` : ""}
                    </p>
                    <p className="text-sm text-white/60">{customer.user.email}</p>
                    {customer.phone && <p className="text-xs text-white/40">{customer.phone}</p>}
                  </div>
                  <p className="text-xs text-white/40">{formatDateTime(customer.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
