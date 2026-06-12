import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BusyImportForm } from "@/components/admin/busy-import-form";
import prisma from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminImportPage() {
  const recentImports = await prisma.busyImportLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="container mx-auto px-4 py-12 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">BUSY Import</h1>
          <p className="text-white/60 mt-1">
            Upload BUSY PDF or CSV stock lists to sync real products into your catalog.
          </p>
        </div>
        <Link href="/admin/barcodes">
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
            Barcodes
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <BusyImportForm />
        </div>

        <div className="glass-card luxury-border rounded bg-white/[0.01] p-6 h-fit">
          <h2 className="text-lg font-bold mb-4">Recent Imports</h2>
          {recentImports.length === 0 ? (
            <p className="text-white/50 text-sm">No imports yet.</p>
          ) : (
            <div className="space-y-4">
              {recentImports.map((log) => (
                <div key={log.id} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                  <p className="font-medium text-sm truncate">{log.fileName}</p>
                  <p className="text-xs text-white/40 mt-1">{formatDateTime(log.createdAt)}</p>
                  <p className="text-xs text-white/60 mt-2">
                    Added {log.addedCount} · Updated {log.updatedCount} · Failed {log.failedCount}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
