export interface PosReceiptData {
  orderNumber: string;
  invoiceNumber: string;
  invoiceDate: string;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  customerName?: string | null;
  customerPhone?: string | null;
  paymentMethod?: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  items: {
    name: string;
    sku: string;
    barcode?: string | null;
    quantity: number;
    price: number;
    discount: number;
    tax: number;
    total: number;
  }[];
}
