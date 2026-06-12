import prisma from "@/lib/db";
import type { InventoryChangeType, Prisma } from "@prisma/client";

interface StockUpdateParams {
  productId: string;
  quantityChange: number;
  changeType: InventoryChangeType;
  adminId?: string;
  reference?: string;
  notes?: string;
}

export async function updateStock(
  params: StockUpdateParams,
  tx?: Prisma.TransactionClient
) {
  const client = tx ?? prisma;

  const inventory = await client.inventory.findUnique({
    where: { productId: params.productId },
  });

  if (!inventory) {
    throw new Error(`Inventory not found for product ${params.productId}`);
  }

  const quantityBefore = inventory.quantity;
  const quantityAfter = quantityBefore + params.quantityChange;

  if (quantityAfter < 0) {
    throw new Error(`Insufficient stock for product ${params.productId}`);
  }

  const updated = await client.inventory.update({
    where: { productId: params.productId },
    data: { quantity: quantityAfter },
  });

  await client.inventoryLog.create({
    data: {
      productId: params.productId,
      adminId: params.adminId,
      changeType: params.changeType,
      quantityBefore,
      quantityAfter,
      quantityChange: params.quantityChange,
      reference: params.reference,
      notes: params.notes,
    },
  });

  return updated;
}

export async function setStock(
  params: {
    productId: string;
    quantity: number;
    changeType: InventoryChangeType;
    adminId?: string;
    reference?: string;
    notes?: string;
  },
  tx?: Prisma.TransactionClient
) {
  const client = tx ?? prisma;

  const inventory = await client.inventory.findUnique({
    where: { productId: params.productId },
  });

  if (!inventory) {
    throw new Error(`Inventory not found for product ${params.productId}`);
  }

  const quantityBefore = inventory.quantity;
  const quantityAfter = Math.max(0, params.quantity);
  const quantityChange = quantityAfter - quantityBefore;

  const updated = await client.inventory.update({
    where: { productId: params.productId },
    data: { quantity: quantityAfter },
  });

  await client.inventoryLog.create({
    data: {
      productId: params.productId,
      adminId: params.adminId,
      changeType: params.changeType,
      quantityBefore,
      quantityAfter,
      quantityChange,
      reference: params.reference,
      notes: params.notes,
    },
  });

  return updated;
}

export async function reserveStock(productId: string, quantity: number) {
  return prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.findUnique({
      where: { productId },
    });

    if (!inventory || inventory.quantity - inventory.reserved < quantity) {
      throw new Error("Insufficient available stock");
    }

    return tx.inventory.update({
      where: { productId },
      data: { reserved: { increment: quantity } },
    });
  });
}

export async function releaseReservedStock(productId: string, quantity: number) {
  return prisma.inventory.update({
    where: { productId },
    data: { reserved: { decrement: quantity } },
  });
}

export async function deductStockForSale(
  items: { productId: string; quantity: number }[],
  changeType: InventoryChangeType,
  reference?: string,
  adminId?: string
) {
  return prisma.$transaction(async (tx) => {
    for (const item of items) {
      await updateStock(
        {
          productId: item.productId,
          quantityChange: -item.quantity,
          changeType,
          adminId,
          reference,
        },
        tx
      );
    }
  });
}
