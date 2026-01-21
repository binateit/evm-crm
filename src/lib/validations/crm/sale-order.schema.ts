import { z } from "zod";

export const saleOrderItemSchema = z.object({
  // Row identification
  rowId: z.string(),

  // SKU basic info
  skuId: z.string().min(1, "SKU is required"),
  skuName: z.string().nullable(),
  skuCode: z.string().nullable(),
  brandName: z.string().nullable(),
  categoryName: z.string().nullable(),

  // Pricing & stock
  sellingPrice: z.number(),
  availableStock: z.number(),

  // Tax & discount
  pdc: z.number(), // Prepaid discount
  cdc: z.number(), // Credit discount

  // Additional fields
  hsnCode: z.string().nullable(),
  etd: z.string().nullable(),

  // Order line fields (user inputs)
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  discountPercent: z.number().min(0).max(100),
  taxPercent: z.number().min(0).max(100),
  cgstPercent: z.number().min(0).max(100),
  sgstPercent: z.number().min(0).max(100),
  igstPercent: z.number().min(0).max(100),

  // Calculated fields (derived values)
  subTotal: z.number(),
  discountAmount: z.number(),
  taxableAmount: z.number(),
  cgstAmount: z.number(),
  sgstAmount: z.number(),
  igstAmount: z.number(),
  taxAmount: z.number(),
  totalAmount: z.number(),

  // Promotion fields
  isLocked: z.boolean().optional(),
  promotionId: z.string().optional(),
  promotionCode: z.string().optional(),
  claimedFreeQuantity: z.number().optional(),
  isOfferItem: z.boolean().optional(),
  billWhenStockArrives: z.boolean().optional(),
  remarks: z.string().optional(),
});

export const saleOrderSchema = z.object({
  deliveryLocationId: z.string().min(1, "Delivery location is required"),
  paymentTypeId: z.number().min(1, "Payment type is required"),
  items: z.array(saleOrderItemSchema).min(1, "At least one item is required"),
});

export type SaleOrderFormData = z.infer<typeof saleOrderSchema>;
export type SaleOrderItemFormData = z.infer<typeof saleOrderItemSchema>;
