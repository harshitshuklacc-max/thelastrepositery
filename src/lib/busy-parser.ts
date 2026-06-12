export interface BusyProductRow {
  name: string;
  barcode: string;
  sku: string;
  mrp: number;
  sellingPrice: number;
  stock: number;
  quantity: number;
}

export interface BusyParseResult {
  rows: BusyProductRow[];
  errors: string[];
  skipped: string[];
  totalLinesScanned: number;
}

interface TextItem {
  str: string;
  transform: number[];
}

interface ParsedCell {
  text: string;
  x: number;
}

interface ParsedRow {
  y: number;
  cells: ParsedCell[];
  raw: string;
}

const Y_TOLERANCE = 5;

const SKIP_LINE_PATTERNS = [
  /^page\s+\d+/i,
  /^total\b/i,
  /grand\s*total/i,
  /sub\s*total/i,
  /^busy\b/i,
  /^stock\s+(summary|report|statement)/i,
  /^item\s+(summary|list|report)/i,
  /^date\s*:/i,
  /^from\s*:/i,
  /^to\s*:/i,
  /^gstin\b/i,
  /^cin\b/i,
  /^phone\b/i,
  /^tel\b/i,
  /^address\b/i,
  /^printed\b/i,
  /^generated\b/i,
  /^continued\b/i,
  /^amount\b/i,
  /^sr\.?\s*no/i,
  /^s\.?\s*no/i,
];

const HEADER_HINTS: Record<string, RegExp[]> = {
  name: [/item\s*name/i, /\bparticulars\b/i, /\bdescription\b/i, /^item$/i, /\bproduct\b/i],
  barcode: [/bar\s*code/i, /\bean\b/i, /\bupc\b/i],
  sku: [/item\s*code/i, /\bsku\b/i, /^code$/i, /\bhsn\b/i],
  mrp: [/\bmrp\b/i, /m\.r\.p/i],
  sellingPrice: [/sale\s*rate/i, /sell(?:ing)?\s*(?:rate|price)/i, /\bs\.?\s*p\.?\b/i, /\brate\b/i],
  stock: [/clos(?:ing)?\s*(?:stock|qty|balance)/i, /\bstock\b/i, /\bqty\b/i, /\bquantity\b/i],
};

