"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanLine, Package, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ScannedProduct {
  id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  barcode: string;
  currentStock: number;
}

export function ScanRestockForm() {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<ScannedProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [restocking, setRestocking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function scanBarcode(code: string) {
    const trimmed = code.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setSuccess("");
    setProduct(null);

    try {
      const res = await fetch(`/api/products/barcode/${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Product not found in catalog. Import it via BUSY Import first.");
        setBarcodeInput("");
        return;
      }

      setProduct({
        id: data.id,
        name: data.name,
        sku: data.sku,
        sellingPrice: parseFloat(data.sellingPrice),
        barcode: data.barcodes?.[0]?.code || trimmed,
        currentStock: data.inventory?.quantity ?? 0,
      });
      setQuantity(1);
      setBarcodeInput("");
    } catch {
      setError("Failed to lookup product");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  async function addToStock() {
    if (!product || quantity < 1) return;

    setRestocking(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/inventory/restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          notes: `Scan restock via barcode ${product.barcode}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add stock");
        return;
      }

      setSuccess(
        `Added ${data.quantityAdded} unit(s) to ${data.productName}. New stock: ${data.newStock}`
      );
      setProduct({
        ...product,
        currentStock: data.newStock,
      });
      setQuantity(1);
      inputRef.current?.focus();
    } catch {
      setError("Connection error");
    } finally {
      setRestocking(false);
    }
  }

  function clearProduct() {
    setProduct(null);
    setQuantity(1);
    setSuccess("");
    setError("");
    inputRef.current?.focus();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-red-500" />
            Scan Product Barcode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-white/60 text-sm">
            Scan a product barcode to find it in your catalog, then enter how many units to add back to stock.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              scanBarcode(barcodeInput);
            }}
          >
            <Input
              ref={inputRef}
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Scan or type barcode..."
              className="bg-white/5 border-white/10 text-lg h-12"
              disabled={loading}
              autoFocus
            />
          </form>
          {loading && <p className="text-amber-400 text-sm">Looking up product...</p>}
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </CardContent>
      </Card>

      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-red-500" />
            Add Stock
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!product ? (
            <p className="text-white/50 text-center py-12">Scan a barcode to load a product</p>
          ) : (
            <>
              <div className="glass-card p-4 border-white/10 space-y-2">
                <p className="font-semibold text-white text-lg">{product.name}</p>
                <p className="text-sm text-white/60">SKU: {product.sku}</p>
                <p className="text-sm text-white/60">Barcode: {product.barcode}</p>
                <p className="text-sm text-white/60">Price: {formatCurrency(product.sellingPrice)}</p>
                <p className="text-sm">
                  Current stock:{" "}
                  <span className={product.currentStock <= 0 ? "text-red-400 font-semibold" : "text-emerald-400 font-semibold"}>
                    {product.currentStock}
                  </span>
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/60">Quantity to add</label>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="bg-white/5 border-white/10 text-lg h-12"
                />
              </div>

              {success && (
                <div className="flex items-start gap-2 text-green-400 text-sm">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="luxury"
                  className="flex-1"
                  onClick={addToStock}
                  disabled={restocking || quantity < 1}
                >
                  {restocking ? "Adding..." : `Add ${quantity} to Stock`}
                </Button>
                <Button variant="outline" onClick={clearProduct} className="border-white/10 text-white">
                  Scan Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
