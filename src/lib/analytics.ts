import prisma from "@/lib/db";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

export async function getDashboardStats() {
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  const monthStart = startOfDay(subDays(today, 30));

  const [
    totalProducts,
    totalOrders,
    totalCustomers,
    todayOrders,
    monthRevenue,
    lowStockProducts,
  ] = await Promise.all([
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.order.count(),
    prisma.customer.count(),
    prisma.order.count({
      where: { createdAt: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: monthStart },
        paymentStatus: "COMPLETED",
      },
      _sum: { grandTotal: true },
    }),
    prisma.inventory
      .findMany({
        include: { product: { select: { name: true, sku: true } } },
        take: 100,
      })
      .then((items) => items.filter((i) => i.quantity <= i.minStock).slice(0, 10)),
  ]);

  return {
    totalProducts,
    totalOrders,
    totalCustomers,
    todayOrders,
    monthRevenue: monthRevenue._sum.grandTotal?.toNumber() || 0,
    lowStockProducts,
  };
}

export async function getRevenueChart(days = 30) {
  const startDate = subDays(new Date(), days);

  const orders = await prisma.order.groupBy({
    by: ["createdAt"],
    where: {
      createdAt: { gte: startDate },
      paymentStatus: "COMPLETED",
    },
    _sum: { grandTotal: true },
    _count: true,
  });

  const dailyMap = new Map<string, { revenue: number; orders: number }>();

  for (let i = 0; i <= days; i++) {
    const date = format(subDays(new Date(), days - i), "yyyy-MM-dd");
    dailyMap.set(date, { revenue: 0, orders: 0 });
  }

  for (const order of orders) {
    const date = format(order.createdAt, "yyyy-MM-dd");
    const existing = dailyMap.get(date) || { revenue: 0, orders: 0 };
    dailyMap.set(date, {
      revenue: existing.revenue + (order._sum.grandTotal?.toNumber() || 0),
      orders: existing.orders + order._count,
    });
  }

  return Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    ...data,
  }));
}

export async function getRecentOrders(limit = 10) {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      items: { take: 1 },
      customer: { select: { firstName: true, lastName: true } },
    },
  });
}

export async function getProductsSoldCount(days = 30) {
  const startDate = subDays(new Date(), days);
  const result = await prisma.orderItem.aggregate({
    where: {
      order: {
        createdAt: { gte: startDate },
        paymentStatus: "COMPLETED",
      },
    },
    _sum: { quantity: true },
  });
  return result._sum.quantity || 0;
}

export async function recordDailyAnalytics() {
  const today = startOfDay(new Date());
  const todayEnd = endOfDay(today);

  const stats = await prisma.order.aggregate({
    where: {
      createdAt: { gte: today, lte: todayEnd },
      paymentStatus: "COMPLETED",
    },
    _sum: { grandTotal: true },
    _count: true,
  });

  const onlineSales = await prisma.order.count({
    where: {
      createdAt: { gte: today, lte: todayEnd },
      channel: "ONLINE",
      paymentStatus: "COMPLETED",
    },
  });

  const offlineSales = await prisma.order.count({
    where: {
      createdAt: { gte: today, lte: todayEnd },
      channel: "OFFLINE_POS",
      paymentStatus: "COMPLETED",
    },
  });

  const productsSold = await prisma.orderItem.aggregate({
    where: {
      order: {
        createdAt: { gte: today, lte: todayEnd },
        paymentStatus: "COMPLETED",
      },
    },
    _sum: { quantity: true },
  });

  await prisma.analytics.upsert({
    where: { date: today },
    update: {
      revenue: stats._sum.grandTotal || 0,
      orders: stats._count,
      onlineSales,
      offlineSales,
      productsSold: productsSold._sum.quantity || 0,
    },
    create: {
      date: today,
      revenue: stats._sum.grandTotal || 0,
      orders: stats._count,
      onlineSales,
      offlineSales,
      productsSold: productsSold._sum.quantity || 0,
    },
  });
}
