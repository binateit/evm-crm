/**
 * Order Item Type Definition
 * Used for both Purchase Orders and Sale Orders
 */
export interface OrderItem {
  // Row identification
  rowId: string;

  // SKU basic info
  skuId: string;
  skuName: string | null;
  skuCode: string | null;
  brandName: string | null;
  categoryName: string | null;

  // Pricing & stock
  sellingPrice: number;
  availableStock: number;

  // Tax & discount
  pdc: number; // Prepaid discount
  cdc: number; // Credit discount

  // Additional fields
  hsnCode: string | null;
  etd: string | null; // Expected delivery date

  // Order line fields (user inputs)
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
  cgstPercent: number;
  sgstPercent: number;
  igstPercent: number;

  // Calculated fields (derived values)
  subTotal: number; // unitPrice × quantity
  discountAmount: number; // discount in currency
  taxableAmount: number; // after discount, before tax
  cgstAmount: number; // CGST in currency (0 for inter-state)
  sgstAmount: number; // SGST in currency (0 for inter-state)
  igstAmount: number; // IGST in currency (0 for intra-state)
  taxAmount: number; // total tax (cgst + sgst + igst)
  totalAmount: number; // final line total

  // Promotion fields (for claimed promotions)
  isLocked?: boolean; // Prevents editing/deletion when true
  promotionId?: string; // Source promotion ID
  promotionCode?: string; // For display/tracking
  claimedFreeQuantity?: number; // Free units from promotion
  isOfferItem?: boolean; // True for free/benefit items in promotions
  billWhenStockArrives?: boolean; // Bill when stock arrives flag
  remarks?: string; // Item remarks
}
