"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { ScanLine, Trash2, Plus, Minus } from "lucide-react";
import { PosReceiptPrint } from "@/components/admin/pos-receipt-print";
import type { PosReceiptData } from "@/components/admin/pos-receipt";

interface CartItem {
  productId: string;
  name: string;
  sku: string;
  barcode: string;
  price: number;
  quantity: number;
  discount: number;
  stock: number;
}

export function PosSystem() {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [billDiscount, setBillDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<PosReceiptData | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function scanBarcode(code: string) {
    if (!code.trim()) return;
    setError("");

    try {
      const res = await fetch(`/api/products/barcode/${encodeURIComponent(code.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Product not found");
        setBarcodeInput("");
        return;
      }

      const existing = cart.find((item) => item.productId === data.id);
      if (existing) {
        if (existing.quantity >= (data.inventory?.quantity || 0)) {
          setError("Insufficient stock");
          return;
        }
        setCart(
          cart.map((item) =>
            item.productId === data.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        const price = parseFloat(data.sellingPrice);
        setCart([
          ...cart,
          {
            productId: data.id,
            name: data.name,
            sku: data.sku,
            barcode: data.barcodes?.[0]?.code || code,
            price,
            quantity: 1,
            discount: 0,
            stock: data.inventory?.quantity || 0,
          },
        ]);
      }

      setBarcodeInput("");
      inputRef.current?.focus();
    } catch {
      setError("Failed to lookup product");
    }
  }

  function updateQuantity(productId: string, delta: number) {
    setCart(
      cart
        .map((item) => {
          if (item.productId !== productId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0 || newQty > item.stock) return item;
          return { ...item, quantity: newQty };
        })
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(productId: string) {
    setCart(cart.filter((item) => item.productId !== productId));
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity - item.discount, 0);
  const grandTotal = subtotal - billDiscount;

  async function completeSale() {
    if (cart.length === 0) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/pos/sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            discount: item.discount,
          })),
          customerName: customerName || undefined,
          customerPhone: customerPhone || undefined,
          paymentMethod,
          discount: billDiscount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Sale failed");
        return;
      }

      setReceipt(data as PosReceiptData);
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setBillDiscount(0);
      inputRef.current?.focus();
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {receipt && (
        <PosReceiptPrint receipt={receipt} onClose={() => setReceipt(null)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ScanLine className="h-5 w-5 text-red-500" />
              Scan Barcode
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                placeholder="Scan barcode or type SKU..."
                className="bg-white/5 border-white/10 text-lg h-12"
                autoFocus
              />
            </form>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Cart ({cart.length} items)</CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <p className="text-white/50 text-center py-8">Scan a product to begin</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-white/60">Product</TableHead>
                    <TableHead className="text-white/60">Price</TableHead>
                    <TableHead className="text-white/60">Qty</TableHead>
                    <TableHead className="text-white/60">Total</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.map((item) => (
                    <TableRow key={item.productId} className="border-white/10">
                      <TableCell>
                        <div className="text-white font-medium">{item.name}</div>
                        <div className="text-xs text-white/40">{item.sku}</div>
                      </TableCell>
                      <TableCell className="text-white">{formatCurrency(item.price)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.productId, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-white w-6 text-center">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.productId, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        {formatCurrency(item.price * item.quantity - item.discount)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Bill Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-white/60">Customer Name</label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/60">Phone</label>
              <Input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/60">Payment Method</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="POS">POS Terminal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/60">Bill Discount</label>
              <Input
                type="number"
                value={billDiscount}
                onChange={(e) => setBillDiscount(parseFloat(e.target.value) || 0)}
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="border-t border-white/10 pt-4 space-y-2">
              <div className="flex justify-between text-white/60">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {billDiscount > 0 && (
                <div className="flex justify-between text-red-400">
                  <span>Discount</span>
                  <span>-{formatCurrency(billDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-white">
                <span>Grand Total</span>
                <span className="text-red-500">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <Button
              variant="luxury"
              className="w-full h-12 text-lg"
              onClick={completeSale}
              disabled={cart.length === 0 || loading}
            >
              {loading ? "Processing..." : "Complete Sale & Print Receipt"}
            </Button>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