function parseNumber(value: string): number {
  const cleaned = value.replace(/[₹Rs.\s]/gi, "").replace(/,/g, "").trim();
  if (!cleaned || cleaned === "-") return 0;
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : 0;
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function isSkippableLine(line: string): boolean {
  const trimmed = normalizeWhitespace(line);
  if (!trimmed || trimmed.length < 2) return true;
  return SKIP_LINE_PATTERNS.some((p) => p.test(trimmed));
}

function isValidBarcode(code: string): boolean {
  if (!/^\d{8,14}$/.test(code)) return false;
  // Reject common false positives: dates, phone fragments
  if (/^(19|20)\d{6}$/.test(code)) return false;
  if (/^0{4,}/.test(code)) return false;
  return true;
}

function isValidProductName(name: string): boolean {
  const n = normalizeWhitespace(name);
  if (n.length < 2) return false;
  if (/^(unknown|n\/a|na|none|null|product|item|test)$/i.test(n)) return false;
  if (/^\d+([.,]\d+)?$/.test(n)) return false;
  if (/^(page|total|date|from|to|busy|stock|invoice|report)\b/i.test(n)) return false;
  if (/^[\d\s.,₹Rs/-]+$/.test(n)) return false;
  return true;
}

export function validateBusyProductRow(
  row: Partial<BusyProductRow>
): { valid: true; row: BusyProductRow } | { valid: false; reason: string } {
  const name = normalizeWhitespace(row.name || "");
  const barcode = (row.barcode || "").trim();
  const sku = normalizeWhitespace(row.sku || "");
  const mrp = row.mrp ?? 0;
  const sellingPrice = row.sellingPrice ?? 0;
  const stock = row.stock ?? row.quantity ?? 0;

  if (!isValidProductName(name)) {
    return { valid: false, reason: `Invalid or missing product name: "${name || "(empty)"}"` };
  }
  if (!isValidBarcode(barcode)) {
    return { valid: false, reason: `Invalid barcode for "${name}": "${barcode || "(empty)"}"` };
  }
  if (mrp <= 0 && sellingPrice <= 0) {
    return { valid: false, reason: `No valid price for "${name}"` };
  }
  if (stock < 0) {
    return { valid: false, reason: `Invalid stock for "${name}"` };
  }

  return {
    valid: true,
    row: {
      name,
      barcode,
      sku: sku || barcode,
      mrp: mrp > 0 ? mrp : sellingPrice,
      sellingPrice: sellingPrice > 0 ? sellingPrice : mrp,
      stock,
      quantity: stock,
    },
  };
}

function groupTextIntoRows(items: TextItem[]): ParsedRow[] {
  const withPos = items
    .map((item) => ({
      text: item.str.trim(),
      x: Math.round(item.transform[4]),
      y: Math.round(item.transform[5]),
    }))
    .filter((item) => item.text.length > 0);

  withPos.sort((a, b) => b.y - a.y || a.x - b.x);

  const rows: ParsedRow[] = [];
  let current: ParsedRow | null = null;

  for (const item of withPos) {
    if (!current || Math.abs(current.y - item.y) > Y_TOLERANCE) {
      if (current) rows.push(current);
      current = { y: item.y, cells: [{ text: item.text, x: item.x }], raw: item.text };
    } else {
      current.cells.push({ text: item.text, x: item.x });
      current.raw = normalizeWhitespace(`${current.raw} ${item.text}`);
    }
  }
  if (current) rows.push(current);

  for (const row of rows) {
    row.cells.sort((a, b) => a.x - b.x);
    row.raw = row.cells.map((c) => c.text).join(" ");
  }

  return rows;
}

type ColumnMap = Partial<Record<keyof typeof HEADER_HINTS, number>>;

function detectHeaderRow(rows: ParsedRow[]): { headerIndex: number; columns: ColumnMap } | null {
  for (let i = 0; i < Math.min(rows.length, 30); i++) {
    const row = rows[i];
    const columns: ColumnMap = {};
    let matches = 0;

    row.cells.forEach((cell, index) => {
      const text = cell.text.toLowerCase();
      for (const [key, patterns] of Object.entries(HEADER_HINTS)) {
        if (patterns.some((p) => p.test(text))) {
          columns[key as keyof ColumnMap] = index;
          matches++;
        }
      }
    });

    if (matches >= 2) {
      return { headerIndex: i, columns };
    }
  }
  return null;
}

function cellAt(row: ParsedRow, index: number | undefined): string {
  if (index === undefined || index < 0 || index >= row.cells.length) return "";
  return row.cells[index].text.trim();
}

function parseTableRow(row: ParsedRow, columns: ColumnMap): BusyProductRow | null {
  const name = cellAt(row, columns.name) || row.cells[0]?.text || "";
  let barcode = cellAt(row, columns.barcode);
  const sku = cellAt(row, columns.sku);
  const mrp = parseNumber(cellAt(row, columns.mrp));
  const sellingPrice = parseNumber(cellAt(row, columns.sellingPrice));
  const stock = parseNumber(cellAt(row, columns.stock));

  if (!barcode) {
    for (const cell of row.cells) {
      const match = cell.text.match(/\b(\d{8,14})\b/);
      if (match && isValidBarcode(match[1])) {
        barcode = match[1];
        break;
      }
    }
  }

  const validated = validateBusyProductRow({
    name: name.replace(barcode, "").trim() || name,
    barcode,
    sku,
    mrp,
    sellingPrice,
    stock,
    quantity: stock,
  });

  return validated.valid ? validated.row : null;
}

function parseFallbackLine(line: string): BusyProductRow | null {
  if (isSkippableLine(line)) return null;

  const barcodeMatch = [...line.matchAll(/\b(\d{8,14})\b/g)]
    .map((m) => m[1])
    .find(isValidBarcode);
  if (!barcodeMatch) return null;

  const prices = [...line.matchAll(/(?:₹|Rs\.?)?\s*([\d,]+(?:\.\d{1,2})?)/gi)]
    .map((m) => parseNumber(m[1]))
    .filter((n) => n > 0);

  const qtyMatch = line.match(/(?:qty|quantity|stock|bal(?:ance)?)\s*[:\-]?\s*(\d+(?:\.\d+)?)/i);
  const stock = qtyMatch ? parseNumber(qtyMatch[1]) : 0;

  const skuMatch = line.match(/(?:sku|item\s*code|code)\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-_/]{2,})/i);

  let name = normalizeWhitespace(
    line
      .replace(barcodeMatch, "")
      .replace(/(?:₹|Rs\.?)?\s*[\d,]+(?:\.\d{1,2})?/gi, "")
      .replace(/(?:sku|item\s*code|code)\s*[:\-]?\s*[A-Z0-9\-_/]+/gi, "")
      .replace(/(?:qty|quantity|stock)\s*[:\-]?\s*\d+/gi, "")
  );

  const parts = line.split(/\s{2,}|\t/).map((p) => p.trim()).filter(Boolean);
  if (!isValidProductName(name) && parts.length > 0) {
    const candidate = parts.find(
      (p) =>
        isValidProductName(p) &&
        !p.includes(barcodeMatch) &&
        !/^\d+([.,]\d+)?$/.test(p)
    );
    if (candidate) name = candidate;
  }

  const validated = validateBusyProductRow({
    name,
    barcode: barcodeMatch,
    sku: skuMatch?.[1],
    mrp: prices[0],
    sellingPrice: prices[1] ?? prices[0],
    stock,
    quantity: stock,
  });

  return validated.valid ? validated.row : null;
}

