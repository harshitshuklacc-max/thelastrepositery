import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { processBusyImport } from "@/services/busy-import";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf") && !file.name.toLowerCase().endsWith(".csv")) {
      return NextResponse.json(
        { error: "Only PDF and CSV files are supported" },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const result = await processBusyImport(buffer, file.name, session.sub);

    if (result.parsedCount === 0) {
      return NextResponse.json(
        {
          ...result,
          error:
            "No valid products found in PDF. Use a BUSY item/stock list export with product name, barcode, and price.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("BUSY import error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Import failed" },
      { status: 500 }
    );
  }
}
