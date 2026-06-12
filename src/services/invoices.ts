import prisma from "@/lib/db";

export async function getInvoices(params: {
  page?: number;
  limit?: number;
  channel?: string;
}) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (params.channel) where.channel = params.channel;

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        items: true,
        order: { select: { orderNumber: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.invoice.count({ where }),
  ]);

  return { invoices, total, page, totalPages: Math.ceil(total / limit) };
}
