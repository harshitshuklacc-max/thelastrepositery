import prisma from "@/lib/db";
import { generateOrderNumber, generateInvoiceNumber } from "@/lib/utils";
import { deductStockForSale } from "@/lib/inventory";
import { getStoreSettings } from "@/lib/settings";
import type { PosSaleInput } from "@/lib/validations";
import { addDays } from "date-fns";

export async function createPosSale(data: PosSaleInput, adminId: string) {
  const storeSettings = await getStoreSettings();

  return prisma.$transaction(async (tx) => {
    const orderNumber = generateOrderNumber();
    let subtotal = 0;
    const orderItems: {
      productId: string;
      name: string;
      sku: string;
      barcode: string | null;
      quantity: number;
      price: number;
      discount: number;
      tax: number;
      total: number;
    }[] = [];

    for (const item of data.items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        include: { inventory: true, barcodes: { where: { isPrimary: true }, take: 1 } },
      });

      if (!product || !product.inventory) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      if (product.inventory.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      const price = product.sellingPrice.toNumber();
      const itemDiscount = item.discount || 0;
      const tax = (price * item.quantity * storeSettings.taxRate) / 100;
      const total = price * item.quantity - itemDiscount + tax;
      subtotal += price * item.quantity;

      orderItems.push({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcodes[0]?.code || null,
        quantity: item.quantity,
        price,
        discount: itemDiscount,
        tax,
        total,
      });
    }

    const orderDiscount = data.discount || 0;
    const totalTax = orderItems.reduce((sum, i) => sum + i.tax, 0);
    const grandTotal = subtotal - orderDiscount - orderItems.reduce((s, i) => s + i.discount, 0) + totalTax;

    const order = await tx.order.create({
      data: {
        orderNumber,
        status: "CONFIRMED",
        channel: "OFFLINE_POS",
        subtotal,
        discount: orderDiscount,
        tax: totalTax,
        grandTotal,
        paymentMethod: data.paymentMethod,
        paymentStatus: "COMPLETED",
        notes: data.customerName ? `Customer: ${data.customerName}` : undefined,
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });

    await deductStockForSale(
      data.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      "OFFLINE_SALE",
      orderNumber,
      adminId
    );

    const invoiceNumber = generateInvoiceNumber();
    const retentionDays = storeSettings.invoiceRetentionDays;
    const invoiceDate = new Date();

    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber,
        orderId: order.id,
        channel: "OFFLINE_POS",
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        storeName: storeSettings.storeName,
        storeAddress: storeSettings.storeAddress,
        storePhone: storeSettings.storePhone,
        subtotal,
        discount: orderDiscount,
        tax: totalTax,
        grandTotal,
        paymentMethod: data.paymentMethod,
        invoiceDate,
        expiresAt: addDays(invoiceDate, retentionDays),
        items: {
          create: orderItems.map((item) => ({
            productId: item.productId,
            name: item.name,
            sku: item.sku,
            barcode: item.barcode,
            quantity: item.quantity,
            price: item.price,
            discount: item.discount,
            tax: item.tax,
            total: item.total,
          })),
        },
      },
      include: { items: true },
    });

    await tx.auditLog.create({
      data: {
        adminId,
        action: "CREATE",
        entity: "order",
        entityId: order.id,
        details: { orderNumber, channel: "OFFLINE_POS", grandTotal },
      },
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate.toISOString(),
      storeName: invoice.storeName,
      storeAddress: invoice.storeAddress,
      storePhone: invoice.storePhone,
      customerName: invoice.customerName,
      customerPhone: invoice.customerPhone,
      paymentMethod: invoice.paymentMethod,
      subtotal: subtotal,
      discount: orderDiscount,
      tax: totalTax,
      grandTotal: grandTotal,
      items: invoice.items.map((item) => ({
        name: item.name,
        sku: item.sku,
        barcode: item.barcode,
        quantity: item.quantity,
        price: item.price.toNumber(),
        discount: item.discount.toNumber(),
        tax: item.tax.toNumber(),
        total: item.total.toNumber(),
      })),
    };
  });
}

export async function getOrders(params: {
  page?: number;
  limit?: number;
  status?: string;
  channel?: string;
}) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (params.status) where.status = params.status;
  if (params.channel) where.channel = params.channel;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        customer: { include: { user: { select: { email: true } } } },
        items: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, total, page, totalPages: Math.ceil(total / limit) };
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  adminId?: string
) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: status as never },
  });

  if (adminId) {
    await prisma.auditLog.create({
      data: {
        adminId,
        action: "UPDATE",
        entity: "order",
        entityId: orderId,
        details: { status },
      },
    });
  }

  return order;
}
