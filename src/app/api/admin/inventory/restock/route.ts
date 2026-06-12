import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { updateStock } from "@/lib/inventory";
import { z } from "zod";

const restockSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = restockSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: parsed.data.productId },
      include: { inventory: true, barcodes: { where: { isPrimary: true }, take: 1 } },
    });

    if (!product || !product.inventory) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updated = await updateStock({
      productId: product.id,
      quantityChange: parsed.data.quantity,
      changeType: "RESTOCK",
      adminId: session.sub,
      reference: product.barcodes[0]?.code,
      notes: parsed.data.notes || `Manual restock: +${parsed.data.quantity}`,
    });

    await prisma.auditLog.create({
      data: {
        adminId: session.sub,
        action: "UPDATE",
        entity: "inventory",
        entityId: product.id,
        details: {
          productName: product.name,
          quantityAdded: parsed.data.quantity,
          newStock: updated.quantity,
        },
      },
    });

    return NextResponse.json({
      success: true,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      barcode: product.barcodes[0]?.code || null,
      previousStock: updated.quantity - parsed.data.quantity,
      newStock: updated.quantity,
      quantityAdded: parsed.data.quantity,
    });
  } catch (error) {
    console.error("Restock error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Restock failed" },
      { status: 500 }
    );
  }
}