function dedupeRows(rows: BusyProductRow[]): BusyProductRow[] {
  const map = new Map<string, BusyProductRow>();
  for (const row of rows) {
    const existing = map.get(row.barcode);
    if (!existing) {
      map.set(row.barcode, row);
      continue;
    }
    map.set(row.barcode, {
      ...existing,
      stock: Math.max(existing.stock, row.stock),
      quantity: Math.max(existing.quantity, row.quantity),
      mrp: row.mrp > 0 ? row.mrp : existing.mrp,
      sellingPrice: row.sellingPrice > 0 ? row.sellingPrice : existing.sellingPrice,
    });
  }
  return [...map.values()];
}

export async function parseBusyPDF(buffer: ArrayBuffer): Promise<BusyParseResult> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const { existsSync } = await import("fs");
  const path = await import("path");
  const { pathToFileURL } = await import("url");

  if (typeof window === "undefined") {
    const workerCandidates = [
      path.join(process.cwd(), "node_modules", "pdfjs-dist", "legacy", "build", "pdf.worker.mjs"),
      path.join(process.cwd(), "node_modules", "pdfjs-dist", "build", "pdf.worker.mjs"),
    ];
    const workerPath = workerCandidates.find((candidate) => existsSync(candidate));
    if (workerPath) {
      pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;
    }
  }

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    disableFontFace: true,
    verbosity: 0,
  });

  const pdf = await Promise.race([
    loadingTask.promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("PDF parsing timed out after 60 seconds. Try exporting as CSV instead.")), 60000)
    ),
  ]);
  const parsedRows: BusyProductRow[] = [];
  const errors: string[] = [];
  const skipped: string[] = [];
  let totalLinesScanned = 0;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const rows = groupTextIntoRows(textContent.items as TextItem[]);
    totalLinesScanned += rows.length;

    const header = detectHeaderRow(rows);

    if (header) {
      for (let i = header.headerIndex + 1; i < rows.length; i++) {
        const row = rows[i];
        if (isSkippableLine(row.raw)) continue;

        const product = parseTableRow(row, header.columns);
        if (product) {
          parsedRows.push(product);
        } else if (row.raw.length > 5 && /\d{8,14}/.test(row.raw)) {
          const reason = validateBusyProductRow({
            name: row.cells[0]?.text,
            barcode: row.raw.match(/\b(\d{8,14})\b/)?.[1],
            mrp: 0,
            sellingPrice: 0,
            stock: 0,
          });
          if (!reason.valid) {
            skipped.push(`Page ${pageNum}: ${reason.reason} — "${row.raw.slice(0, 80)}"`);
          }
        }
      }
    } else {
      for (const row of rows) {
        if (isSkippableLine(row.raw)) continue;
        const product = parseFallbackLine(row.raw);
        if (product) {
          parsedRows.push(product);
        }
      }
    }
  }

  const uniqueRows = dedupeRows(parsedRows);

  if (uniqueRows.length === 0) {
    errors.push(
      "No valid products found in PDF. Ensure the file is a BUSY stock/item export with product name, barcode, and price columns."
    );
  }

  return {
    rows: uniqueRows,
    errors,
    skipped,
    totalLinesScanned,
  };
}

