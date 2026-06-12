"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText } from "lucide-react";

export function BusyImportForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<{
    addedCount: number;
    updatedCount: number;
    failedCount: number;
    skippedCount?: number;
    parsedCount?: number;
    totalLinesScanned?: number;
    errors: string[];
  } | null>(null);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  function pickFile(selected: File | null) {
    if (!selected) return;
    const name = selected.name.toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".csv")) {
      setError("Only PDF and CSV files are supported.");
      return;
    }
    setError("");
    setResult(null);
    setFile(selected);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files?.[0] || null);
  }, []);

  async function handleImport() {
    if (!file || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    setStatus("Uploading file...");

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const formData = new FormData();
    formData.append("file", file);

    const timeoutId = window.setTimeout(() => controller.abort(), 120000);

    try {
      setStatus(file.name.toLowerCase().endsWith(".pdf") ? "Parsing PDF..." : "Parsing CSV...");
      const res = await fetch("/api/import/busy", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      const text = await res.text();
      let data: {
        error?: string;
        parsedCount?: number;
        addedCount?: number;
        updatedCount?: number;
        failedCount?: number;
        skippedCount?: number;
        totalLinesScanned?: number;
        errors?: string[];
      } = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("Server returned an invalid response. Restart the dev server and try again.");
      }

      if (!res.ok) {
        setError(data.error || "Import failed");
        if (data.parsedCount !== undefined) {
          setResult({
            addedCount: data.addedCount ?? 0,
            updatedCount: data.updatedCount ?? 0,
            failedCount: data.failedCount ?? 0,
            skippedCount: data.skippedCount,
            parsedCount: data.parsedCount,
            totalLinesScanned: data.totalLinesScanned,
            errors: data.errors ?? [],
          });
        }
        return;
      }

      setResult({
        addedCount: data.addedCount ?? 0,
        updatedCount: data.updatedCount ?? 0,
        failedCount: data.failedCount ?? 0,
        skippedCount: data.skippedCount,
        parsedCount: data.parsedCount,
        totalLinesScanned: data.totalLinesScanned,
        errors: data.errors ?? [],
      });
      setFile(null);
      setStatus("Import complete.");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Import timed out after 2 minutes. Try a smaller file or export as CSV.");
      } else {
        setError(err instanceof Error ? err.message : "Connection error");
      }
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
      setStatus("");
    }
  }

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Upload className="h-5 w-5 text-red-500" />
          Upload Stock File
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-white/60 text-sm">
          Upload a BUSY stock/item list PDF or CSV export. CSV imports faster and is recommended if PDF hangs.
          Only real rows with name, barcode, price, and stock are synced.
        </p>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver ? "border-red-500/50 bg-red-500/5" : "border-white/10"
          }`}
        >
          <FileText className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p className="text-white mb-2">Drag and drop your PDF or CSV here</p>
          <label className="inline-block">
            <input
              type="file"
              accept=".pdf,.csv"
              onChange={(e) => pickFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <span className="inline-flex items-center justify-center rounded-md border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5 cursor-pointer">
              Browse Files
            </span>
          </label>
          {file && <p className="text-white mt-4 text-sm">Selected: {file.name}</p>}
        </div>

        {loading && status && <p className="text-amber-400 text-sm">{status}</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {result && (
          <div className="glass-card p-4 border-white/10 space-y-2">
            <p className="text-green-400 font-medium">
              {result.parsedCount === 0 ? "No Valid Products Found" : "Import Complete"}
            </p>
            {result.parsedCount !== undefined && (
              <p className="text-white/60 text-sm">Valid products parsed: {result.parsedCount}</p>
            )}
            <p className="text-white/60 text-sm">Added: {result.addedCount}</p>
            <p className="text-white/60 text-sm">Updated: {result.updatedCount}</p>
            <p className="text-white/60 text-sm">Skipped (invalid): {result.skippedCount ?? 0}</p>
            <p className="text-white/60 text-sm">Failed: {result.failedCount}</p>
            {result.errors.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto">
                <p className="text-red-400 text-sm font-medium">Details:</p>
                {result.errors.slice(0, 20).map((err, i) => (
                  <p key={i} className="text-red-400/70 text-xs">{err}</p>
                ))}
              </div>
            )}
          </div>
        )}

        <Button
          variant="luxury"
          onClick={handleImport}
          disabled={!file || loading}
          className="w-full"
        >
          {loading ? "Importing..." : "Import & Sync Products"}
        </Button>
      </CardContent>
    </Card>
  );
}
