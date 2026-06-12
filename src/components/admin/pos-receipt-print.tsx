"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { PosReceiptData } from "@/components/admin/pos-receipt";

interface PosReceiptProps {
  receipt: PosReceiptData;
  onClose: () => void;
  autoPrint?: boolean;
}

export function PosReceiptPrint({ receipt, onClose, autoPrint = true }: PosReceiptProps) {
  const printedRef = useRef(false);

  useEffect(() => {
    if (autoPrint && !printedRef.current) {
      printedRef.current = true;
      window.setTimeout(() => window.print(), 300);
    }
  }, [autoPrint]);

  return (
    <>
      <div className="glass-card border-white/10 p-6 space-y-4 print:hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-display text-xl">Receipt Ready</h3>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()} className="border-white/10 text-white">
              Print Again
            </Button>
            <Button variant="ghost" onClick={onClose} className="text-white/60">
              Close
            </Button>
          </div>
        </div>
        <p className="text-green-400 text-sm">
          Sale {receipt.orderNumber} · Invoice {receipt.invoiceNumber}
        </p>
      </div>

      <div id="pos-receipt-print" className="hidden print:block bg-white text-black p-6 text-sm max-w-[80mm] mx-auto">
        <div className="text-center border-b border-black/20 pb-3 mb-3">
          <h1 className="text-lg font-bold">{receipt.storeName}</h1>
          <p className="text-xs mt-1 whitespace-pre-line">{receipt.storeAddress}</p>
          <p className="text-xs mt-1">Tel: {receipt.storePhone}</p>
        </div>

        <div className="space-y-1 text-xs mb-3">
          <p><strong>Invoice:</strong> {receipt.invoiceNumber}</p>
          <p><strong>Order:</strong> {receipt.orderNumber}</p>
          <p><strong>Date:</strong> {formatDateTime(receipt.invoiceDate)}</p>
          {receipt.customerName && <p><strong>Customer:</strong> {receipt.customerName}</p>}
          {receipt.customerPhone && <p><strong>Phone:</strong> {receipt.customerPhone}</p>}
          {receipt.paymentMethod && <p><strong>Payment:</strong> {receipt.paymentMethod}</p>}
        </div>

        <table className="w-full text-xs mb-3">
          <thead>
            <tr className="border-b border-black/20">
              <th className="text-left py-1">Item</th>
              <th className="text-right py-1">Qty</th>
              <th className="text-right py-1">Amt</th>
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((item, index) => (
              <tr key={index} className="border-b border-black/10 align-top">
                <td className="py-1 pr-2">
                  <div>{item.name}</div>
                  <div className="text-[10px] text-black/60">{item.sku}</div>
                </td>
                <td className="py-1 text-right">{item.quantity}</td>
                <td className="py-1 text-right">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-black/20 pt-2 space-y-1 text-xs">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(receipt.subtotal)}</span></div>
          {receipt.discount > 0 && (
            <div className="flex justify-between"><span>Discount</span><span>-{formatCurrency(receipt.discount)}</span></div>
          )}
          {receipt.tax > 0 && (
            <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(receipt.tax)}</span></div>
          )}
          <div className="flex justify-between font-bold text-base pt-1">
            <span>Total</span>
            <span>{formatCurrency(receipt.grandTotal)}</span>
          </div>
        </div>

        <p className="text-center text-xs mt-4 pt-3 border-t border-black/20">
          Thank you for shopping with {receipt.storeName}
        </p>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #pos-receipt-print,
          #pos-receipt-print * {
            visibility: visible;
          }
          #pos-receipt-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
