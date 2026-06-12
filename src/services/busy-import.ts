import prisma from "@/lib/db";
import { parseBusyPDF, parseBusyCSV, validateBusyProductRow, type BusyParseResult } from "@/lib/busy-parser";
import { slugify } from "@/lib/utils";
import { setStock } from "@/lib/inventory";

export async function processBusyImport(
  buffer: ArrayBuffer,
  fileName: string,
  adminId: string
) {
  const lowerName = fileName.toLowerCase();
  let parsed: BusyParseResult;

  if (lowerName.endsWith(".csv")) {
    const text = new TextDecoder().decode(buffer);
    parsed = parseBusyCSV(text);
  } else {
    parsed = await parseBusyPDF(buffer);
  }

  return syncBusyRows(parsed, fileName, adminId);
}

async function syncBusyRows(
  { rows, errors: parseErrors, skipped, totalLinesScanned }: BusyParseResult,
  fileName: string,
  adminId: string
) {
  let addedCount = 0;
  let updatedCount = 0;
  let failedCount = 0;
  let skippedCount = skipped.length;
  const errors: string[] = [...parseErrors, ...skipped];

  if (rows.length === 0) {
    const log = await prisma.busyImportLog.create({
      data: {
        adminId,
        fileName,
        addedCount: 0,
        updatedCount: 0,
        failedCount: 0,
        errors: errors.length > 0 ? errors : ["No valid products extracted from file"],
      },
    });

    return {
      addedCount: 0,
      updatedCount: 0,
      failedCount: 0,
      skippedCount,
      parsedCount: 0,
      totalLinesScanned,
      errors,
      logId: log.id,
    };
  }

  const validatedRows = rows
    .map((rawRow) => validateBusyProductRow(rawRow))
    .filter((result) => {
      if (!result.valid) {
        skippedCount++;
        errors.push(`Skipped: ${result.reason}`);
        return false;
      }
      return true;
    })
    .map((result) => result.row);

  const barcodeCodes = validatedRows.map((row) => row.barcode);
  const existingBarcodes = await prisma.barcode.findMany({
    where: { code: { in: barcodeCodes } },
    include: { product: { include: { inventory: true } } },
  });
  const barcodeMap = new Map(existingBarcodes.map((entry) => [entry.code, entry]));

  for (const row of validatedRows) {
    try {
      const existingBarcode = barcodeMap.get(row.barcode);

      if (existingBarcode?.product) {
        const stockQty = row.stock || row.quantity;

        await setStock({
          productId: existingBarcode.product.id,
          quantity: stockQty,
          changeType: "BUSY_IMPORT",
          adminId,
          reference: fileName,
          notes: `BUSY import: ${row.name}`,
        });

        await prisma.product.update({
          where: { id: existingBarcode.product.id },
          data: {
            name: row.name,
            mrp: row.mrp,
            sellingPrice: row.sellingPrice,
            sku: row.sku,
          },
        });

        updatedCount++;
      } else {
        const baseSlug = slugify(row.name);
        let slug = `${baseSlug}-${row.barcode}`;
        let slugAttempt = 0;

        while (await prisma.product.findUnique({ where: { slug } })) {
          slugAttempt++;
          slug = `${baseSlug}-${row.barcode}-${slugAttempt}`;
        }

        const existingSku = await prisma.product.findUnique({ where: { sku: row.sku } });
        const sku = existingSku ? `${row.sku}-${row.barcode}` : row.sku;

        await prisma.product.create({
          data: {
            name: row.name,
            slug,
            sku,
            mrp: row.mrp,
            sellingPrice: row.sellingPrice,
            purchasePrice: row.sellingPrice * 0.7,
            status: "ACTIVE",
            inventory: {
              create: { quantity: Math.max(0, row.stock || row.quantity) },
            },
            barcodes: {
              create: { code: row.barcode, type: "CODE128", isPrimary: true },
            },
          },
        });

        addedCount++;
      }
    } catch (err) {
      failedCount++;
      errors.push(
        `Failed to import "${row.name}" (${row.barcode}): ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  }

  const log = await prisma.busyImportLog.create({
    data: {
      adminId,
      fileName,
      addedCount,
      updatedCount,
      failedCount,
      errors: errors.length > 0 ? errors : undefined,
    },
  });

  await prisma.auditLog.create({
    data: {
      adminId,
      action: "IMPORT",
      entity: "busy_import",
      entityId: log.id,
      details: { fileName, addedCount, updatedCount, failedCount, skippedCount, parsedCount: rows.length },
    },
  });

  return {
    addedCount,
    updatedCount,
    failedCount,
    skippedCount,
    parsedCount: rows.length,
    totalLinesScanned,
    errors,
    logId: log.id,
  };
}