function detectCsvDelimiter(line: string): string {
  const tabs = (line.match(/\t/g) || []).length;
  const commas = (line.match(/,/g) || []).length;
  return tabs > commas ? "\t" : ",";
}

function matchCsvColumn(header: string): keyof typeof HEADER_HINTS | null {
  const normalized = header.trim().toLowerCase();
  for (const [key, patterns] of Object.entries(HEADER_HINTS)) {
    if (patterns.some((pattern) => pattern.test(normalized))) {
      return key as keyof typeof HEADER_HINTS;
    }
  }
  if (/name/i.test(normalized)) return "name";
  if (/barcode|ean|upc/i.test(normalized)) return "barcode";
  if (/sku|code|hsn/i.test(normalized)) return "sku";
  if (/mrp/i.test(normalized)) return "mrp";
  if (/sale|sell|rate|price|sp/i.test(normalized)) return "sellingPrice";
  if (/stock|qty|quantity|balance/i.test(normalized)) return "stock";
  return null;
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }

  cells.push(current.trim());
  return cells;
}

export function parseBusyCSV(text: string): BusyParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const errors: string[] = [];
  const skipped: string[] = [];

  if (lines.length < 2) {
    return {
      rows: [],
      errors: ["CSV file is empty or has no data rows."],
      skipped,
      totalLinesScanned: lines.length,
    };
  }

  const delimiter = detectCsvDelimiter(lines[0]);
  const headers = parseCsvLine(lines[0], delimiter);
  const columnMap: Partial<Record<keyof typeof HEADER_HINTS, number>> = {};

  headers.forEach((header, index) => {
    const key = matchCsvColumn(header);
    if (key) columnMap[key] = index;
  });

  if (columnMap.name === undefined || columnMap.barcode === undefined) {
    return {
      rows: [],
      errors: [
        "CSV must include columns for product name and barcode (e.g. Item Name, Barcode, MRP, Sale Rate, Stock).",
      ],
      skipped,
      totalLinesScanned: lines.length,
    };
  }

  const parsedRows: BusyProductRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i], delimiter);
    if (cells.every((cell) => !cell)) continue;

    const getCell = (key: keyof typeof HEADER_HINTS) => {
      const index = columnMap[key];
      return index === undefined ? "" : cells[index] || "";
    };

    const row: Partial<BusyProductRow> = {
      name: getCell("name"),
      barcode: getCell("barcode").replace(/\D/g, ""),
      sku: getCell("sku"),
      mrp: parseNumber(getCell("mrp")),
      sellingPrice: parseNumber(getCell("sellingPrice")),
      stock: parseNumber(getCell("stock")),
    };

    const validation = validateBusyProductRow(row);
    if (validation.valid) {
      parsedRows.push(validation.row);
    } else {
      skipped.push(`Row ${i + 1}: ${validation.reason}`);
    }
  }

  const uniqueRows = dedupeRows(parsedRows);

  if (uniqueRows.length === 0) {
    errors.push("No valid products found in CSV.");
  }

  return {
    rows: uniqueRows,
    errors,
    skipped,
    totalLinesScanned: lines.length - 1,
  };
}
