import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-12 text-white">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">System Settings</h1>
          <p className="text-white/60 mt-1">Configure global store metadata, fallback pricing metrics, and environment flags.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
              Dashboard
            </Button>
          </Link>
          <Button className="bg-red-500 hover:bg-red-600 text-white">
            Save Preferences
          </Button>
        </div>
      </div>

      {/* Wireframe Setting Configuration Groups */}
      <div className="glass-card luxury-border rounded p-8 bg-white/[0.01] max-w-2xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between p-4 bg-white/5 rounded border border-white/10">
          <div>
            <h3 className="font-semibold text-white">Maintenance Mode</h3>
            <p className="text-xs text-white/50 mt-0.5">Redirect store traffic to a temporary fallback maintenance cover segment.</p>
          </div>
          <span className="text-xs font-mono font-bold bg-white/5 text-white/40 px-2 py-1 rounded border border-white/5 uppercase">Offline</span>
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 rounded border border-white/10">
          <div>
            <h3 className="font-semibold text-white">Secure POS Sessions</h3>
            <p className="text-xs text-white/50 mt-0.5">Enforce continuous token rotation cycles across in-store billing checkout layers.</p>
          </div>
          <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20 uppercase">Active</span>
        </div>
      </div>
    </div>
  );
}
