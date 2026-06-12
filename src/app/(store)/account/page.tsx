import { getUserSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { CustomerAuthForm } from "@/components/account/customer-auth-form";
import { AccountDashboard } from "@/components/account/account-dashboard";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getUserSession();

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-8 text-center">
          My <span className="text-red-500">Account</span>
        </h1>
        <CustomerAuthForm />
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: {
      customer: {
        include: {
          orders: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      },
    },
  });

  if (!user?.customer) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-8 text-center">
          My <span className="text-red-500">Account</span>
        </h1>
        <CustomerAuthForm />
      </div>
    );
  }

  const orders = user.customer.orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    grandTotal:
      typeof order.grandTotal.toNumber === "function"
        ? order.grandTotal.toNumber()
        : Number(order.grandTotal),
    createdAt: order.createdAt.toISOString(),
  }));

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-8">
        My <span className="text-red-500">Account</span>
      </h1>
      <AccountDashboard
        email={user.email}
        firstName={user.customer.firstName}
        lastName={user.customer.lastName}
        phone={user.customer.phone}
        orders={orders}
      />
    </div>
  );
}
